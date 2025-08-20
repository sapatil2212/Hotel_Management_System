const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupExpiredOTP() {
  try {
    console.log('🧹 Cleaning up expired OTP records...\n')

    // Find expired OTPs
    const expiredOTPs = await prisma.emailotp.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        purpose: true,
        expiresAt: true,
        attempts: true
      }
    })

    console.log(`Found ${expiredOTPs.length} expired OTP records:`)
    expiredOTPs.forEach(otp => {
      console.log(`  - ${otp.email} (${otp.purpose}) - Expired: ${otp.expiresAt} - Attempts: ${otp.attempts}`)
    })

    if (expiredOTPs.length > 0) {
      // Delete expired OTPs
      const deletedCount = await prisma.emailotp.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })

      console.log(`\n✅ Deleted ${deletedCount.count} expired OTP records`)
    } else {
      console.log('\n✅ No expired OTP records to clean up')
    }

    // Also clean up OTPs with too many attempts
    const tooManyAttemptsOTPs = await prisma.emailotp.findMany({
      where: {
        attempts: {
          gte: 5
        }
      },
      select: {
        id: true,
        email: true,
        purpose: true,
        attempts: true
      }
    })

    console.log(`\nFound ${tooManyAttemptsOTPs.length} OTP records with too many attempts:`)
    tooManyAttemptsOTPs.forEach(otp => {
      console.log(`  - ${otp.email} (${otp.purpose}) - Attempts: ${otp.attempts}`)
    })

    if (tooManyAttemptsOTPs.length > 0) {
      const deletedCount = await prisma.emailotp.deleteMany({
        where: {
          attempts: {
            gte: 5
          }
        }
      })

      console.log(`\n✅ Deleted ${deletedCount.count} OTP records with too many attempts`)
    } else {
      console.log('\n✅ No OTP records with too many attempts to clean up')
    }

  } catch (error) {
    console.error('❌ Error cleaning up OTP records:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupExpiredOTP()
