import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')
    
    if (!number) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: number
      },
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error searching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to search invoice' },
      { status: 500 }
    )
  }
}
