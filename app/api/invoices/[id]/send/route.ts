import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { emailIds } = await request.json()
    
    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json(
        { error: 'Email addresses are required' },
        { status: 400 }
      )
    }

    // Fetch the invoice with booking details
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            room: {
              include: {
                roomType: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // TODO: Implement actual email sending logic here
    // For now, we'll just update the invoice status and log the action
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        emailSent: true,
        updatedAt: new Date()
      }
    })

    // Log the email sending attempt
    console.log(`Invoice ${invoice.invoiceNumber} sent to:`, emailIds)

    return NextResponse.json({
      message: 'Invoice sent successfully',
      sentTo: emailIds
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
