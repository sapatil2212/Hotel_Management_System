import { PrismaClient } from '@prisma/client';
import { TaxCalculator } from './tax-calculator';
import { BillingService } from './billing-service';
import QRCode from 'qrcode';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface EnhancedInvoiceGenerationData {
  bookingId: string;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  includeQRCode?: boolean;
  sendEmail?: boolean;
  sendWhatsApp?: boolean;
}

export interface InvoiceItemData {
  serviceId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface GSTInvoiceData {
  invoiceNumber: string;
  issuedDate: Date;
  dueDate: Date;
  hotelInfo: {
    name: string;
    gstNumber?: string;
    address: string[];
    phone?: string;
    email?: string;
    logo?: string;
  };
  guestInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  bookingInfo: {
    checkIn: Date;
    checkOut: Date;
    nights: number;
    adults: number;
    children: number;
    roomType: string;
    roomNumber: string;
  };
  items: Array<{
    description: string;
    hsn?: string;
    quantity: number;
    rate: number;
    amount: number;
    discount: number;
    taxableAmount: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
  }>;
  totals: {
    subtotal: number;
    totalDiscount: number;
    taxableAmount: number;
    totalCGST: number;
    totalSGST: number;
    totalIGST: number;
    totalGST: number;
    grandTotal: number;
  };
  paymentInfo: {
    totalPaid: number;
    remainingAmount: number;
    paymentStatus: string;
  };
  qrCode?: string;
  notes?: string;
  terms?: string;
}

export class EnhancedInvoiceService {
  /**
   * Generate GST-compliant invoice from booking
   */
  static async generateGSTInvoice(data: EnhancedInvoiceGenerationData): Promise<any> {
    try {
      // Get booking with all related data
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          room: {
            include: { roomType: true },
          },
          billItems: {
            include: { service: true },
          },
          payments: true,
          promoCode: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { bookingId: data.bookingId },
      });

      if (existingInvoice) {
        // Return existing invoice instead of throwing error
        return existingInvoice;
      }

      // Get hotel information
      const hotelInfo = await prisma.hotelinfo.findFirst();
      if (!hotelInfo) {
        throw new Error('Hotel information not configured');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Calculate bill breakdown
      const billCalculation = await BillingService.calculateBill(data.bookingId);

      // Prepare invoice items
      const invoiceItems: InvoiceItemData[] = [
        {
          itemName: `${booking.room.roomType.name} Accommodation`,
          description: `${booking.nights} nights stay`,
          quantity: booking.nights,
          unitPrice: booking.room.roomType.price,
          discount: booking.discountAmount || 0,
        },
      ];

      // Add bill items (services)
      booking.billItems.forEach(item => {
        invoiceItems.push({
          serviceId: item.serviceId || undefined,
          itemName: item.itemName,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        });
      });

      // Calculate GST breakdown for each item
      const processedItems = await Promise.all(
        invoiceItems.map(async item => {
          const itemTotal = item.quantity * item.unitPrice;
          const discountedAmount = itemTotal - (item.discount || 0);
          const taxBreakdown = await TaxCalculator.calculateTaxes(discountedAmount);

          return {
            description: item.itemName,
            hsn: this.getHSNCode(item.itemName),
            quantity: item.quantity,
            rate: item.unitPrice,
            amount: itemTotal,
            discount: item.discount || 0,
            taxableAmount: discountedAmount,
            gstRate: hotelInfo.gstPercentage || 18,
            cgst: taxBreakdown.gst / 2, // Split GST into CGST and SGST
            sgst: taxBreakdown.gst / 2,
            igst: 0, // Use IGST for inter-state transactions
            totalAmount: taxBreakdown.totalAmount,
          };
        })
      );

      // Calculate totals
      const totals = {
        subtotal: processedItems.reduce((sum, item) => sum + item.amount, 0),
        totalDiscount: processedItems.reduce((sum, item) => sum + item.discount, 0),
        taxableAmount: processedItems.reduce((sum, item) => sum + item.taxableAmount, 0),
        totalCGST: processedItems.reduce((sum, item) => sum + item.cgst, 0),
        totalSGST: processedItems.reduce((sum, item) => sum + item.sgst, 0),
        totalIGST: processedItems.reduce((sum, item) => sum + item.igst, 0),
        totalGST: processedItems.reduce((sum, item) => sum + item.cgst + item.sgst + item.igst, 0),
        grandTotal: processedItems.reduce((sum, item) => sum + item.totalAmount, 0),
      };

      // Generate QR code if requested
      let qrCodeData = '';
      if (data.includeQRCode) {
        const qrInfo = {
          seller: hotelInfo.name,
          gst: hotelInfo.gstNumber,
          invoice: invoiceNumber,
          amount: totals.grandTotal,
          date: new Date().toISOString().split('T')[0],
        };
        qrCodeData = await QRCode.toDataURL(JSON.stringify(qrInfo));
      }

      // Get payment summary
      const paymentSummary = await BillingService.getPaymentSummary(data.bookingId);

      // Create invoice record
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          bookingId: data.bookingId,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          adults: booking.adults,
          children: booking.children,
          roomTypeName: booking.room.roomType.name,
          roomNumber: booking.room.roomNumber,
          baseAmount: billCalculation.baseAmount,
          discountAmount: billCalculation.totalDiscount,
          gstAmount: billCalculation.gstAmount,
          serviceTaxAmount: billCalculation.serviceTaxAmount,
          otherTaxAmount: billCalculation.otherTaxAmount,
          totalTaxAmount: billCalculation.totalTaxAmount,
          totalAmount: billCalculation.totalAmount,
          dueDate: data.dueDate || booking.checkIn,
          notes: data.notes,
          terms: data.terms || 'Payment due upon receipt',
          qrCode: qrCodeData,
          emailSent: false,
          whatsappSent: false,
          updatedAt: new Date(), // Explicitly set updatedAt
        },
      });

      // Create invoice items
      await Promise.all(
        processedItems.map(item =>
          prisma.invoice_item.create({
            data: {
              invoiceId: invoice.id,
              serviceId: invoiceItems.find(i => i.itemName === item.description)?.serviceId,
              itemName: item.description,
              description: `HSN: ${item.hsn}`,
              quantity: item.quantity,
              unitPrice: item.rate,
              totalPrice: item.amount,
              discount: item.discount,
              taxRate: item.gstRate,
              taxAmount: item.cgst + item.sgst + item.igst,
              finalAmount: item.totalAmount,
            },
          })
        )
      );

      // Send email and WhatsApp if requested
      if (data.sendEmail) {
        await this.sendInvoiceEmail(invoice.id);
      }

      if (data.sendWhatsApp) {
        await this.sendInvoiceWhatsApp(invoice.id);
      }

      return {
        invoice,
        gstData: {
          invoiceNumber,
          issuedDate: invoice.issuedDate,
          dueDate: invoice.dueDate,
          hotelInfo: {
            name: hotelInfo.name,
            gstNumber: hotelInfo.gstNumber,
            address: this.formatHotelAddress(hotelInfo),
            phone: hotelInfo.primaryPhone,
            email: hotelInfo.primaryEmail,
            logo: hotelInfo.logo,
          },
          guestInfo: {
            name: booking.guestName,
            email: booking.guestEmail,
            phone: booking.guestPhone,
          },
          bookingInfo: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            adults: booking.adults,
            children: booking.children,
            roomType: booking.room.roomType.name,
            roomNumber: booking.room.roomNumber,
          },
          items: processedItems,
          totals,
          paymentInfo: {
            totalPaid: paymentSummary.totalPaid,
            remainingAmount: paymentSummary.remainingAmount,
            paymentStatus: paymentSummary.paymentStatus,
          },
          qrCode: qrCodeData,
          notes: data.notes,
          terms: data.terms || 'Payment due upon receipt',
        } as GSTInvoiceData,
      };
    } catch (error) {
      console.error('Error generating GST invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice with full GST data
   */
  static async getGSTInvoice(invoiceId: string): Promise<GSTInvoiceData> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          booking: {
            include: {
              room: { include: { roomType: true } },
              payments: true,
            },
          },
          invoiceItems: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const hotelInfo = await prisma.hotelinfo.findFirst();
      if (!hotelInfo) {
        throw new Error('Hotel information not configured');
      }

      const paymentSummary = await BillingService.getPaymentSummary(invoice.bookingId);

      // Process items for GST display
      const items = invoice.invoiceItems.map(item => ({
        description: item.itemName,
        hsn: this.getHSNCode(item.itemName),
        quantity: item.quantity,
        rate: item.unitPrice,
        amount: item.totalPrice,
        discount: item.discount,
        taxableAmount: item.totalPrice - item.discount,
        gstRate: item.taxRate,
        cgst: item.taxAmount / 2,
        sgst: item.taxAmount / 2,
        igst: 0,
        totalAmount: item.finalAmount,
      }));

      const totals = {
        subtotal: items.reduce((sum, item) => sum + item.amount, 0),
        totalDiscount: items.reduce((sum, item) => sum + item.discount, 0),
        taxableAmount: items.reduce((sum, item) => sum + item.taxableAmount, 0),
        totalCGST: items.reduce((sum, item) => sum + item.cgst, 0),
        totalSGST: items.reduce((sum, item) => sum + item.sgst, 0),
        totalIGST: items.reduce((sum, item) => sum + item.igst, 0),
        totalGST: items.reduce((sum, item) => sum + item.cgst + item.sgst + item.igst, 0),
        grandTotal: items.reduce((sum, item) => sum + item.totalAmount, 0),
      };

      return {
        invoiceNumber: invoice.invoiceNumber,
        issuedDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        hotelInfo: {
          name: hotelInfo.name,
          gstNumber: hotelInfo.gstNumber || undefined,
          address: this.formatHotelAddress(hotelInfo),
          phone: hotelInfo.primaryPhone || undefined,
          email: hotelInfo.primaryEmail || undefined,
          logo: hotelInfo.logo || undefined,
        },
        guestInfo: {
          name: invoice.guestName,
          email: invoice.guestEmail,
          phone: invoice.guestPhone,
        },
        bookingInfo: {
          checkIn: invoice.checkIn,
          checkOut: invoice.checkOut,
          nights: invoice.nights,
          adults: invoice.adults,
          children: invoice.children,
          roomType: invoice.roomTypeName,
          roomNumber: invoice.roomNumber,
        },
        items,
        totals,
        paymentInfo: {
          totalPaid: paymentSummary.totalPaid,
          remainingAmount: paymentSummary.remainingAmount,
          paymentStatus: paymentSummary.paymentStatus,
        },
        qrCode: invoice.qrCode || '',
        notes: invoice.notes || undefined,
        terms: invoice.terms || undefined,
      };
    } catch (error) {
      console.error('Error getting GST invoice:', error);
      throw error;
    }
  }

  /**
   * Send invoice via email
   */
  static async sendInvoiceEmail(invoiceId: string): Promise<void> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: Implement email sending logic
      // This should integrate with your email service
      console.log(`Sending invoice ${invoice.invoiceNumber} to ${invoice.guestEmail}`);

      // Update email sent status
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { emailSent: true },
      });
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  }

  /**
   * Send invoice via WhatsApp
   */
  static async sendInvoiceWhatsApp(invoiceId: string): Promise<void> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: Implement WhatsApp sending logic
      // This should integrate with WhatsApp Business API
      console.log(`Sending invoice ${invoice.invoiceNumber} to ${invoice.guestPhone} via WhatsApp`);

      // Update WhatsApp sent status
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { whatsappSent: true },
      });
    } catch (error) {
      console.error('Error sending invoice WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Generate unique invoice number
   */
  private static async generateInvoiceNumber(): Promise<string> {
    const hotelInfo = await prisma.hotelinfo.findFirst();
    const prefix = hotelInfo?.name ? hotelInfo.name.substring(0, 3).toUpperCase() : 'HTL';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get the last invoice number for this month
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `${prefix}-${year}${month}`,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Get HSN code for item
   */
  private static getHSNCode(itemName: string): string {
    const hsnCodes: { [key: string]: string } = {
      'accommodation': '9963',
      'food': '9963',
      'beverage': '9963',
      'spa': '9504',
      'laundry': '9601',
      'transport': '9964',
      'minibar': '9963',
      'conference': '9992',
    };

    for (const [key, code] of Object.entries(hsnCodes)) {
      if (itemName.toLowerCase().includes(key)) {
        return code;
      }
    }

    return '9963'; // Default HSN for hotel services
  }

  /**
   * Format hotel address for invoice
   */
  private static formatHotelAddress(hotelInfo: any): string[] {
    if (!hotelInfo.address) return [];
    
    const address = hotelInfo.address.split('\n').filter((line: string) => line.trim());
    return address;
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(
    invoiceId: string,
    status: 'pending' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  ): Promise<void> {
    try {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { 
          status,
          paidDate: status === 'paid' ? new Date() : null,
        },
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Get invoices with filtering
   */
  static async getInvoices(filters: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    guestName?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ invoices: any[]; total: number }> {
    try {
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.issuedDate = {};
        if (filters.dateFrom) where.issuedDate.gte = filters.dateFrom;
        if (filters.dateTo) where.issuedDate.lte = filters.dateTo;
      }

      if (filters.guestName) {
        where.guestName = {
          contains: filters.guestName,
          mode: 'insensitive',
        };
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            booking: {
              include: {
                room: { include: { roomType: true } },
              },
            },
            payments: true,
          },
          orderBy: { issuedDate: 'desc' },
          take: filters.limit || 50,
          skip: filters.offset || 0,
        }),
        prisma.invoice.count({ where }),
      ]);

      return { invoices, total };
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  /**
   * Create guest billing access token
   */
  static async createGuestBillingAccess(bookingId: string): Promise<string> {
    try {
      const accessToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days access

      await prisma.guest_billing_view.create({
        data: {
          bookingId,
          accessToken,
          expiresAt,
          updatedAt: new Date(), // Explicitly set updatedAt
        },
      });

      return accessToken;
    } catch (error) {
      console.error('Error creating guest billing access:', error);
      throw error;
    }
  }

  /**
   * Get billing info for guest view
   */
  static async getGuestBillingInfo(accessToken: string): Promise<any> {
    try {
      const billingView = await prisma.guest_billing_view.findUnique({
        where: { accessToken },
        include: {
          booking: {
            include: {
              room: { include: { roomType: true } },
              billItems: { include: { service: true } },
              payments: true,
              invoices: true,
            },
          },
        },
      });

      if (!billingView || billingView.expiresAt < new Date() || !billingView.isActive) {
        throw new Error('Invalid or expired access token');
      }

      // Update view count and last viewed
      await prisma.guest_billing_view.update({
        where: { id: billingView.id },
        data: {
          viewCount: billingView.viewCount + 1,
          lastViewed: new Date(),
        },
      });

      const billCalculation = await BillingService.calculateBill(billingView.bookingId);
      const paymentSummary = await BillingService.getPaymentSummary(billingView.bookingId);

      return {
        booking: billingView.booking,
        billCalculation,
        paymentSummary,
        viewInfo: {
          viewCount: billingView.viewCount + 1,
          lastViewed: new Date(),
        },
      };
    } catch (error) {
      console.error('Error getting guest billing info:', error);
      throw error;
    }
  }
}
