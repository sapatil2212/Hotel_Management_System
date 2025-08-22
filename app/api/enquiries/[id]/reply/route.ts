import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { sendEmail } from "@/lib/email"
import { createEmailTemplate } from "@/lib/email-templates"
import { z } from "zod"

const replySchema = z.object({
  message: z.string().min(1, "Reply message is required"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = replySchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.issues,
        },
        { status: 422 }
      )
    }

    const { message } = parsed.data

    // Get enquiry details
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: params.id },
    })

    if (!enquiry) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      )
    }

    // Get hotel info
    const hotelInfo = await prisma.hotelinfo.findFirst()

    // Create reply email content
    const replyEmailContent = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; margin-bottom: 24px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M22 2H2l8 9.46V19l4 2v-8.54L22 2z"></path>
          </svg>
        </div>
        <h2 style="color: #1d4ed8; margin-bottom: 12px; font-size: 24px; font-weight: 700;">Response to Your Enquiry</h2>
        <p style="color: #64748b; font-size: 16px; margin: 0;">Hello ${enquiry.name}, here's our response to your enquiry</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin: 32px 0;">
        <h3 style="color: #1e293b; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Original Enquiry</h3>
        
        <div style="display: grid; gap: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Subject</span>
            <span style="color: #1e293b; font-weight: 600;">${enquiry.subject}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 500;">Your Message</span>
            <span style="color: #1e293b; font-weight: 500; text-align: right; max-width: 300px;">${enquiry.message}</span>
          </div>
        </div>

        <h3 style="color: #1e293b; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Our Response</h3>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; padding: 20px; color: white;">
          <p style="margin: 0; line-height: 1.6; font-size: 16px;">${message}</p>
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
            <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Need Further Assistance?</p>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              If you have any additional questions, please don't hesitate to contact us again. We're here to help!
            </p>
          </div>
        </div>
      </div>
    `

    // Send reply email
    const replyEmailHtml = await createEmailTemplate(replyEmailContent, "Response to Your Enquiry")
    await sendEmail({
      to: enquiry.email,
      subject: `Re: ${enquiry.subject} - ${hotelInfo?.name || 'Hotel Response'}`,
      html: replyEmailHtml,
    })

    // Update enquiry status to in_progress if it was new
    if (enquiry.status === "new") {
      await prisma.enquiry.update({
        where: { id: params.id },
        data: {
          status: "in_progress",
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Error sending reply:", error)
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    )
  }
}
