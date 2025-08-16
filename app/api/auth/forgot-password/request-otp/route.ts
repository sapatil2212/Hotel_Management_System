import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { createOTPEmail } from "@/lib/email-templates"

const requestSchema = z.object({
  email: z.string().email(),
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
    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    // 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const now = new Date()

    // upsert OTP
    await prisma.emailotp.upsert({
      where: { email },
      create: { 
        id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email, 
        code, 
        purpose: "reset_password",
        expiresAt,
        updatedAt: now
      },
      update: { code, expiresAt, attempts: 0, updatedAt: now },
    })

    const html = await createOTPEmail(user.name, code)
    await sendEmail({ to: email, subject: "Your HMS password reset code", html })

    return NextResponse.json({ ok: true, message: "OTP sent to email" })
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Failed to send OTP"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
