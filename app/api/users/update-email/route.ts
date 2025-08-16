import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
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
    const { newEmail, otp } = body

    if (!newEmail || !otp) {
      return NextResponse.json(
        { error: 'New email and OTP are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!newEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if new email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: newEmail,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 400 }
      )
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify OTP for current email
    const isOTPValid = OTPService.verifyOTP(currentUser.email, 'email', otp)
    
    if (!isOTPValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Update user email
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: newEmail,
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
      message: 'Email updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating email:', error)
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}
