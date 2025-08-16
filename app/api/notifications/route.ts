import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NotificationService } from '@/lib/notification-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')

    // Build where clause
    const where: any = {
      OR: [
        { userId: user.id },
        { userId: null } // System-wide notifications
      ]
    }

    if (type) {
      where.type = type
    }

    if (isRead !== null) {
      where.isRead = isRead === 'true'
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Get unread count
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    // Get total count
    const totalCount = await prisma.notification.count({ where })

    return NextResponse.json({
      notifications,
      unreadCount,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, userId, referenceId, referenceType } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    const notification = await NotificationService.createNotification({
      title,
      message,
      type,
      userId,
      referenceId,
      referenceType
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
