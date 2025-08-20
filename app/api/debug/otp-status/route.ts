import { NextRequest, NextResponse } from 'next/server'
import { OTPService } from '@/lib/otp-service'

export async function GET(request: NextRequest) {
  try {
    const allOTPs = await OTPService.getAllStoredOTPs()
    const otpArray = Array.from(allOTPs.entries())
    
    return NextResponse.json({
      message: 'OTP Storage Status',
      totalOTPs: allOTPs.size,
      otps: otpArray.map(([key, data]) => ({
        key,
        otp: data.otp,
        expiresAt: data.expiresAt,
        type: data.type,
        isExpired: new Date() > data.expiresAt
      }))
    })
  } catch (error) {
    console.error('Error getting OTP status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
