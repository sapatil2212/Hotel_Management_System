import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Supplier bill PDF generation requested for ID:', params.id)
  
  try {
    // Fetch supplier bill details
    const supplierBill = await prisma.supplier_bill.findUnique({
      where: { id: params.id },
      include: {
        items: true
      }
    })

    if (!supplierBill) {
      console.log('Supplier bill not found for ID:', params.id)
      return NextResponse.json(
        { error: 'Supplier bill not found' },
        { status: 404 }
      )
    }

    console.log('Supplier bill found, generating PDF...')

    // Fetch hotel info
    const hotelInfo = await prisma.hotelinfo.findFirst()

    // Generate HTML for PDF
    const htmlContent = generateSupplierBillHTML(supplierBill, hotelInfo)

    // Return HTML that can be printed to PDF by the browser
    console.log('Returning HTML for browser-based PDF generation...')
    
    const printableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Supplier Bill - ${supplierBill.billNumber}</title>
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
        'Content-Disposition': `attachment; filename="supplier-bill-${supplierBill.billNumber}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating supplier bill PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateSupplierBillHTML(supplierBill: any, hotelInfo: any) {
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
        <title>Supplier Bill - ${supplierBill.billNumber}</title>
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
            
            /* Bill ID Section */
            .bill-id-section {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
                grid-column: 1 / -1;
            }
            
            .bill-id-section h3 {
                color: #374151;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 6px;
            }
            
            .bill-id {
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
                
                .items-section {
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
                    <h2>Supplier Bill</h2>
                    <p class="subtitle">Invoice & Details</p>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Bill ID Section -->
                <div class="bill-id-section">
                    <h3>Bill Reference</h3>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="bill-id">${supplierBill.billNumber}</span>
                        <span class="status-badge">${supplierBill.status}</span>
                    </div>
                    <p style="margin-top: 4px; font-size: 8px; color: #6b7280;">
                        Bill Date: ${formatDate(supplierBill.billDate)} | Due Date: ${formatDate(supplierBill.dueDate)}
                    </p>
                </div>

                <!-- Supplier Information -->
                <div class="info-card">
                    <h3>Supplier Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Supplier Name:</span>
                        <span class="detail-value">${supplierBill.supplierName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${supplierBill.supplierContact}</span>
                    </div>
                    ${supplierBill.gstNumber ? `
                    <div class="detail-row">
                        <span class="detail-label">GST Number:</span>
                        <span class="detail-value">${supplierBill.gstNumber}</span>
                    </div>
                    ` : ''}
                </div>

                <!-- Bill Details -->
                <div class="info-card">
                    <h3>Bill Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Bill Date:</span>
                        <span class="detail-value">${formatDate(supplierBill.billDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Due Date:</span>
                        <span class="detail-value">${formatDate(supplierBill.dueDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Terms:</span>
                        <span class="detail-value">${supplierBill.paymentTerms}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${supplierBill.paymentMethod}</span>
                    </div>
                    ${supplierBill.notes ? `
                    <div class="detail-row">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${supplierBill.notes}</span>
                    </div>
                    ` : ''}
                </div>

                <!-- Items Table -->
                <div class="items-section">
                    <h3>Items & Services</h3>
                                         <table class="items-table">
                         <thead>
                             <tr>
                                 <th>Item Name</th>
                                 <th>SKU</th>
                                 <th>Unit</th>
                                 <th>Quantity</th>
                                 <th>Unit Price</th>
                                 <th>Base Amount</th>
                                 <th>Tax Amount</th>
                                 <th>Total Price</th>
                             </tr>
                         </thead>
                         <tbody>
                             ${supplierBill.items.map((item: any) => `
                                 <tr>
                                     <td>${item.itemName}</td>
                                     <td>${item.sku || 'N/A'}</td>
                                     <td>${item.unit}</td>
                                     <td>${item.quantity}</td>
                                     <td>${formatCurrency(item.unitPrice)}</td>
                                     <td>${formatCurrency(item.totalPrice)}</td>
                                     <td>${formatCurrency(item.taxAmount || 0)}</td>
                                     <td>${formatCurrency(item.finalAmount || item.totalPrice)}</td>
                                 </tr>
                             `).join('')}
                         </tbody>
                     </table>
                </div>

                <!-- Price Breakdown -->
                <div class="price-section">
                    <h3>Payment Summary</h3>
                    <div class="price-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(supplierBill.subtotal)}</span>
                    </div>
                    <div class="price-row">
                        <span>GST Amount:</span>
                        <span>${formatCurrency(supplierBill.gstAmount)}</span>
                    </div>
                    <div class="price-row price-total">
                        <span>Total Amount:</span>
                        <span>${formatCurrency(supplierBill.totalAmount)}</span>
                    </div>
                    <div class="price-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #bbf7d0; font-weight: 600; color: #166534;">
                        <span>Payment Method:</span>
                        <span style="text-transform: capitalize;">${supplierBill.paymentMethod}</span>
                    </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="terms-section">
                    <h3>Terms and Conditions</h3>
                    <div class="terms-content">
                        <p><strong>Payment Terms:</strong></p>
                        <ul>
                            <li>Payment is due within ${supplierBill.paymentTerms} days of bill date.</li>
                            <li>Late payments may incur additional charges.</li>
                            <li>All disputes must be raised within 7 days of bill receipt.</li>
                            <li>Goods once delivered will not be taken back unless defective.</li>
                            <li>This is a computer-generated bill. No signature required.</li>
                        </ul>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p class="thank-you">Thank you for your business!</p>
                    <p>This is a computer-generated bill. No signature required.</p>
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
