import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const verifyPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
})

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
    const parsed = verifyPasswordSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { currentPassword } = parsed.data

         // Get user with password hash
     const user = await prisma.user.findUnique({
       where: { id: session.user.id },
       select: {
         id: true,
         passwordHash: true,
       }
     })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

         // Verify current password
     const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Current password verified successfully',
      verified: true
    })

  } catch (error) {
    console.error('Error verifying current password:', error)
    return NextResponse.json(
      { error: 'Failed to verify current password' },
      { status: 500 }
    )
  }
}
