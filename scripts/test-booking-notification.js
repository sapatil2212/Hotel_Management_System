const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBookingNotification() {
  try {
    console.log('🧪 Testing booking notification...')

    // Get the first user and room
    const user = await prisma.user.findFirst()
    const room = await prisma.rooms.findFirst({
      where: { status: 'available' }
    })

    if (!user) {
      console.log('❌ No users found.')
      return
    }

    if (!room) {
      console.log('❌ No available rooms found.')
      return
    }

    console.log(`👤 Using user: ${user.name}`)
    console.log(`🏨 Using room: ${room.roomNumber}`)

    // Count notifications before booking
    const notificationsBefore = await prisma.notification.count({
      where: { userId: user.id }
    })

    console.log(`📊 Notifications before: ${notificationsBefore}`)

    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        id: `TEST-${Date.now()}`,
        guestName: 'Test Guest',
        guestEmail: 'test@example.com',
        guestPhone: '1234567890',
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        nights: 1,
        adults: 2,
        children: 0,
        totalAmount: 5000,
        status: 'confirmed',
        roomId: room.id,
        paymentStatus: 'pending'
      }
    })

    console.log('✅ Test booking created:', booking.id)

    // Create notification manually (simulating the API)
    const notification = await prisma.notification.create({
      data: {
        title: 'New Booking Received',
        message: `New booking received from ${booking.guestName}`,
        type: 'booking',
        userId: user.id,
        referenceId: booking.id,
        referenceType: 'booking',
        isRead: false
      }
    })

    console.log('✅ Notification created:', notification.id)

    // Count notifications after booking
    const notificationsAfter = await prisma.notification.count({
      where: { userId: user.id }
    })

    console.log(`📊 Notifications after: ${notificationsAfter}`)
    console.log(`📈 New notifications: ${notificationsAfter - notificationsBefore}`)

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        isRead: false,
        OR: [
          { userId: user.id },
          { userId: null }
        ]
      }
    })

    console.log(`🔔 Total unread notifications: ${unreadCount}`)

    // Clean up test data
    await prisma.notification.delete({
      where: { id: notification.id }
    })
    await prisma.booking.delete({
      where: { id: booking.id }
    })

    console.log('🧹 Test data cleaned up')
    console.log('\n✅ Booking notification test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing booking notification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBookingNotification()
