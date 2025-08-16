const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupTestNotifications() {
  try {
    console.log('🧹 Cleaning up test notifications...')

    // Get the first user
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No users found.')
      return
    }

    console.log(`👤 Using user: ${user.name} (${user.email})`)

    // Count notifications before cleanup
    const notificationsBefore = await prisma.notification.count({
      where: {
        OR: [
          { userId: user.id },
          { userId: null }
        ]
      }
    })

    console.log(`📊 Notifications before cleanup: ${notificationsBefore}`)

    // Delete all test notifications (those created by seed scripts)
    const deletedCount = await prisma.notification.deleteMany({
      where: {
        OR: [
          {
            title: {
              in: [
                'Test Notification',
                'New Booking Received',
                'Payment Received', 
                'Revenue Added',
                'Expense Recorded',
                'Bill Generated',
                'System Maintenance'
              ]
            }
          },
          {
            message: {
              contains: 'John Doe'
            }
          },
          {
            message: {
              contains: 'Jane Smith'
            }
          },
          {
            message: {
              contains: 'Test Guest'
            }
          }
        ]
      }
    })

    console.log(`🗑️ Deleted ${deletedCount.count} test notifications`)

    // Count notifications after cleanup
    const notificationsAfter = await prisma.notification.count({
      where: {
        OR: [
          { userId: user.id },
          { userId: null }
        ]
      }
    })

    console.log(`📊 Notifications after cleanup: ${notificationsAfter}`)

    // List remaining notifications
    const remainingNotifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    if (remainingNotifications.length === 0) {
      console.log('\n📋 No notifications remaining - clean slate!')
    } else {
      console.log('\n📋 Remaining notifications:')
      remainingNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} - ${notif.message} (${notif.isRead ? 'Read' : 'Unread'})`)
      })
    }

    console.log('\n✅ Test notifications cleaned up successfully!')
    console.log('🎯 Now create a real booking to see actual notifications!')

  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestNotifications()
