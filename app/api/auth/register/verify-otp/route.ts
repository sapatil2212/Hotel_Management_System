import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const verifySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  role: z.enum(["OWNER", "ADMIN", "RECEPTION"]),
  password: z.string().min(6),
  code: z.string().length(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = verifySchema.safeParse(body)
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
    const { name, email, phone, role, password, code } = parsed.data

    const otp = await prisma.emailotp.findUnique({ where: { email } })
    if (!otp) return NextResponse.json({ error: "No OTP requested" }, { status: 400 })

    if (otp.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 })
    }

    if (otp.attempts >= 5) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 400 })
    }

    if (otp.code !== code) {
      await prisma.emailotp.update({ 
        where: { email }, 
        data: { 
          attempts: { increment: 1 },
          updatedAt: new Date()
        } 
      })
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()

    await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        phone,
        role: role as any,
        passwordHash,
        emailVerifiedAt: now,
        updatedAt: now,
      },
    })

    await prisma.emailotp.delete({ where: { email } })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Failed to verify OTP"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}


