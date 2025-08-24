const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRoomTypes() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    console.log('\nChecking room types...')
    const roomTypesCount = await prisma.room.count()
    console.log(`Total room types: ${roomTypesCount}`)

    if (roomTypesCount > 0) {
      const roomTypes = await prisma.room.findMany({
        select: {
          id: true,
          name: true,
          totalRooms: true,
          _count: {
            select: {
              rooms: true
            }
          }
        }
      })

      console.log('\nRoom types found:')
      roomTypes.forEach(rt => {
        console.log(`- ${rt.name} (ID: ${rt.id})`)
        console.log(`  Total rooms: ${rt.totalRooms}`)
        console.log(`  Created rooms: ${rt._count.rooms}`)
        console.log(`  Available slots: ${rt.totalRooms - rt._count.rooms}`)
      })
    } else {
      console.log('❌ No room types found in database')
    }

    console.log('\nChecking individual rooms...')
    const roomsCount = await prisma.rooms.count()
    console.log(`Total individual rooms: ${roomsCount}`)

    if (roomsCount > 0) {
      const rooms = await prisma.rooms.findMany({
        select: {
          id: true,
          roomNumber: true,
          status: true,
          availableForBooking: true,
          roomType: {
            select: {
              name: true
            }
          }
        },
        take: 10
      })

      console.log('\nSample rooms:')
      rooms.forEach(room => {
        console.log(`- ${room.roomNumber} (${room.roomType.name})`)
        console.log(`  Status: ${room.status}`)
        console.log(`  Available for booking: ${room.availableForBooking}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRoomTypes()
