import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('OTP verification started')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const parsed = verifyOtpSchema.safeParse(body)
    
    if (!parsed.success) {
      console.log('Validation failed:', parsed.error.errors)
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const { email, otp } = parsed.data
    console.log('Looking for OTP:', { email, otp })

    // Check if prisma is available
    if (!prisma) {
      console.error('Prisma client is undefined')
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    // Find the OTP record
    const otpRecord = await prisma.emailotp.findFirst({
             where: {
         email,
         code: otp,
         purpose: 'reset_password',
         expiresAt: {
           gt: new Date()
         }
       }
    })
    
    console.log('OTP record found:', otpRecord)

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Delete the OTP record after successful verification
    await prisma.emailotp.delete({
      where: { id: otpRecord.id }
    })

    return NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
