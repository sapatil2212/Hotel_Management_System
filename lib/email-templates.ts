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
 * Create a plain and professional email template
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
          background-color: #ffffff;
          line-height: 1.6;
          color: #333333;
          font-size: 16px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 40px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          background: #4a90e2;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 16px;
        }
        
        .hotel-name {
          font-size: 24px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 8px;
        }
        
        .content {
          margin-bottom: 40px;
        }
        
        .main-heading {
          font-size: 28px;
          font-weight: 700;
          color: #333333;
          text-align: center;
          margin-bottom: 24px;
        }
        
        .greeting {
          font-size: 16px;
          color: #333333;
          margin-bottom: 24px;
        }
        
        .intro-text {
          font-size: 16px;
          color: #666666;
          line-height: 1.7;
          margin-bottom: 32px;
        }
        
        .details-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #4a90e2;
          margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .detail-value {
          font-size: 14px;
          color: #333333;
          font-weight: 500;
        }
        
        .reminders-section {
          background: #fff3cd;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
        }
        
        .reminders-title {
          font-size: 18px;
          font-weight: 600;
          color: #856404;
          margin-bottom: 16px;
        }
        
        .reminder-list {
          list-style: none;
          padding: 0;
        }
        
        .reminder-item {
          font-size: 14px;
          color: #856404;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        
        .reminder-item:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #856404;
        }
        
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          color: #6c757d;
          font-size: 14px;
        }
        
        .contact-info {
          margin-bottom: 16px;
        }
        
        .contact-info p {
          margin: 4px 0;
        }
        
        .contact-info a {
          color: #4a90e2;
          text-decoration: none;
        }
        
        .copyright {
          color: #999999;
          font-size: 12px;
        }
        
        @media (max-width: 600px) {
          .email-container {
            padding: 20px 15px;
          }
          
          .main-heading {
            font-size: 24px;
          }
          
          .details-section,
          .reminders-section {
            padding: 20px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">${hotelInfo.name.substring(0, 2).toUpperCase()}</div>
          <div class="hotel-name">${hotelInfo.name}</div>
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
 * Create OTP verification email
 */
export async function createOTPEmail(name: string, code: string): Promise<string> {
  const content = `
    <h1 class="main-heading">Email Verification</h1>
    <p class="greeting">Hello ${name},</p>
    <p class="intro-text">Please verify your email address by entering the verification code below.</p>
    
    <div class="details-section">
      <div class="section-title">Verification Code</div>
      <div style="text-align: center; padding: 20px 0;">
        <div style="font-size: 32px; font-weight: 700; color: #4a90e2; letter-spacing: 8px; font-family: monospace;">${code}</div>
      </div>
      <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
        This code will expire in <strong>5 minutes</strong>.
      </p>
    </div>
    
    <div class="reminders-section">
      <div class="reminders-title">Security Reminder</div>
      <ul class="reminder-list">
        <li class="reminder-item">Never share this code with anyone</li>
        <li class="reminder-item">If you didn't request this code, please ignore this email</li>
        <li class="reminder-item">Contact us immediately if you suspect unauthorized access</li>
      </ul>
    </div>
  `
  
  return createEmailTemplate(content, 'Email Verification')
}

/**
 * Create booking confirmation email
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
    <h1 class="main-heading">Booking Confirmed</h1>
    <p class="greeting">Hello ${booking.guestName},</p>
    <p class="intro-text">Your booking has been successfully confirmed. We look forward to welcoming you and providing you with a comfortable stay.</p>
    
    <div class="details-section">
      <div class="section-title">Booking Details</div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${new Date(booking.checkIn).toLocaleDateString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${new Date(booking.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Room</span>
        <span class="detail-value">${booking.roomType} - ${booking.roomNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-out</span>
        <span class="detail-value">${new Date(booking.checkOut).toLocaleDateString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">${booking.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Amount</span>
        <span class="detail-value">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
    
    <div class="reminders-section">
      <div class="reminders-title">Important Reminders</div>
      <ul class="reminder-list">
        <li class="reminder-item">Please arrive 10 minutes before your scheduled check-in time</li>
        <li class="reminder-item">Bring a valid government-issued ID for verification</li>
        <li class="reminder-item">Early check-in is subject to room availability</li>
        <li class="reminder-item">Contact us if you need to modify your booking</li>
      </ul>
    </div>
  `
  
  return createEmailTemplate(content, 'Booking Confirmation')
}

/**
 * Create password reset email
 */
export async function createPasswordResetEmail(name: string, resetLink: string): Promise<string> {
  const content = `
    <h1 class="main-heading">Password Reset Request</h1>
    <p class="greeting">Hello ${name},</p>
    <p class="intro-text">We received a request to reset your password. Click the button below to create a new password.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}" style="display: inline-block; background: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; color: #6c757d; text-align: center; margin-bottom: 32px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetLink}" style="color: #4a90e2; word-break: break-all;">${resetLink}</a>
    </p>
    
    <div class="reminders-section">
      <div class="reminders-title">Security Information</div>
      <ul class="reminder-list">
        <li class="reminder-item">This link will expire in 1 hour</li>
        <li class="reminder-item">If you didn't request this reset, please ignore this email</li>
        <li class="reminder-item">Your password will remain unchanged until you click the link above</li>
      </ul>
    </div>
  `
  
  return createEmailTemplate(content, 'Password Reset Request')
}

/**
 * Create invoice email
 */
export async function createInvoiceEmail(invoice: {
  id: string
  guestName: string
  amount: number
  items: Array<{ name: string; amount: number }>
  dueDate: string
}): Promise<string> {
  const content = `
    <h1 class="main-heading">Invoice</h1>
    <p class="greeting">Hello ${invoice.guestName},</p>
    <p class="intro-text">Please find your invoice attached. Payment is due by the date specified below.</p>
    
    <div class="details-section">
      <div class="section-title">Invoice Details</div>
      <div class="detail-row">
        <span class="detail-label">Invoice ID</span>
        <span class="detail-value">${invoice.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Due Date</span>
        <span class="detail-value">${new Date(invoice.dueDate).toLocaleDateString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Amount</span>
        <span class="detail-value">₹${invoice.amount.toLocaleString('en-IN')}</span>
      </div>
    </div>
    
    <div class="reminders-section">
      <div class="reminders-title">Payment Information</div>
      <ul class="reminder-list">
        <li class="reminder-item">Payment can be made online through our secure portal</li>
        <li class="reminder-item">We accept all major credit cards and digital payments</li>
        <li class="reminder-item">Please contact us if you have any questions about this invoice</li>
      </ul>
    </div>
  `
  
  return createEmailTemplate(content, 'Invoice')
}
