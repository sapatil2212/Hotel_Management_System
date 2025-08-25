import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import puppeteer from 'puppeteer'

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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const getHotelInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Confirmation - ${booking.id}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #374151;
                line-height: 1.3;
                background: #ffffff;
                font-size: 10px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: #ffffff;
                padding: 15px;
            }
            
            /* Header Section */
            .header {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .hotel-brand {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .logo-container {
                width: 80px;
                height: 40px;
                border-radius: 6px;
                background: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #d1d5db;
            }
            
            .logo-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 6px;
            }
            
            .logo-fallback {
                font-size: 20px;
                font-weight: 600;
                color: #6b7280;
            }
            
            .hotel-info h1 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
            }
            
            .hotel-info .tagline {
                font-size: 10px;
                color: #6b7280;
                font-weight: 400;
            }
            
            .document-type {
                text-align: right;
            }
            
            .document-type h2 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 3px;
            }
            
            .document-type .subtitle {
                font-size: 9px;
                color: #6b7280;
            }
            
            /* Main Content */
            .main-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            /* Booking ID Section */
            .booking-id-section {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
                grid-column: 1 / -1;
            }
            
            .booking-id-section h3 {
                color: #374151;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 6px;
            }
            
            .booking-id {
                font-size: 14px;
                font-weight: 700;
                color: #1f2937;
                font-family: 'Courier New', monospace;
            }
            
            .status-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: 600;
                text-transform: uppercase;
                background: #dcfce7;
                color: #166534;
                margin-left: 8px;
                border: 1px solid #bbf7d0;
            }
            
            /* Information Cards */
            .info-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
            }
            
            .info-card h3 {
                color: #374151;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
                font-size: 9px;
            }
            
            .detail-label {
                font-weight: 500;
                color: #6b7280;
            }
            
            .detail-value {
                font-weight: 600;
                color: #1f2937;
                text-align: right;
            }
            
            /* Room Information */
            .room-section {
                background: #fef3c7;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
            }
            
            .room-section h3 {
                color: #92400e;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            /* Price Breakdown */
            .price-section {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
            }
            
            .price-section h3 {
                color: #166534;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .price-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
                font-size: 9px;
            }
            
            .price-total {
                border-top: 1px solid #bbf7d0;
                margin-top: 6px;
                padding-top: 6px;
                font-weight: 700;
                font-size: 10px;
                color: #166534;
                background: #ffffff;
                padding: 6px;
                border-radius: 4px;
            }
            
            /* Hotel Contact Section */
            .hotel-contact {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                text-align: center;
                grid-column: 1 / -1;
            }
            
            .hotel-contact h3 {
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #374151;
            }
            
            .contact-details {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
                margin-top: 8px;
                font-size: 9px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 3px;
                color: #6b7280;
            }
            
            /* Terms and Conditions */
            .terms-section {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
                grid-column: 1 / -1;
            }
            
            .terms-section h3 {
                color: #991b1b;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .terms-content {
                font-size: 8px;
                color: #7f1d1d;
                line-height: 1.3;
            }
            
            .terms-content p {
                margin-bottom: 6px;
                font-weight: 600;
            }
            
            .terms-content ul {
                margin: 0;
                padding-left: 12px;
            }
            
            .terms-content li {
                margin-bottom: 3px;
                font-weight: 400;
            }
            
            /* Footer */
            .footer {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                text-align: center;
                margin-top: 15px;
                grid-column: 1 / -1;
            }
            
            .footer p {
                color: #6b7280;
                font-size: 8px;
                margin-bottom: 3px;
            }
            
            .footer .thank-you {
                font-size: 9px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 6px;
            }
            
            .footer .generated-date {
                font-size: 7px;
                color: #9ca3af;
                font-style: italic;
            }
            
            /* Responsive Design */
            @media print {
                .container {
                    box-shadow: none;
                }
                
                .header {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                .room-section {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                .price-section {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="hotel-brand">
                    <div class="logo-container">
                        ${hotelInfo?.logo 
                          ? `<img src="${hotelInfo.logo}" alt="${hotelInfo.name || 'Hotel Logo'}" class="logo-image" />`
                          : `<div class="logo-fallback">${getHotelInitials(hotelInfo?.name || 'Hotel')}</div>`
                        }
                    </div>
                </div>
                <div class="document-type">
                    <h2>Booking Confirmation</h2>
                    <p class="subtitle">Invoice & Details</p>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Booking ID Section -->
                <div class="booking-id-section">
                    <h3>Booking Reference</h3>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="booking-id">${booking.id}</span>
                        <span class="status-badge">${booking.status}</span>
                    </div>
                    <p style="margin-top: 4px; font-size: 8px; color: #6b7280;">
                        Booking Date & Time: ${formatDateTime(booking.createdAt)}
                    </p>
                </div>

                <!-- Guest Information -->
                <div class="info-card">
                    <h3>Guest Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Full Name:</span>
                        <span class="detail-value">${booking.guestName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${booking.guestEmail}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${booking.guestPhone}</span>
                    </div>
                </div>

                <!-- Stay Details -->
                <div class="info-card">
                    <h3>Stay Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Check-in:</span>
                        <span class="detail-value">${formatDate(booking.checkIn)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-out:</span>
                        <span class="detail-value">${formatDate(booking.checkOut)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${booking.nights} nights</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Guests:</span>
                        <span class="detail-value">${booking.adults} adults${booking.children > 0 ? `, ${booking.children} children` : ''}</span>
                    </div>
                    ${booking.specialRequests ? `
                    <div class="detail-row">
                        <span class="detail-label">Special Requests:</span>
                        <span class="detail-value">${booking.specialRequests}</span>
                    </div>
                    ` : ''}
                </div>

                <!-- Room and Payment Section -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; grid-column: 1 / -1;">
                    <!-- Room Information -->
                    <div class="room-section" style="margin-bottom: 0;">
                        <h3>Room Details</h3>
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

                    <!-- Price Breakdown -->
                    <div class="price-section" style="margin-bottom: 0;">
                        <h3>Payment Summary</h3>
                        <div class="price-row">
                            <span>Room Rate (${booking.nights} nights × ${formatCurrency(booking.room.roomType.price)}):</span>
                            <span>${formatCurrency(booking.room.roomType.price * booking.nights)}</span>
                        </div>
                        ${booking.gstAmount > 0 ? `
                        <div class="price-row">
                            <span>GST Charges:</span>
                            <span>${formatCurrency(booking.gstAmount)}</span>
                        </div>
                        ` : ''}
                        ${booking.serviceTaxAmount > 0 ? `
                        <div class="price-row">
                            <span>Service Tax:</span>
                            <span>${formatCurrency(booking.serviceTaxAmount)}</span>
                        </div>
                        ` : ''}
                        ${booking.otherTaxAmount > 0 ? `
                        <div class="price-row">
                            <span>Other Taxes:</span>
                            <span>${formatCurrency(booking.otherTaxAmount)}</span>
                        </div>
                        ` : ''}
                        ${booking.discountAmount && booking.discountAmount > 0 ? `
                        <div class="price-row">
                            <span>Discount ${booking.promoCode ? `(${booking.promoCode.code})` : ''}:</span>
                            <span style="color: #dc2626;">-${formatCurrency(booking.discountAmount)}</span>
                        </div>
                        ` : ''}
                        <div class="price-row price-total">
                            <span>Total Amount:</span>
                            <span>${formatCurrency(booking.totalAmount)}</span>
                        </div>
                        <div class="price-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #bbf7d0; font-weight: 600; color: #166534;">
                            <span>Payment Method:</span>
                            <span style="text-transform: capitalize;">${booking.paymentMethod ? booking.paymentMethod.replace(/_/g, ' ') : 'Pay at Hotel'}</span>
                        </div>
                    </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="terms-section">
                    <h3>Terms and Conditions</h3>
                    <div class="terms-content">
                        ${hotelInfo?.bookingConfirmationTerms ? 
                          hotelInfo.bookingConfirmationTerms.split('\n').map((line: string) => {
                            if (line.trim().startsWith('•')) {
                              return `<li>${line.trim().substring(1).trim()}</li>`;
                            } else if (line.trim().startsWith('Standard Terms:')) {
                              return `<p><strong>${line.trim()}</strong></p>`;
                            } else if (line.trim()) {
                              return `<p>${line.trim()}</p>`;
                            }
                            return '';
                          }).join('') :
                          `<p><strong>Standard Terms:</strong></p>
                          <ul>
                              <li>All bookings are subject to room availability at the time of check-in.</li>
                              <li>Room numbers are allocated but may be changed at the time of check-in based on operational requirements.</li>
                              <li>Check-in time: ${hotelInfo?.checkInTime || '3:00 PM'} | Check-out time: ${hotelInfo?.checkOutTime || '11:00 AM'}</li>
                              <li>Early check-in and late check-out are subject to availability and may incur additional charges.</li>
                              <li>Valid government-issued photo ID is required at check-in.</li>
                              <li>Payment is due as per the selected payment method.</li>
                              <li>Cancellation policies apply as per hotel terms.</li>
                          </ul>`
                        }
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p class="thank-you">Thank you for choosing us! We look forward to your stay.</p>
                    <p>This is a computer-generated confirmation. No signature required.</p>
                    <p>For any queries, please contact us using the information above.</p>
                    <p class="generated-date">Generated on ${formatDate(new Date())}</p>
                </div>

                <!-- Hotel Contact Information -->
                <div class="hotel-contact">
                    <h3>${hotelInfo?.name || ''}</h3>
                    <div class="contact-details">
                        ${hotelInfo?.primaryPhone ? `
                        <div class="contact-item">
                            📞 ${hotelInfo.primaryPhone}
                        </div>
                        ` : ''}
                        ${hotelInfo?.primaryEmail ? `
                        <div class="contact-item">
                            📧 ${hotelInfo.primaryEmail}
                        </div>
                        ` : ''}
                        ${hotelInfo?.address ? `
                        <div class="contact-item">
                            📍 ${hotelInfo.address}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}
