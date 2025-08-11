import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendEmail } from "@/lib/email"

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  role: z.enum(["OWNER", "ADMIN", "RECEPTION"]),
  psk: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.issues.map((i) => ({
            code: i.code,
            path: i.path,
            message: i.message,
          })),
        },
        { status: 422 }
      )
    }
    const { name, email, phone, role, psk } = parsed.data

    if (!process.env.PSK || psk !== process.env.PSK) {
      return NextResponse.json({ error: "Invalid security key" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const now = new Date()

    // upsert OTP
    await prisma.emailotp.upsert({
      where: { email },
      create: { 
        id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email, 
        code, 
        purpose: "register",
        expiresAt,
        updatedAt: now
      },
      update: { code, expiresAt, attempts: 0, updatedAt: now },
    })

    const html = `
      <div style="font-family: sans-serif;">
        <h2>Verify your email</h2>
        <p>Hi ${name}, use the following OTP to complete your registration:</p>
        <p style="font-size: 24px; font-weight: bold;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `
    await sendEmail({ to: email, subject: "Your HMS verification code", html })

    return NextResponse.json({ ok: true, message: "OTP sent to email" })
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Failed to request OTP"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}


