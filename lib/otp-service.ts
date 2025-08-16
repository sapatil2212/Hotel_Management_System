// In-memory storage for OTP (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: Date; type: string }>()

export interface OTPData {
  otp: string
  expiresAt: Date
  type: string
}

export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static storeOTP(email: string, type: string, otp: string): void {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const key = `${email}:${type}`
    otpStore.set(key, { otp, expiresAt, type })
  }

  static getOTP(email: string, type: string): OTPData | undefined {
    const key = `${email}:${type}`
    return otpStore.get(key)
  }

  static verifyOTP(email: string, type: string, otp: string): boolean {
    const key = `${email}:${type}`
    const storedOTP = otpStore.get(key)

    if (!storedOTP) {
      return false
    }

    // Check if OTP is expired
    if (new Date() > storedOTP.expiresAt) {
      otpStore.delete(key)
      return false
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return false
    }

    // Remove OTP after successful verification
    otpStore.delete(key)
    return true
  }

  static removeOTP(email: string, type: string): void {
    const key = `${email}:${type}`
    otpStore.delete(key)
  }

  static isExpired(email: string, type: string): boolean {
    const key = `${email}:${type}`
    const storedOTP = otpStore.get(key)
    
    if (!storedOTP) {
      return true
    }

    return new Date() > storedOTP.expiresAt
  }
}
