import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        promoCode: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Fetch hotel info
    const hotelInfo = await prisma.hotelinfo.findFirst()

    // Generate HTML for PDF
    const htmlContent = generateInvoiceHTML(booking, hotelInfo)

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    })
    
    await browser.close()

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="booking-invoice-${booking.id}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(booking: any, hotelInfo: any) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Invoice - ${booking.id}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
                line-height: 1.6;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #eee;
            }
            .invoice-info h3 {
                margin: 0 0 10px 0;
                color: #667eea;
                font-size: 18px;
            }
            .invoice-info p {
                margin: 5px 0;
            }
            .booking-details {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .booking-details h2 {
                margin: 0 0 20px 0;
                color: #333;
                font-size: 20px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
            }
            .detail-value {
                color: #333;
            }
            .room-info {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
            }
            .price-breakdown {
                background: #fff;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
            }
            .price-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
            }
            .price-total {
                border-top: 2px solid #667eea;
                margin-top: 15px;
                padding-top: 15px;
                font-weight: bold;
                font-size: 18px;
                color: #667eea;
            }
            .hotel-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
                text-align: center;
            }
            .status-badge {
                display: inline-block;
                padding: 6px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                background: #28a745;
                color: white;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${hotelInfo?.name || 'Hotel Management System'}</h1>
                <p>Booking Confirmation & Invoice</p>
            </div>

            <div class="invoice-details">
                <div class="invoice-info">
                    <h3>Booking Information</h3>
                    <p><strong>Booking ID:</strong> ${booking.id}</p>
                    <p><strong>Status:</strong> <span class="status-badge">${booking.status}</span></p>
                    <p><strong>Booking Date:</strong> ${formatDate(booking.createdAt)}</p>
                </div>
                <div class="invoice-info">
                    <h3>Guest Information</h3>
                    <p><strong>Name:</strong> ${booking.guestName}</p>
                    <p><strong>Email:</strong> ${booking.guestEmail}</p>
                    <p><strong>Phone:</strong> ${booking.guestPhone}</p>
                </div>
            </div>

            <div class="booking-details">
                <h2>Booking Details</h2>
                <div class="detail-row">
                    <span class="detail-label">Check-in Date:</span>
                    <span class="detail-value">${formatDate(booking.checkIn)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-out Date:</span>
                    <span class="detail-value">${formatDate(booking.checkOut)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Number of Nights:</span>
                    <span class="detail-value">${booking.nights}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Adults:</span>
                    <span class="detail-value">${booking.adults}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Children:</span>
                    <span class="detail-value">${booking.children}</span>
                </div>
                ${booking.specialRequests ? `
                <div class="detail-row">
                    <span class="detail-label">Special Requests:</span>
                    <span class="detail-value">${booking.specialRequests}</span>
                </div>
                ` : ''}
            </div>

            <div class="room-info">
                <h2>Room Information</h2>
                <div class="detail-row">
                    <span class="detail-label">Room Type:</span>
                    <span class="detail-value">${booking.room.roomType.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Room Number:</span>
                    <span class="detail-value">${booking.room.roomNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Floor:</span>
                    <span class="detail-value">${booking.room.floorNumber || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Room Size:</span>
                    <span class="detail-value">${booking.room.roomType.size}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bed Type:</span>
                    <span class="detail-value">${booking.room.roomType.bedType}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Max Guests:</span>
                    <span class="detail-value">${booking.room.roomType.maxGuests}</span>
                </div>
            </div>

            <div class="price-breakdown">
                <h2>Price Breakdown</h2>
                <div class="price-row">
                    <span>Room Rate (${booking.nights} nights × ${formatCurrency(booking.room.roomType.price)}):</span>
                    <span>${formatCurrency(booking.originalAmount || booking.totalAmount)}</span>
                </div>
                ${booking.discountAmount && booking.discountAmount > 0 ? `
                <div class="price-row">
                    <span>Discount ${booking.promoCode ? `(${booking.promoCode.code})` : ''}:</span>
                    <span>-${formatCurrency(booking.discountAmount)}</span>
                </div>
                ` : ''}
                <div class="price-row price-total">
                    <span>Total Amount:</span>
                    <span>${formatCurrency(booking.totalAmount)}</span>
                </div>
            </div>

            <div class="hotel-info">
                <h3>${hotelInfo?.name || 'Hotel Management System'}</h3>
                ${hotelInfo?.address ? `<p>${hotelInfo.address}</p>` : ''}
                <p>
                    ${hotelInfo?.primaryPhone ? `Phone: ${hotelInfo.primaryPhone}` : ''}
                    ${hotelInfo?.primaryEmail ? ` | Email: ${hotelInfo.primaryEmail}` : ''}
                </p>
            </div>

            <div class="footer">
                <p>Thank you for choosing us! We look forward to your stay.</p>
                <p>This is a computer-generated invoice. No signature required.</p>
                <p>Generated on ${formatDate(new Date())}</p>
            </div>
        </div>
    </body>
    </html>
  `
}
