const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNotifications() {
  try {
    console.log('🧪 Testing notification system...')

    // Get the first user
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No users found. Please create a user first.')
      return
    }

    console.log(`👤 Using user: ${user.name} (${user.email})`)

    // Test creating a notification
    const testNotification = await prisma.notification.create({
      data: {
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working',
        type: 'info',
        userId: user.id,
        isRead: false
      }
    })

    console.log('✅ Test notification created:', testNotification.id)

    // Check unread count
    const unreadCount = await prisma.notification.count({
      where: {
        isRead: false,
        OR: [
          { userId: user.id },
          { userId: null }
        ]
      }
    })

    console.log(`📊 Unread notifications: ${unreadCount}`)

    // List all notifications for this user
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log('\n📋 Recent notifications:')
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.message} (${notif.isRead ? 'Read' : 'Unread'})`)
    })

    console.log('\n✅ Notification system test completed successfully!')
  } catch (error) {
    console.error('❌ Error testing notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNotifications()
