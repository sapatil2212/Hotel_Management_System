import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { OTPService } from '@/lib/otp-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, type } = body

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    if (!['email', 'password'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid OTP type' },
        { status: 400 }
      )
    }

    // Generate and store OTP
    const otp = OTPService.generateOTP()
    OTPService.storeOTP(email, type, otp)

    // Send email with OTP
    const subject = type === 'email' 
      ? 'Email Change Verification' 
      : 'Password Reset Verification'
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verification Code</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated message from your Hotel Management System.
        </p>
      </div>
    `

    try {
      await sendEmail({
        to: email,
        subject,
        html: htmlContent,
      })

      return NextResponse.json({
        message: 'OTP sent successfully',
        email: email
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
