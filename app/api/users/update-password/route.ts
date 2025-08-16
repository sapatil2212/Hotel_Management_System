import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { OTPService } from '@/lib/otp-service'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, otp } = body

    if (!currentPassword || !newPassword || !otp) {
      return NextResponse.json(
        { error: 'Current password, new password, and OTP are required' },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Get current user with password hash
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.passwordHash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Verify OTP
    const isOTPValid = OTPService.verifyOTP(currentUser.email, 'password', otp)
    
    if (!isOTPValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: 'Password updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
