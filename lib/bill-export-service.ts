// Bill Export Service for PDF, Word, and Excel formats

export interface BillData {
  billNumber: string
  date: string
  booking: {
    id: string
    guestName: string
    guestEmail: string
    guestPhone: string
    roomNumber: string
    roomType: string
    checkIn: string
    checkOut: string
    nights: number
    adults: number
    children: number
  }
  charges: {
    baseAmount: number
    extraServices: Array<{
      name: string
      quantity: number
      unitPrice: number
      total: number
    }>
    subtotal: number
    gstAmount: number
    totalAmount: number
  }
  payment: {
    method: string
    collectedBy: string
    status: string
    date: string
  }
  hotelInfo: {
    name: string
    address: string
    phone: string
    email: string
    gstNumber?: string
  }
}

export class BillExportService {
  /**
   * Export bill as PDF
   */
  static async exportToPDF(billData: BillData): Promise<void> {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text(billData.hotelInfo.name, 20, 30)
    
    doc.setFontSize(12)
    doc.text('INVOICE/BILL', 20, 45)
    doc.text(`Bill No: ${billData.billNumber}`, 150, 45)
    doc.text(`Date: ${billData.date}`, 150, 55)

    // Hotel Info
    doc.setFontSize(10)
    doc.text(billData.hotelInfo.address, 20, 65)
    doc.text(`Phone: ${billData.hotelInfo.phone}`, 20, 75)
    doc.text(`Email: ${billData.hotelInfo.email}`, 20, 85)
    if (billData.hotelInfo.gstNumber) {
      doc.text(`GST No: ${billData.hotelInfo.gstNumber}`, 20, 95)
    }

    // Guest Info
    doc.setFontSize(12)
    doc.text('Bill To:', 20, 110)
    doc.setFontSize(10)
    doc.text(billData.booking.guestName, 20, 120)
    doc.text(billData.booking.guestEmail, 20, 130)
    doc.text(billData.booking.guestPhone, 20, 140)

    // Booking Details
    doc.text('Booking Details:', 20, 160)
    doc.text(`Room: ${billData.booking.roomNumber} (${billData.booking.roomType})`, 20, 170)
    doc.text(`Check-in: ${billData.booking.checkIn}`, 20, 180)
    doc.text(`Check-out: ${billData.booking.checkOut}`, 20, 190)
    doc.text(`Nights: ${billData.booking.nights} | Guests: ${billData.booking.adults} adults, ${billData.booking.children} children`, 20, 200)

    // Charges Table
    let y = 220
    doc.setFontSize(12)
    doc.text('Charges:', 20, y)
    
    y += 15
    doc.setFontSize(10)
    doc.text('Description', 20, y)
    doc.text('Qty', 100, y)
    doc.text('Rate', 130, y)
    doc.text('Amount', 160, y)
    
    y += 10
    doc.line(20, y, 190, y) // Horizontal line
    
    y += 10
    doc.text(`Room Charges (${billData.booking.nights} nights)`, 20, y)
    doc.text(billData.booking.nights.toString(), 100, y)
    doc.text(`₹${(billData.charges.baseAmount / billData.booking.nights).toFixed(2)}`, 130, y)
    doc.text(`₹${billData.charges.baseAmount.toFixed(2)}`, 160, y)

    // Extra Services
    billData.charges.extraServices.forEach(service => {
      y += 10
      doc.text(service.name, 20, y)
      doc.text(service.quantity.toString(), 100, y)
      doc.text(`₹${service.unitPrice.toFixed(2)}`, 130, y)
      doc.text(`₹${service.total.toFixed(2)}`, 160, y)
    })

    y += 15
    doc.line(20, y, 190, y) // Horizontal line

    // Totals
    y += 10
    doc.text('Subtotal:', 130, y)
    doc.text(`₹${billData.charges.subtotal.toFixed(2)}`, 160, y)

    if (billData.charges.gstAmount > 0) {
      y += 10
      doc.text('GST (18%):', 130, y)
      doc.text(`₹${billData.charges.gstAmount.toFixed(2)}`, 160, y)
    }

    y += 10
    doc.setFontSize(12)
    doc.text('Total Amount:', 130, y)
    doc.text(`₹${billData.charges.totalAmount.toFixed(2)}`, 160, y)

    // Payment Info
    y += 20
    doc.setFontSize(10)
    doc.text(`Payment Method: ${billData.payment.method}`, 20, y)
    doc.text(`Collected By: ${billData.payment.collectedBy}`, 20, y + 10)
    doc.text(`Status: ${billData.payment.status}`, 20, y + 20)

    // Footer
    y += 40
    doc.text('Thank you for choosing our hotel!', 20, y)

    // Save PDF
    doc.save(`bill-${billData.billNumber}.pdf`)
  }

  /**
   * Export bill as Excel
   */
  static async exportToExcel(billData: BillData): Promise<void> {
    const XLSX = await import('xlsx')
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Bill Summary Sheet
    const billSummary = [
      ['HOTEL BILL/INVOICE'],
      [],
      ['Bill Number:', billData.billNumber],
      ['Date:', billData.date],
      [],
      ['HOTEL INFORMATION'],
      ['Name:', billData.hotelInfo.name],
      ['Address:', billData.hotelInfo.address],
      ['Phone:', billData.hotelInfo.phone],
      ['Email:', billData.hotelInfo.email],
      ...(billData.hotelInfo.gstNumber ? [['GST Number:', billData.hotelInfo.gstNumber]] : []),
      [],
      ['GUEST INFORMATION'],
      ['Name:', billData.booking.guestName],
      ['Email:', billData.booking.guestEmail],
      ['Phone:', billData.booking.guestPhone],
      [],
      ['BOOKING DETAILS'],
      ['Room:', `${billData.booking.roomNumber} (${billData.booking.roomType})`],
      ['Check-in:', billData.booking.checkIn],
      ['Check-out:', billData.booking.checkOut],
      ['Nights:', billData.booking.nights],
      ['Guests:', `${billData.booking.adults} adults, ${billData.booking.children} children`],
      [],
      ['CHARGES BREAKDOWN'],
      ['Description', 'Quantity', 'Rate', 'Amount'],
      [`Room Charges (${billData.booking.nights} nights)`, billData.booking.nights, billData.charges.baseAmount / billData.booking.nights, billData.charges.baseAmount],
      ...billData.charges.extraServices.map(service => [
        service.name, service.quantity, service.unitPrice, service.total
      ]),
      [],
      ['Subtotal:', '', '', billData.charges.subtotal],
      ...(billData.charges.gstAmount > 0 ? [['GST (18%):', '', '', billData.charges.gstAmount]] : []),
      ['TOTAL AMOUNT:', '', '', billData.charges.totalAmount],
      [],
      ['PAYMENT INFORMATION'],
      ['Method:', billData.payment.method],
      ['Collected By:', billData.payment.collectedBy],
      ['Status:', billData.payment.status],
      ['Date:', billData.payment.date]
    ]

    const ws = XLSX.utils.aoa_to_sheet(billSummary)
    XLSX.utils.book_append_sheet(wb, ws, 'Bill Summary')

    // Services Detail Sheet
    const servicesData = [
      ['SERVICE DETAILS'],
      [],
      ['Service Name', 'Category', 'Quantity', 'Unit Price', 'Total Amount'],
      [`Room Charges - ${billData.booking.roomType}`, 'Accommodation', billData.booking.nights, billData.charges.baseAmount / billData.booking.nights, billData.charges.baseAmount],
      ...billData.charges.extraServices.map(service => [
        service.name, 'Extra Service', service.quantity, service.unitPrice, service.total
      ])
    ]

    const ws2 = XLSX.utils.aoa_to_sheet(servicesData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Services Detail')

    // Export file
    XLSX.writeFile(wb, `bill-${billData.billNumber}.xlsx`)
  }

  /**
   * Export bill as Word document
   */
  static async exportToWord(billData: BillData): Promise<void> {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx')

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: billData.hotelInfo.name,
                bold: true,
                size: 32
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "INVOICE/BILL",
                bold: true,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun(`Bill Number: ${billData.billNumber} | Date: ${billData.date}`)
            ]
          }),
          new Paragraph({ text: "" }), // Empty line

          // Hotel Info
          new Paragraph({
            children: [
              new TextRun({
                text: "Hotel Information:",
                bold: true
              })
            ]
          }),
          new Paragraph({ text: billData.hotelInfo.address }),
          new Paragraph({ text: `Phone: ${billData.hotelInfo.phone}` }),
          new Paragraph({ text: `Email: ${billData.hotelInfo.email}` }),
          ...(billData.hotelInfo.gstNumber ? [new Paragraph({ text: `GST Number: ${billData.hotelInfo.gstNumber}` })] : []),
          new Paragraph({ text: "" }),

          // Guest Info
          new Paragraph({
            children: [
              new TextRun({
                text: "Bill To:",
                bold: true
              })
            ]
          }),
          new Paragraph({ text: billData.booking.guestName }),
          new Paragraph({ text: billData.booking.guestEmail }),
          new Paragraph({ text: billData.booking.guestPhone }),
          new Paragraph({ text: "" }),

          // Booking Details
          new Paragraph({
            children: [
              new TextRun({
                text: "Booking Details:",
                bold: true
              })
            ]
          }),
          new Paragraph({ text: `Room: ${billData.booking.roomNumber} (${billData.booking.roomType})` }),
          new Paragraph({ text: `Check-in: ${billData.booking.checkIn}` }),
          new Paragraph({ text: `Check-out: ${billData.booking.checkOut}` }),
          new Paragraph({ text: `Nights: ${billData.booking.nights} | Guests: ${billData.booking.adults} adults, ${billData.booking.children} children` }),
          new Paragraph({ text: "" }),

          // Charges Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Description", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Qty", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Rate", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Amount", bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: `Room Charges (${billData.booking.nights} nights)` })] }),
                  new TableCell({ children: [new Paragraph({ text: billData.booking.nights.toString() })] }),
                  new TableCell({ children: [new Paragraph({ text: `₹${(billData.charges.baseAmount / billData.booking.nights).toFixed(2)}` })] }),
                  new TableCell({ children: [new Paragraph({ text: `₹${billData.charges.baseAmount.toFixed(2)}` })] })
                ]
              }),
              ...billData.charges.extraServices.map(service =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: service.name })] }),
                    new TableCell({ children: [new Paragraph({ text: service.quantity.toString() })] }),
                    new TableCell({ children: [new Paragraph({ text: `₹${service.unitPrice.toFixed(2)}` })] }),
                    new TableCell({ children: [new Paragraph({ text: `₹${service.total.toFixed(2)}` })] })
                  ]
                })
              ),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Subtotal", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "" })] }),
                  new TableCell({ children: [new Paragraph({ text: "" })] }),
                  new TableCell({ children: [new Paragraph({ text: `₹${billData.charges.subtotal.toFixed(2)}`, bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "GST (18%)", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "" })] }),
                  new TableCell({ children: [new Paragraph({ text: "" })] }),
                  new TableCell({ children: [new Paragraph({ text: `₹${billData.charges.gstAmount.toFixed(2)}`, bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "TOTAL AMOUNT", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "" })] }),
                  new TableCell({ children: [new Paragraph({ text: "" })] }),
                  new TableCell({ children: [new Paragraph({ text: `₹${billData.charges.totalAmount.toFixed(2)}`, bold: true })] })
                ]
              })
            ]
          }),
          new Paragraph({ text: "" }),

          // Payment Info
          new Paragraph({
            children: [
              new TextRun({
                text: "Payment Information:",
                bold: true
              })
            ]
          }),
          new Paragraph({ text: `Payment Method: ${billData.payment.method}` }),
          new Paragraph({ text: `Collected By: ${billData.payment.collectedBy}` }),
          new Paragraph({ text: `Status: ${billData.payment.status}` }),
          new Paragraph({ text: `Date: ${billData.payment.date}` }),
          new Paragraph({ text: "" }),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: "Thank you for choosing our hotel!",
                bold: true
              })
            ]
          })
        ]
      }]
    })

    // Generate and save
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bill-${billData.billNumber}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Generate bill data from booking and extra services
   */
  static generateBillData(
    booking: any,
    extraServices: any[],
    billTotals: any,
    paymentInfo: any
  ): BillData {
    return {
      billNumber: `BILL-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      booking: {
        id: booking.id,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        roomNumber: booking.room?.roomNumber || 'N/A',
        roomType: booking.room?.roomType?.name || 'N/A',
        checkIn: new Date(booking.checkIn).toLocaleDateString(),
        checkOut: new Date(booking.checkOut).toLocaleDateString(),
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children
      },
      charges: {
        baseAmount: billTotals.baseAmount,
        extraServices: extraServices.map(service => ({
          name: service.serviceName,
          quantity: service.quantity,
          unitPrice: service.unitPrice,
          total: service.totalPrice
        })),
        subtotal: billTotals.subtotal,
        gstAmount: billTotals.gstAmount,
        totalAmount: billTotals.totalAmount
      },
      payment: {
        method: paymentInfo.paymentMode,
        collectedBy: paymentInfo.collectedBy,
        status: 'Paid',
        date: new Date().toLocaleDateString()
      },
      hotelInfo: {
        name: 'Grand Hotel & Resort',
        address: '123 Luxury Street, Downtown, City - 123456',
        phone: '+91-9876543210',
        email: 'info@grandhotel.com',
        gstNumber: 'GST123456789'
      }
    }
  }
}
