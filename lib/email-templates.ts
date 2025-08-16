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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f8fafc;
          line-height: 1.6;
          color: #1e293b;
        }
        
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .logo {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }
        
        .hotel-name {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        
        .hotel-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 4px;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .footer {
          background: #f1f5f9;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .contact-info {
          color: #64748b;
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        
        .contact-info p {
          margin: 4px 0;
        }
        
        .contact-info a {
          color: #3b82f6;
          text-decoration: none;
        }
        
        .copyright {
          color: #94a3b8;
          font-size: 12px;
          margin: 0;
        }
        
        @media (max-width: 600px) {
          .email-wrapper {
            margin: 10px;
            border-radius: 12px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .footer {
            padding: 25px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo-container">
            <div class="logo">${hotelInfo.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <h1 class="hotel-name">${hotelInfo.name}</h1>
              <div class="hotel-subtitle">Hotel</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div class="contact-info">
            ${hotelInfo.primaryPhone ? `<p><strong>Phone:</strong> ${hotelInfo.primaryPhone}</p>` : ''}
            ${hotelInfo.primaryEmail ? `<p><strong>Email:</strong> <a href="mailto:${hotelInfo.primaryEmail}">${hotelInfo.primaryEmail}</a></p>` : ''}
            ${hotelInfo.address ? `<p><strong>Address:</strong> ${hotelInfo.address}</p>` : ''}
          </div>
          <p class="copyright">© ${new Date().getFullYear()} ${hotelInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Create OTP verification email with hotel branding
 */
export async function createOTPEmail(name: string, code: string): Promise<string> {
  const hotelInfo = await getHotelInfo()
  const digits = code.split('')
  
  const content = `
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin-bottom: 24px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
      </div>
      <h2 style="color: #059669; margin-bottom: 12px; font-size: 24px; font-weight: 700;">Email Verification</h2>
      <p style="color: #64748b; font-size: 16px; margin: 0;">Hello ${name}, please verify your email address</p>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
      <p style="color: #475569; font-size: 16px; margin-bottom: 24px; font-weight: 500;">Your verification code is:</p>
      
      <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px;">
        ${digits.map(digit => `
          <div style="width: 60px; height: 60px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <span style="font-size: 28px; font-weight: 700; color: #3b82f6;">${digit}</span>
          </div>
        `).join('')}
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6;">
        This code will expire in <strong>2 minutes</strong>. If you didn't request this code, please ignore this email.
      </p>
    </div>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 32px 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
          For security reasons, never share this code with anyone.
        </p>
      </div>
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
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin-bottom: 24px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M9 12l2 2 4-4"></path>
          <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
          <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
          <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
          <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
        </svg>
      </div>
      <h2 style="color: #059669; margin-bottom: 12px; font-size: 24px; font-weight: 700;">Booking Confirmed!</h2>
      <p style="color: #64748b; font-size: 16px; margin: 0;">Thank you for choosing us, ${booking.guestName}</p>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin: 32px 0;">
      <h3 style="color: #1e293b; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Booking Details</h3>
      
      <div style="display: grid; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; font-weight: 500;">Booking ID</span>
          <span style="color: #1e293b; font-weight: 600; font-family: monospace;">${booking.id}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; font-weight: 500;">Room</span>
          <span style="color: #1e293b; font-weight: 600;">${booking.roomType} - ${booking.roomNumber}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; font-weight: 500;">Check-in</span>
          <span style="color: #1e293b; font-weight: 600;">${booking.checkIn}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; font-weight: 500;">Check-out</span>
          <span style="color: #1e293b; font-weight: 600;">${booking.checkOut}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; color: white;">
          <span style="font-weight: 500;">Total Amount</span>
          <span style="font-weight: 700; font-size: 18px;">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 32px 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Important Information</p>
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            Please bring a valid ID proof during check-in. We look forward to welcoming you!
          </p>
        </div>
      </div>
    </div>
  `
  
  return createEmailTemplate(content, 'Booking Confirmation')
}
