import { prisma } from "./prisma"

interface HotelInfo {
  name: string
  logo?: string | null
  primaryEmail?: string
  primaryPhone?: string
  address?: string
}

/**
 * Get hotel information for email templates
 */
async function getHotelInfo(): Promise<HotelInfo> {
  try {
    const hotelInfo = await prisma.hotelinfo.findFirst()
    if (hotelInfo) {
      return {
        name: hotelInfo.name,
        logo: hotelInfo.logo,
        primaryEmail: hotelInfo.primaryEmail || undefined,
        primaryPhone: hotelInfo.primaryPhone || undefined,
        address: hotelInfo.address || undefined
      }
    }
  } catch (error) {
    console.error('Error fetching hotel info for email:', error)
  }

  // Fallback values
  return {
    name: 'HMS Hotel',
    logo: null,
    primaryEmail: undefined,
    primaryPhone: undefined,
    address: undefined
  }
}

/**
 * Generate email header with hotel logo and branding
 */
function generateEmailHeader(hotelInfo: HotelInfo): string {
  const logoSection = hotelInfo.logo 
    ? `<img src="${hotelInfo.logo}" alt="${hotelInfo.name}" style="height: 60px; width: auto; object-fit: contain;" />`
    : `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">${hotelInfo.name.substring(0, 2).toUpperCase()}</div>`

  return `
    <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 32px 16px; text-align: center; border-bottom: 1px solid #e2e8f0;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px;">
          ${logoSection}
          <div>
            <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #d97706, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;">${hotelInfo.name}</h1>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Hotel</p>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Generate email footer with hotel contact information
 */
function generateEmailFooter(hotelInfo: HotelInfo): string {
  return `
    <div style="background: #f8fafc; padding: 32px 16px; text-align: center; border-top: 1px solid #e2e8f0; margin-top: 32px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px;">Contact Us</h3>
        <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
          ${hotelInfo.primaryPhone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${hotelInfo.primaryPhone}</p>` : ''}
          ${hotelInfo.primaryEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${hotelInfo.primaryEmail}</p>` : ''}
          ${hotelInfo.address ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${hotelInfo.address}</p>` : ''}
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${hotelInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </div>
  `
}

/**
 * Create a complete email template with hotel branding
 */
export async function createEmailTemplate(content: string, subject?: string): Promise<string> {
  const hotelInfo = await getHotelInfo()
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject || hotelInfo.name}</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .content { padding: 32px 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        ${generateEmailHeader(hotelInfo)}
        <div class="content">
          ${content}
        </div>
        ${generateEmailFooter(hotelInfo)}
      </div>
    </body>
    </html>
  `
}

/**
 * Create OTP verification email with hotel branding
 */
export async function createOTPEmail(name: string, code: string): Promise<string> {
  const content = `
    <div style="text-align: center;">
      <h2 style="color: #1e293b; margin-bottom: 16px;">Verify Your Email</h2>
      <p style="color: #64748b; margin-bottom: 24px;">Hi ${name}, use the following OTP to complete your registration:</p>
      <div style="background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0; display: inline-block;">
        <p style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0; letter-spacing: 4px;">${code}</p>
      </div>
      <p style="color: #ef4444; font-size: 14px; margin-top: 24px;">This code will expire in 5 minutes.</p>
    </div>
  `
  
  return createEmailTemplate(content, 'Email Verification')
}

/**
 * Create booking confirmation email with hotel branding
 */
export async function createBookingConfirmationEmail(booking: {
  id: string
  guestName: string
  roomType: string
  roomNumber: string
  checkIn: string
  checkOut: string
  totalAmount: number
}): Promise<string> {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; margin-bottom: 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </div>
      <h2 style="color: #16a34a; margin-bottom: 8px;">Booking Confirmed!</h2>
      <p style="color: #64748b;">Thank you for choosing us, ${booking.guestName}. Your reservation has been confirmed.</p>
    </div>

    <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #1e293b; margin-top: 0;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Booking ID:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Room:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.roomType} - ${booking.roomNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Check-in:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.checkIn}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Check-out:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.checkOut}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Total Amount:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">₹${booking.totalAmount.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Important:</strong> Please bring a valid ID proof during check-in. We look forward to welcoming you!
      </p>
    </div>
  `
  
  return createEmailTemplate(content, 'Booking Confirmation')
}
