const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Check if tables exist by trying to count records
    console.log('\n📊 Checking table states...')
    
    try {
      const roomTypesCount = await prisma.room.count()
      console.log(`✅ room_types table exists with ${roomTypesCount} records`)
    } catch (error) {
      console.log('❌ room_types table error:', error.message)
    }

    try {
      const roomsCount = await prisma.rooms.count()
      console.log(`✅ rooms table exists with ${roomsCount} records`)
    } catch (error) {
      console.log('❌ rooms table error:', error.message)
    }

    try {
      const categoriesCount = await prisma.category.count()
      console.log(`✅ category table exists with ${categoriesCount} records`)
    } catch (error) {
      console.log('❌ category table error:', error.message)
    }

    try {
      const usersCount = await prisma.user.count()
      console.log(`✅ user table exists with ${usersCount} records`)
    } catch (error) {
      console.log('❌ user table error:', error.message)
    }

    // Check for specific room types
    console.log('\n🏨 Checking for room types...')
    const roomTypes = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        totalRooms: true,
        _count: {
          select: {
            rooms: true
          }
        }
      }
    })

    if (roomTypes.length === 0) {
      console.log('❌ No room types found in database')
      console.log('💡 You may need to run the seed script: npm run db:seed')
    } else {
      console.log(`✅ Found ${roomTypes.length} room types:`)
      roomTypes.forEach(rt => {
        console.log(`  - ${rt.name} (${rt.slug})`)
        console.log(`    Total rooms: ${rt.totalRooms}, Created: ${rt._count.rooms}`)
      })
    }

    // Check for individual rooms
    console.log('\n🚪 Checking for individual rooms...')
    const rooms = await prisma.rooms.findMany({
      select: {
        id: true,
        roomNumber: true,
        status: true,
        roomType: {
          select: {
            name: true
          }
        }
      },
      take: 10
    })

    if (rooms.length === 0) {
      console.log('❌ No individual rooms found in database')
    } else {
      console.log(`✅ Found ${rooms.length} individual rooms (showing first 10):`)
      rooms.forEach(room => {
        console.log(`  - ${room.roomNumber} (${room.roomType.name}) - ${room.status}`)
      })
    }

    // Check environment
    console.log('\n🌍 Environment check:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set')

  } catch (error) {
    console.error('❌ Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseState()
