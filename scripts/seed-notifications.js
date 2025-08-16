const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedNotifications() {
  try {
    console.log('🌱 Seeding notifications...')

    // Get the first user to associate notifications with
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No users found. Please create a user first.')
      return
    }

    const sampleNotifications = [
      {
        title: 'New Booking Received',
        message: 'New booking received from John Doe for Room 101',
        type: 'booking',
        userId: user.id,
        referenceId: 'BL-1234567890',
        referenceType: 'booking'
      },
      {
        title: 'Payment Received',
        message: 'Payment of ₹5000 received via UPI',
        type: 'payment',
        userId: user.id,
        referenceId: 'PAY-1234567890',
        referenceType: 'payment'
      },
      {
        title: 'Revenue Added',
        message: '₹5000 revenue added from accommodation',
        type: 'revenue',
        userId: user.id,
        referenceType: 'booking'
      },
      {
        title: 'Expense Recorded',
        message: 'Expense of ₹1000 recorded: Room maintenance',
        type: 'expense',
        userId: user.id,
        referenceId: 'EXP-1234567890',
        referenceType: 'expense'
      },
      {
        title: 'Bill Generated',
        message: 'Bill generated for Jane Smith - ₹7500',
        type: 'info',
        userId: user.id,
        referenceId: 'INV-1234567890',
        referenceType: 'invoice'
      },
      {
        title: 'System Maintenance',
        message: 'System will be under maintenance from 2-4 AM',
        type: 'system',
        userId: null, // System-wide notification
        referenceType: null
      }
    ]

    for (const notification of sampleNotifications) {
      await prisma.notification.create({
        data: {
          ...notification,
          isRead: false,
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours
        }
      })
    }

    console.log('✅ Notifications seeded successfully!')
    console.log(`📊 Created ${sampleNotifications.length} notifications`)
  } catch (error) {
    console.error('❌ Error seeding notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedNotifications()
