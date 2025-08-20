const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSpecificUser(email) {
  try {
    console.log(`🔍 Checking user: ${email}\n`)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    if (user) {
      console.log(`✅ User found:`)
      console.log(`  - ID: ${user.id}`)
      console.log(`  - Name: ${user.name}`)
      console.log(`  - Email: ${user.email}`)
      console.log(`  - Role: ${user.role}`)
      console.log(`  - Created: ${user.createdAt}`)
    } else {
      console.log(`❌ User not found`)
    }

    // Check OTP records for this email
    const otps = await prisma.emailotp.findMany({
      where: { email },
      select: {
        id: true,
        email: true,
        purpose: true,
        code: true,
        expiresAt: true,
        attempts: true,
        createdAt: true
      }
    })
    
    console.log(`\n📧 OTP records for ${email}: ${otps.length}`)
    if (otps.length > 0) {
      otps.forEach(otp => {
        const isExpired = otp.expiresAt < new Date()
        console.log(`  - ID: ${otp.id}`)
        console.log(`  - Purpose: ${otp.purpose}`)
        console.log(`  - Code: ${otp.code}`)
        console.log(`  - Expires: ${otp.expiresAt}`)
        console.log(`  - Expired: ${isExpired}`)
        console.log(`  - Attempts: ${otp.attempts}`)
        console.log(`  - Created: ${otp.createdAt}`)
        console.log('')
      })
    } else {
      console.log('  No OTP records found')
    }

  } catch (error) {
    console.error('❌ Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check the specific email
checkSpecificUser('swapnilpatil221298@gmail.com')
