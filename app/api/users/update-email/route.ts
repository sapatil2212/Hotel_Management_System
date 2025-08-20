import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { OTPService } from '@/lib/otp-service'
import { sendEmail } from '@/lib/email'

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

    // Check if OTP was verified by looking for verified OTP in database
    const verifiedOTP = await prisma.emailotp.findUnique({
      where: { email: currentUser.email }
    })
    
    if (!verifiedOTP || verifiedOTP.purpose !== 'email_verified') {
      return NextResponse.json(
        { error: 'OTP not verified. Please verify OTP first.' },
        { status: 400 }
      )
    }

    // Verify the OTP matches
    if (verifiedOTP.code !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please verify OTP first.' },
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

    // Clear the verified OTP after successful update
    await prisma.emailotp.delete({
      where: { email: currentUser.email }
    })

    // Clean up any expired verified OTPs
    await OTPService.cleanupExpiredVerifiedOTPs()

    // Send confirmation emails to both old and new email addresses
    try {
      // Email to the old email address (notification of change)
      const oldEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc3545; margin: 0; font-size: 24px;">Email Address Changed</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello <strong>${currentUser.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We're writing to inform you that your email address for your Hotel Management System account has been successfully changed.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: 600;">
              <strong>Previous Email:</strong> ${currentUser.email}<br>
              <strong>New Email:</strong> ${newEmail}
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            <strong>Important:</strong> You will no longer receive notifications or communications at this email address. 
            All future communications will be sent to your new email address: <strong>${newEmail}</strong>
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            If you did not request this change, please contact our support team immediately.
          </p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #155724; font-size: 14px;">
              <strong>Security Note:</strong> This change was made after successful verification of your identity through OTP.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thank you for using our Hotel Management System.<br>
            Best regards,<br>
            <strong>Hotel Management Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `

      // Email to the new email address (confirmation and welcome)
      const newEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #155724; margin: 0; font-size: 24px;">Email Address Successfully Updated!</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello <strong>${currentUser.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Congratulations! Your email address has been successfully updated for your Hotel Management System account.
          </p>
          
          <div style="background-color: #e8f5e8; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #155724; font-weight: 600;">
              <strong>Your New Email Address:</strong> ${newEmail}
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            <strong>What's Next?</strong>
          </p>
          
          <ul style="color: #333; font-size: 16px; line-height: 1.6;">
            <li>You can now log in to your account using your new email address</li>
            <li>All future notifications and communications will be sent to this email</li>
            <li>Your account security and data remain unchanged</li>
            <li>You can continue using all features of the Hotel Management System</li>
          </ul>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Reminder:</strong> Keep your login credentials secure and never share them with anyone.
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Welcome to your updated account!<br>
            Best regards,<br>
            <strong>Hotel Management Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `

      // Send email to old address
      await sendEmail({
        to: currentUser.email,
        subject: 'Email Address Changed - Hotel Management System',
        html: oldEmailContent,
      })

      // Send email to new address
      await sendEmail({
        to: newEmail,
        subject: 'Email Address Successfully Updated - Hotel Management System',
        html: newEmailContent,
      })

      console.log('Confirmation emails sent successfully to both addresses')
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError)
      // Don't fail the request if email sending fails
    }

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
