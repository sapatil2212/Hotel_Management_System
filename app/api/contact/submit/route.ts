import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { createEmailTemplate } from "@/lib/email-templates"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.issues.map((i) => ({
            code: i.code,
            path: i.path,
            message: i.message,
          })),
        },
        { status: 422 }
      )
    }

    const { name, email, phone, subject, message } = parsed.data

    // Get client IP and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Create enquiry in database
    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        source: "website",
        ipAddress,
        userAgent,
      },
    })

    // Get hotel info for admin email
    const hotelInfo = await prisma.hotelinfo.findFirst()
    const adminEmail = hotelInfo?.primaryEmail || process.env.ADMIN_EMAIL || "admin@hotel.com"

    // Create email content for user
    const userEmailContent = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin-bottom: 24px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M22 2H2l8 9.46V19l4 2v-8.54L22 2z"></path>
          </svg>
        </div>
        <h2 style="color: #059669; margin-bottom: 12px; font-size: 24px; font-weight: 700;">Message Received!</h2>
        <p style="color: #64748b; font-size: 16px; margin: 0;">Thank you for contacting us, ${name}</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin: 32px 0;">
        <h3 style="color: #1e293b; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Your Message Details</h3>
        
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Subject</span>
            <span style="color: #1e293b; font-weight: 600;">${subject}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Message</span>
            <span style="color: #1e293b; font-weight: 500; text-align: right; max-width: 300px;">${message}</span>
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
            <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">What's Next?</p>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              Our team will review your message and get back to you within 24 hours. We appreciate your patience!
            </p>
          </div>
        </div>
      </div>
    `

    // Create email content for admin
    const adminEmailContent = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; margin-bottom: 24px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M22 2H2l8 9.46V19l4 2v-8.54L22 2z"></path>
          </svg>
        </div>
        <h2 style="color: #1d4ed8; margin-bottom: 12px; font-size: 24px; font-weight: 700;">New Contact Enquiry</h2>
        <p style="color: #64748b; font-size: 16px; margin: 0;">A new enquiry has been submitted through the website</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin: 32px 0;">
        <h3 style="color: #1e293b; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Enquiry Details</h3>
        
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Enquiry ID</span>
            <span style="color: #1e293b; font-weight: 600; font-family: monospace;">${enquiry.id}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Name</span>
            <span style="color: #1e293b; font-weight: 600;">${name}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Email</span>
            <span style="color: #1e293b; font-weight: 600;">${email}</span>
          </div>
          
          ${phone ? `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Phone</span>
            <span style="color: #1e293b; font-weight: 600;">${phone}</span>
          </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Subject</span>
            <span style="color: #1e293b; font-weight: 600;">${subject}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Message</span>
            <span style="color: #1e293b; font-weight: 500; text-align: right; max-width: 300px;">${message}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Submitted</span>
            <span style="color: #1e293b; font-weight: 600;">${new Date().toLocaleString()}</span>
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
            <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Action Required</p>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              Please review this enquiry and respond to the customer within 24 hours. You can manage all enquiries from the dashboard.
            </p>
          </div>
        </div>
      </div>
    `

    // Send email to user
    const userEmailHtml = await createEmailTemplate(userEmailContent, "Message Received - Thank You")
    await sendEmail({
      to: email,
      subject: `Thank you for contacting ${hotelInfo?.name || 'our hotel'}`,
      html: userEmailHtml,
    })

    // Send email to admin
    const adminEmailHtml = await createEmailTemplate(adminEmailContent, "New Contact Enquiry")
    await sendEmail({
      to: adminEmail,
      subject: `New Contact Enquiry - ${subject}`,
      html: adminEmailHtml,
    })

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully",
      enquiryId: enquiry.id,
    })

  } catch (error) {
    console.error("Error submitting contact form:", error)
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    )
  }
}
