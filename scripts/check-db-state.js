const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n')

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Users in database: ${users.length}`)
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
      })
    } else {
      console.log('  No users found in database')
    }

    // Check OTP records
    const otps = await prisma.emailotp.findMany({
      select: {
        email: true,
        purpose: true,
        expiresAt: true,
        attempts: true,
        createdAt: true
      }
    })
    
    console.log(`\n📧 OTP records in database: ${otps.length}`)
    if (otps.length > 0) {
      otps.forEach(otp => {
        const isExpired = otp.expiresAt < new Date()
        console.log(`  - ${otp.email} (${otp.purpose}) - Expired: ${isExpired} - Attempts: ${otp.attempts}`)
      })
    } else {
      console.log('  No OTP records found')
    }

    // Check hotel info
    const hotelInfo = await prisma.hotelinfo.findFirst({
      select: {
        name: true,
        primaryEmail: true,
        primaryPhone: true
      }
    })
    
    console.log(`\n🏨 Hotel info:`)
    if (hotelInfo) {
      console.log(`  - Name: ${hotelInfo.name}`)
      console.log(`  - Email: ${hotelInfo.primaryEmail || 'Not set'}`)
      console.log(`  - Phone: ${hotelInfo.primaryPhone || 'Not set'}`)
    } else {
      console.log('  No hotel info found')
    }

    // Check environment variables
    console.log(`\n🔧 Environment variables:`)
    console.log(`  - EMAIL_HOST: ${process.env.EMAIL_HOST ? 'Set' : 'Not set'}`)
    console.log(`  - EMAIL_USERNAME: ${process.env.EMAIL_USERNAME ? 'Set' : 'Not set'}`)
    console.log(`  - EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'}`)
    console.log(`  - PSK: ${process.env.PSK ? 'Set' : 'Not set'}`)

  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseState()
