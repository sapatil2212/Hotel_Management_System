import { PrismaClient } from '@prisma/client';
import { generateInvoiceNumber } from './invoice-utils';

const prisma = new PrismaClient();

export interface InvoiceGenerationData {
  bookingId: string;
  dueDate?: Date;
  notes?: string;
  terms?: string;
}

export interface PaymentData {
  bookingId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  receivedBy?: string;
  notes?: string;
}

export class InvoiceService {
  /**
   * Generate invoice automatically from booking
   */
  static async generateInvoiceFromBooking(data: InvoiceGenerationData) {
    try {
      // Get booking with all related data
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          room: {
            include: {
              roomType: true
            }
          },
          promoCode: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { bookingId: data.bookingId }
      });

      if (existingInvoice) {
        throw new Error('Invoice already exists for this booking');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateUniqueInvoiceNumber();

      // Calculate due date (default to check-in date)
      const dueDate = data.dueDate || booking.checkIn;

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          bookingId: booking.id,
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
          baseAmount: booking.baseAmount || 0,
          discountAmount: booking.discountAmount || 0,
          gstAmount: booking.gstAmount || 0,
          serviceTaxAmount: booking.serviceTaxAmount || 0,
          otherTaxAmount: booking.otherTaxAmount || 0,
          totalTaxAmount: booking.totalTaxAmount || 0,
          totalAmount: booking.totalAmount,
          dueDate,
          notes: data.notes,
          terms: data.terms || 'Payment due upon receipt',
          status: 'pending',
          updatedAt: new Date()
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Record a payment
   */
  static async recordPayment(data: PaymentData) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          invoices: true,
          payments: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check for duplicate payment before creating
      const existingPayment = await prisma.payment.findFirst({
        where: {
          bookingId: data.bookingId,
          amount: data.amount,
          paymentMethod: data.paymentMethod as any,
          paymentDate: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
          },
        },
      });

      if (existingPayment) {
        console.log(`Duplicate payment detected for booking ${data.bookingId}, amount ${data.amount}, method ${data.paymentMethod}`);
        return existingPayment; // Return existing payment instead of creating duplicate
      }
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: data.bookingId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentMethod: data.paymentMethod as any,
          paymentReference: data.paymentReference,
          receivedBy: data.receivedBy,
          notes: data.notes,
          status: 'completed',
          updatedAt: new Date()
        }
      });

      // Update booking payment status
      const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;
      let paymentStatus = 'pending';

      if (totalPaid >= booking.totalAmount) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      }

      await prisma.booking.update({
        where: { id: data.bookingId },
        data: {
          paymentStatus: paymentStatus as any,
          paymentMethod: data.paymentMethod as any
        }
      });

      // Update invoice status if payment is for specific invoice
      if (data.invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: data.invoiceId },
          include: { payments: true }
        });

        if (invoice) {
          const invoiceTotalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;
          let invoiceStatus = 'pending';

          if (invoiceTotalPaid >= invoice.totalAmount) {
            invoiceStatus = 'paid';
          } else if (invoiceTotalPaid > 0) {
            invoiceStatus = 'partially_paid';
          }

          await prisma.invoice.update({
            where: { id: data.invoiceId },
            data: {
              status: invoiceStatus as any,
              paidDate: invoiceStatus === 'paid' ? new Date() : null
            }
          });
        }
      }

      return payment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Get all invoices with optional filtering
   */
  static async getAllInvoices(filters?: {
    status?: string;
    bookingId?: string;
  }) {
    try {
      const where: any = {};
      
      if (filters?.status) {
        where.status = filters.status;
      }
      
      if (filters?.bookingId) {
        where.bookingId = filters.bookingId;
      }

      const invoices = await prisma.invoice.findMany({
        where,
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
        },
        orderBy: {
          issuedDate: 'desc'
        }
      });

      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice with all related data
   */
  static async getInvoice(invoiceId: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          booking: {
            include: {
              room: {
                include: {
                  roomType: true
                }
              },
              promoCode: true
            }
          },
          payments: true
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for a booking
   */
  static async getInvoicesForBooking(bookingId: string) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { bookingId },
        include: {
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a booking
   */
  static async getPaymentHistory(bookingId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: { bookingId },
        include: {
          invoice: true
        },
        orderBy: { paymentDate: 'desc' }
      });

      return payments;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(invoiceId: string, status: string) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: status as any,
          paidDate: status === 'paid' ? new Date() : null
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Generate unique invoice number
   */
  private static async generateUniqueInvoiceNumber(): Promise<string> {
    let invoiceNumber: string;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      invoiceNumber = generateInvoiceNumber('INV');
      
      const existing = await prisma.invoice.findUnique({
        where: { invoiceNumber }
      });

      if (!existing) {
        exists = false;
      } else {
        attempts++;
      }
    }

    if (attempts >= 10) {
      throw new Error('Unable to generate unique invoice number');
    }

    return invoiceNumber!;
  }

  /**
   * Convert invoice to InvoiceData format for the UI component
   */
  static async convertToInvoiceData(invoice: any) {
    // Fetch hotel info for the logo and details
    let hotelInfo = {
      name: 'Your Hotel Name',
      address: [
        'Hotel Address Line 1',
        'Hotel Address Line 2', 
        'City, State ZIP',
        'Country'
      ],
      logo: undefined as string | undefined
    };

    try {
      const hotelInfoData = await prisma.hotelinfo.findFirst();
      if (hotelInfoData) {
        hotelInfo = {
          name: hotelInfoData.name || 'Your Hotel Name',
          address: hotelInfoData.address ? hotelInfoData.address.split('\n') : [
            'Hotel Address Line 1',
            'Hotel Address Line 2',
            'City, State ZIP',
            'Country'
          ],
          logo: hotelInfoData.logo || undefined
        };
      }
    } catch (error) {
      console.error('Error fetching hotel info for invoice:', error);
    }

    return {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.issuedDate).toISOString().split('T')[0],
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      terms: invoice.terms,
      company: hotelInfo,
      billTo: {
        name: invoice.guestName,
        address: [
          `Email: ${invoice.guestEmail}`,
          `Phone: ${invoice.guestPhone}`,
          `Check-in: ${new Date(invoice.checkIn).toLocaleDateString()}`,
          `Check-out: ${new Date(invoice.checkOut).toLocaleDateString()}`
        ]
      },
      shipTo: {
        address: [
          `Room: ${invoice.roomNumber}`,
          `Room Type: ${invoice.roomTypeName}`,
          `Nights: ${invoice.nights}`,
          `Guests: ${invoice.adults} adults, ${invoice.children} children`
        ]
      },
      items: [
        {
          id: 1,
          name: `${invoice.roomTypeName} - ${invoice.roomNumber}`,
          description: `${invoice.nights} nights stay (${new Date(invoice.checkIn).toLocaleDateString()} - ${new Date(invoice.checkOut).toLocaleDateString()})`,
          quantity: invoice.nights,
          unit: 'nights',
          rate: (invoice.baseAmount / invoice.nights),
          amount: invoice.baseAmount
        }
      ],
      subtotal: invoice.baseAmount,
      taxRate: invoice.totalTaxAmount > 0 ? ((invoice.totalTaxAmount / invoice.baseAmount) * 100) : 0,
      total: invoice.totalAmount,
      currency: 'USD'
    };
  }
}
