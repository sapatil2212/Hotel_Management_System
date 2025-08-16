import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
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
    const { email, otp, type } = body

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: 'Email, OTP, and type are required' },
        { status: 400 }
      )
    }

    if (!['email', 'password'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid OTP type' },
        { status: 400 }
      )
    }

    // Verify OTP using the service
    const isValid = OTPService.verifyOTP(email, type, otp)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      verified: true
    })
  } catch (error) {
    console.error('Error in verify OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
