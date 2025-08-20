import { prisma } from './prisma'

// In-memory storage for verified OTPs (temporary tracking)
const verifiedOTPs = new Map<string, { verifiedAt: Date; type: string }>()

export interface OTPData {
  otp: string
  expiresAt: Date
  type: string
}

export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static async storeOTP(email: string, type: string, otp: string): Promise<void> {
         const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    
    try {
      // Upsert OTP in database
      await prisma.emailotp.upsert({
        where: { email },
        update: {
          code: otp,
          purpose: type,
          expiresAt,
          attempts: 0,
          updatedAt: new Date()
        },
        create: {
          id: `${email}-${type}-${Date.now()}`,
          email,
          code: otp,
          purpose: type,
          expiresAt,
          updatedAt: new Date()
        }
      })
      
      console.log('OTP stored in database:', { email, type, otp, expiresAt })
    } catch (error) {
      console.error('Error storing OTP in database:', error)
      throw error
    }
  }

  static async getOTP(email: string, type: string): Promise<OTPData | undefined> {
    try {
      const otpRecord = await prisma.emailotp.findUnique({
        where: { email }
      })
      
      if (!otpRecord || otpRecord.purpose !== type) {
        return undefined
      }
      
      return {
        otp: otpRecord.code,
        expiresAt: otpRecord.expiresAt,
        type: otpRecord.purpose
      }
    } catch (error) {
      console.error('Error getting OTP from database:', error)
      return undefined
    }
  }

  static async verifyOTP(email: string, type: string, otp: string): Promise<boolean> {
    try {
      const otpRecord = await prisma.emailotp.findUnique({
        where: { email }
      })

      console.log('OTP verification attempt:', { email, type, inputOtp: otp, storedOTP: otpRecord })

      if (!otpRecord || otpRecord.purpose !== type) {
        console.log('No stored OTP found for email:', email)
        return false
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        console.log('OTP expired:', { storedOTP: otpRecord, currentTime: new Date() })
        await prisma.emailotp.delete({ where: { email } })
        return false
      }

      // Verify OTP
      if (otpRecord.code !== otp) {
        console.log('OTP mismatch:', { 
          storedOtp: otpRecord.code, 
          inputOtp: otp,
          email,
          type,
          attempts: otpRecord.attempts
        })
        
        // Increment attempts
        await prisma.emailotp.update({
          where: { email },
          data: { attempts: { increment: 1 } }
        })
        
        // If too many attempts, delete the OTP
        if (otpRecord.attempts >= 4) {
          console.log('Too many failed attempts, deleting OTP')
          await prisma.emailotp.delete({ where: { email } })
        }
        
        return false
      }

      // Mark OTP as verified but keep it in database for a short time
      console.log('OTP verified successfully')
      const key = `${email}:${type}`
      verifiedOTPs.set(key, { verifiedAt: new Date(), type })
      
      // Update the OTP record to mark it as verified instead of deleting
      await prisma.emailotp.update({
        where: { email },
        data: { 
          purpose: `${type}_verified`,
          updatedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return false
    }
  }

  static async removeOTP(email: string, type: string): Promise<void> {
    try {
      await prisma.emailotp.deleteMany({
        where: { 
          email,
          purpose: type
        }
      })
    } catch (error) {
      console.error('Error removing OTP from database:', error)
    }
  }

  static async isExpired(email: string, type: string): Promise<boolean> {
    try {
      const otpRecord = await prisma.emailotp.findUnique({
        where: { email }
      })
      
      if (!otpRecord || otpRecord.purpose !== type) {
        return true
      }

      return new Date() > otpRecord.expiresAt
    } catch (error) {
      console.error('Error checking OTP expiration:', error)
      return true
    }
  }

  static async getAllStoredOTPs(): Promise<Map<string, { otp: string; expiresAt: Date; type: string }>> {
    try {
      const otpRecords = await prisma.emailotp.findMany()
      const otpMap = new Map<string, { otp: string; expiresAt: Date; type: string }>()
      
      otpRecords.forEach(record => {
        const key = `${record.email}:${record.purpose}`
        otpMap.set(key, {
          otp: record.code,
          expiresAt: record.expiresAt,
          type: record.purpose
        })
      })
      
      return otpMap
    } catch (error) {
      console.error('Error getting all OTPs from database:', error)
      return new Map()
    }
  }

  static isOTPVerified(email: string, type: string): boolean {
    const key = `${email}:${type}`
    const verifiedOTP = verifiedOTPs.get(key)
    
    if (!verifiedOTP) {
      return false
    }

    // Check if verification is still valid (within 5 minutes)
    const verificationExpiry = new Date(verifiedOTP.verifiedAt.getTime() + 5 * 60 * 1000)
    if (new Date() > verificationExpiry) {
      verifiedOTPs.delete(key)
      return false
    }

    return true
  }

  static clearVerifiedOTP(email: string, type: string): void {
    const key = `${email}:${type}`
    verifiedOTPs.delete(key)
  }

  static async cleanupExpiredVerifiedOTPs(): Promise<void> {
    try {
      // Remove verified OTPs that are older than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      await prisma.emailotp.deleteMany({
        where: {
          purpose: {
            endsWith: '_verified'
          },
          updatedAt: {
            lt: fiveMinutesAgo
          }
        }
      })
    } catch (error) {
      console.error('Error cleaning up expired verified OTPs:', error)
    }
  }
}
