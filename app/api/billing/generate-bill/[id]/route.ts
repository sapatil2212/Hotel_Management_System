import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Bill generation requested for invoice ID:', params.id)
  
  try {
    // Fetch invoice details
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
        },
        invoiceItems: true,
        payments: true
      }
    })

    if (!invoice) {
      console.log('Invoice not found for ID:', params.id)
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    console.log('Invoice found, generating bill...')
    console.log('Payment data:', JSON.stringify(invoice.payments, null, 2))

    // Fetch hotel info
    const hotelInfo = await prisma.hotelinfo.findFirst()

    // Generate HTML for PDF
    const htmlContent = generateBillHTML(invoice, hotelInfo)

    // Return HTML that can be printed to PDF by the browser
    console.log('Returning HTML for browser-based PDF generation...')
    
    const printableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bill - ${invoice.invoiceNumber}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print/Save as PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `
    
    return new NextResponse(printableHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="bill-${invoice.invoiceNumber}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating bill:', error)
    return NextResponse.json(
      { error: 'Failed to generate bill' },
      { status: 500 }
    )
  }
}

function generateBillHTML(invoice: any, hotelInfo: any) {
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

  // Calculate room stay details
  const roomStayItem = invoice.invoiceItems.find((item: any) => item.itemName.includes('Room Stay'))
  const extraCharges = invoice.invoiceItems.filter((item: any) => !item.itemName.includes('Room Stay'))

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Bill - ${invoice.invoiceNumber}</title>
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
            
            /* Invoice ID Section */
            .invoice-id-section {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
                grid-column: 1 / -1;
            }
            
            .invoice-id-section h3 {
                color: #374151;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 6px;
            }
            
            .invoice-id {
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
            
            /* Items Table */
            .items-section {
                background: #fef3c7;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
                grid-column: 1 / -1;
            }
            
            .items-section h3 {
                color: #92400e;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 8px;
            }
            
            .items-table th {
                background: #fef3c7;
                padding: 6px;
                text-align: left;
                font-weight: 600;
                color: #92400e;
                border-bottom: 1px solid #fde68a;
            }
            
            .items-table td {
                padding: 6px;
                border-bottom: 1px solid #fde68a;
            }
            
            .items-table tr:nth-child(even) {
                background: #fef7e0;
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
            
            /* Payment Information */
            .payment-section {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
            }
            
            .payment-section h3 {
                color: #0369a1;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
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
                
                .items-section {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                .price-section {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                .payment-section {
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
                    <h2>Tax Invoice</h2>
                    <p class="subtitle">Bill & Payment Details</p>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Invoice ID Section -->
                <div class="invoice-id-section">
                    <h3>Invoice Reference</h3>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="invoice-id">${invoice.invoiceNumber}</span>
                        <span class="status-badge">${invoice.status}</span>
                    </div>
                    <p style="margin-top: 4px; font-size: 8px; color: #6b7280;">
                        Invoice Date: ${formatDate(invoice.issuedDate)} | Due Date: ${formatDate(invoice.dueDate)}
                    </p>
                </div>

                <!-- Guest Information -->
                <div class="info-card">
                    <h3>Guest Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Guest Name:</span>
                        <span class="detail-value">${invoice.guestName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${invoice.guestEmail}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${invoice.guestPhone}</span>
                    </div>
                </div>

                <!-- Room Information -->
                <div class="info-card">
                    <h3>Room Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Room Type:</span>
                        <span class="detail-value">${invoice.roomTypeName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room Number:</span>
                        <span class="detail-value">${invoice.roomNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-in:</span>
                        <span class="detail-value">${formatDate(invoice.checkIn)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-out:</span>
                        <span class="detail-value">${formatDate(invoice.checkOut)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${invoice.nights} nights</span>
                    </div>
                </div>

                <!-- Items Table -->
                <div class="items-section">
                    <h3>Room Stay Details</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Nights</th>
                                <th>Rate/Night</th>
                                <th>Base Amount</th>
                                <th>GST (${hotelInfo?.gstPercentage || 18}%)</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Room Stay - ${invoice.roomTypeName}<br><small>${formatDate(invoice.checkIn)} to ${formatDate(invoice.checkOut)} (${invoice.nights} nights)</small></td>
                                <td>${invoice.nights}</td>
                                <td>${formatCurrency(invoice.booking.room.roomType.price)}</td>
                                <td>${formatCurrency(invoice.booking.room.roomType.price * invoice.nights)}</td>
                                <td>${formatCurrency((invoice.booking.room.roomType.price * invoice.nights * (hotelInfo?.gstPercentage || 18)) / 100)}</td>
                                <td>${formatCurrency(invoice.booking.room.roomType.price * invoice.nights + ((invoice.booking.room.roomType.price * invoice.nights * (hotelInfo?.gstPercentage || 18)) / 100))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                                 ${extraCharges.length > 0 ? `
                 <!-- Extra Services Table -->
                 <div class="items-section">
                     <h3>Extra Services & Charges</h3>
                     <table class="items-table">
                         <thead>
                             <tr>
                                 <th>Item</th>
                                 <th>Quantity</th>
                                 <th>Unit Price</th>
                                 <th>Base Amount</th>
                                 <th>Tax Amount</th>
                                 <th>Total Amount</th>
                             </tr>
                         </thead>
                         <tbody>
                             ${extraCharges.map((item: any) => `
                                 <tr>
                                     <td>${item.itemName}<br><small>${item.description || ''}</small></td>
                                     <td>${item.quantity}</td>
                                     <td>${formatCurrency(item.unitPrice)}</td>
                                     <td>${formatCurrency(item.totalPrice)}</td>
                                     <td>${formatCurrency(item.taxAmount)}</td>
                                     <td>${formatCurrency(item.finalAmount)}</td>
                                 </tr>
                             `).join('')}
                         </tbody>
                     </table>
                 </div>
                 ` : ''}

                <!-- Price Breakdown -->
                <div class="price-section">
                    <h3>Payment Summary</h3>
                    <div class="price-row">
                        <span>Sub Total (Base Amounts):</span>
                        <span>${formatCurrency(invoice.baseAmount)}</span>
                    </div>
                    <div class="price-row">
                        <span>Total GST Amount:</span>
                        <span>${formatCurrency(invoice.totalTaxAmount)}</span>
                    </div>
                    <div class="price-row price-total">
                        <span>Total Amount:</span>
                        <span>${formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    <div class="price-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #bbf7d0; font-weight: 600; color: #166534;">
                        <span>Total Amount Paid:</span>
                        <span>${formatCurrency(invoice.totalAmount)}</span>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="payment-section">
                    <h3>Payment Details</h3>
                    ${invoice.payments && invoice.payments.length > 0 ? `
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span class="detail-value">${invoice.payments[0].paymentMethod.toUpperCase()}</span>
                        </div>
                        ${invoice.payments[0].receivedBy ? `
                        <div class="detail-row">
                            <span class="detail-label">Collected By:</span>
                            <span class="detail-value">${invoice.payments[0].receivedBy}</span>
                        </div>
                        ` : ''}
                        ${invoice.payments[0].paymentReference ? `
                        <div class="detail-row">
                            <span class="detail-label">Reference ID:</span>
                            <span class="detail-value">${invoice.payments[0].paymentReference}</span>
                        </div>
                        ` : ''}
                        <div class="detail-row">
                            <span class="detail-label">Payment Date:</span>
                            <span class="detail-value">${formatDate(invoice.payments[0].paymentDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${invoice.payments[0].status.toUpperCase()}</span>
                        </div>
                    ` : `
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span class="detail-value">CASH</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Collected By:</span>
                            <span class="detail-value">Staff</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">COMPLETED</span>
                        </div>
                    `}
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p class="thank-you">Thank you for choosing our services. We appreciate your business and look forward to serving you again.</p>
                    <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
                    <p>For any queries, please contact us at our support desk</p>
                    <p class="generated-date">Generated on ${formatDateTime(invoice.issuedDate)}</p>
                </div>

                <!-- Hotel Contact Information -->
                <div class="hotel-contact">
                    <h3>${hotelInfo?.name || ''}</h3>
                    <div class="contact-details">
                        ${hotelInfo?.address ? `
                        <div class="contact-item">
                            📍 ${hotelInfo.address}
                        </div>
                        ` : ''}
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
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}
