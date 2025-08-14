import { PrismaClient } from '@prisma/client';
import { TaxCalculator } from './tax-calculator';
import { RevenueHooks } from './revenue-hooks';
import { AccountService } from './account-service';
import { EnhancedAccountService } from './enhanced-account-service';

const prisma = new PrismaClient();

export interface BillItemData {
  serviceId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  gstApplicable?: boolean;
  gstPercentage?: number;
  addedBy?: string;
}

export interface SplitPaymentData {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'online_gateway' | 'cheque' | 'wallet';
  description?: string;
}

export interface BillCalculation {
  baseAmount: number;
  totalDiscount: number;
  subtotal: number;
  gstAmount: number;
  serviceTaxAmount: number;
  otherTaxAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  itemsBreakdown: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount: number;
    taxAmount: number;
    finalAmount: number;
  }>;
}

export class BillingService {
  /**
   * Add an item to the booking bill
   */
  static async addBillItem(bookingId: string, itemData: BillItemData): Promise<any> {
    try {
      // Validate booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate item totals
      const totalPrice = itemData.quantity * itemData.unitPrice;
      const discount = itemData.discount || 0;
      const discountedPrice = totalPrice - discount;

      // Calculate taxes - use custom GST if specified, otherwise use hotel default
      let taxAmount = 0;
      let taxRate = 0;
      
      if (itemData.gstApplicable && itemData.gstPercentage) {
        // Use custom GST percentage
        taxAmount = (discountedPrice * itemData.gstPercentage) / 100;
        taxRate = itemData.gstPercentage;
      } else {
        // Use hotel default tax calculation
        const taxCalculation = await TaxCalculator.calculateTaxes(discountedPrice);
        taxAmount = taxCalculation.totalTax;
        taxRate = (taxCalculation.gst || 0) + (taxCalculation.serviceTax || 0) + (taxCalculation.otherTax || 0);
      }
      
      const finalAmount = discountedPrice + taxAmount;

      // Create bill item
      const billItem = await prisma.bill_item.create({
        data: {
          bookingId,
          serviceId: itemData.serviceId,
          itemName: itemData.itemName,
          description: itemData.description,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          totalPrice,
          discount,
          taxRate,
          taxAmount,
          finalAmount,
          addedBy: itemData.addedBy,
        },
      });

      // Recalculate booking total
      await this.recalculateBookingTotal(bookingId);

      return billItem;
    } catch (error) {
      console.error('Error adding bill item:', error);
      throw error;
    }
  }

  /**
   * Remove an item from the booking bill
   */
  static async removeBillItem(billItemId: string): Promise<void> {
    try {
      const billItem = await prisma.bill_item.findUnique({
        where: { id: billItemId },
      });

      if (!billItem) {
        throw new Error('Bill item not found');
      }

      const bookingId = billItem.bookingId;

      // Delete the bill item
      await prisma.bill_item.delete({
        where: { id: billItemId },
      });

      // Recalculate booking total
      await this.recalculateBookingTotal(bookingId);
    } catch (error) {
      console.error('Error removing bill item:', error);
      throw error;
    }
  }

  /**
   * Update a bill item
   */
  static async updateBillItem(billItemId: string, updateData: Partial<BillItemData>): Promise<any> {
    try {
      const existingItem = await prisma.bill_item.findUnique({
        where: { id: billItemId },
      });

      if (!existingItem) {
        throw new Error('Bill item not found');
      }

      // Calculate new totals if quantity or price changed
      const quantity = updateData.quantity ?? existingItem.quantity;
      const unitPrice = updateData.unitPrice ?? existingItem.unitPrice;
      const discount = updateData.discount ?? existingItem.discount;

      const totalPrice = quantity * unitPrice;
      const discountedPrice = totalPrice - discount;

      // Calculate taxes using the tax calculator
      const taxCalculation = await TaxCalculator.calculateTaxes(discountedPrice);
      const taxAmount = taxCalculation.totalTax;
      const finalAmount = discountedPrice + taxAmount;

      // Update bill item
      const updatedItem = await prisma.bill_item.update({
        where: { id: billItemId },
        data: {
          ...updateData,
          quantity,
          unitPrice,
          totalPrice,
          discount,
          taxRate: (taxCalculation.gst || 0) + (taxCalculation.serviceTax || 0) + (taxCalculation.otherTax || 0),
          taxAmount,
          finalAmount,
        },
      });

      // Recalculate booking total
      await this.recalculateBookingTotal(existingItem.bookingId);

      return updatedItem;
    } catch (error) {
      console.error('Error updating bill item:', error);
      throw error;
    }
  }

  /**
   * Get all bill items for a booking
   */
  static async getBillItems(bookingId: string): Promise<any[]> {
    try {
      return await prisma.bill_item.findMany({
        where: { bookingId },
        include: {
          service: true,
        },
        orderBy: { addedAt: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching bill items:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive bill breakdown
   */
  static async calculateBill(bookingId: string): Promise<BillCalculation> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          billItems: {
            include: { service: true },
          },
          room: {
            include: { roomType: true },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate room charges - use existing baseAmount or calculate from room price
      const roomPrice = booking.room?.roomType?.price || 0;
      const roomBaseAmount = booking.baseAmount || (roomPrice * booking.nights);
      
      // Calculate add-on services
      const addOnItems = booking.billItems.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        discount: item.discount,
        taxAmount: item.taxAmount,
        finalAmount: item.finalAmount,
      }));

      const addOnTotal = booking.billItems.reduce((sum, item) => sum + item.finalAmount, 0);

      // Calculate total amounts
      const baseAmount = roomBaseAmount + booking.billItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalDiscount = (booking.discountAmount || 0) + booking.billItems.reduce((sum, item) => sum + item.discount, 0);
      const subtotal = baseAmount - totalDiscount;

      // Calculate taxes
      const taxCalculation = await TaxCalculator.calculateTaxes(subtotal);
      
      const totalAmount = subtotal + taxCalculation.totalTax;

      return {
        baseAmount,
        totalDiscount,
        subtotal,
        gstAmount: taxCalculation.gst || 0,
        serviceTaxAmount: taxCalculation.serviceTax || 0,
        otherTaxAmount: taxCalculation.otherTax || 0,
        totalTaxAmount: taxCalculation.totalTax || 0,
        totalAmount,
        itemsBreakdown: [
          {
            itemName: `${booking.room?.roomType?.name || 'Room'} (${booking.nights} nights)`,
            quantity: booking.nights,
            unitPrice: roomPrice,
            totalPrice: roomBaseAmount,
            discount: booking.discountAmount || 0,
            taxAmount: 0, // Room tax calculated separately
            finalAmount: roomBaseAmount - (booking.discountAmount || 0),
          },
          ...addOnItems,
        ],
      };
    } catch (error) {
      console.error('Error calculating bill:', error);
      throw error;
    }
  }

  /**
   * Recalculate and update booking total amount
   */
  static async recalculateBookingTotal(bookingId: string): Promise<void> {
    try {
      const calculation = await this.calculateBill(bookingId);

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          totalAmount: calculation.totalAmount,
          baseAmount: calculation.baseAmount || 0,
          discountAmount: calculation.totalDiscount || 0,
          gstAmount: calculation.gstAmount || 0,
          serviceTaxAmount: calculation.serviceTaxAmount || 0,
          otherTaxAmount: calculation.otherTaxAmount || 0,
          totalTaxAmount: calculation.totalTaxAmount || 0,
        },
      });
    } catch (error) {
      console.error('Error recalculating booking total:', error);
      throw error;
    }
  }

  /**
   * Set up split payments for a booking
   */
  static async setupSplitPayments(bookingId: string, splitPayments: SplitPaymentData[]): Promise<any[]> {
    try {
      // Validate total amount matches booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const totalSplitAmount = splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      if (Math.abs(totalSplitAmount - booking.totalAmount) > 0.01) {
        throw new Error('Split payment total does not match booking amount');
      }

      // Clear existing split payments
      await prisma.split_payment.deleteMany({
        where: { bookingId },
      });

      // Create new split payments
      const createdPayments = await Promise.all(
        splitPayments.map(payment =>
          prisma.split_payment.create({
            data: {
              bookingId,
              amount: payment.amount,
              paymentMethod: payment.paymentMethod,
              description: payment.description,
              updatedAt: new Date(), // Explicitly set updatedAt
            },
          })
        )
      );

      return createdPayments;
    } catch (error) {
      console.error('Error setting up split payments:', error);
      throw error;
    }
  }

  /**
   * Process a payment (single or split)
   */
  static async processPayment(
    bookingId: string,
    amount: number,
    paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'online_gateway' | 'cheque' | 'wallet',
    paymentReference?: string,
    receivedBy?: string,
    notes?: string,
    gatewayResponse?: string,
    transactionId?: string
  ): Promise<any> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          amount,
          paymentMethod,
          paymentReference,
          receivedBy,
          notes,
          gatewayResponse,
          transactionId,
          updatedAt: new Date(), // Explicitly set updatedAt
        },
      });

      // Calculate total paid amount
      const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0) + amount;

      // Update payment status
      let paymentStatus: 'pending' | 'partially_paid' | 'paid' | 'overdue';
      
      if (totalPaid >= booking.totalAmount) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      } else {
        paymentStatus = 'pending';
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus },
      });

      // Update revenue if payment status changed to paid
      if (paymentStatus === 'paid') {
        try {
          console.log(`💰 Payment completed for booking ${bookingId} - Amount: ${amount}`);
          
          // Update revenue reports
          await RevenueHooks.onPaymentCompleted(bookingId, amount);
          
          // Add to bank account system
          await this.processPaymentToAccount(bookingId, amount, paymentMethod, receivedBy);
          
          console.log(`✅ Revenue and account updates completed for booking ${bookingId}`);
        } catch (revenueError) {
          console.error(`❌ Error updating revenue for booking ${bookingId}:`, revenueError);
          // Don't fail the payment if revenue update fails, but log it
        }
      }

      return payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Process payment to account system with user account allocation
   */
  static async processPaymentToAccount(
    bookingId: string, 
    totalAmount: number, 
    paymentMethod: string, 
    receivedBy?: string
  ): Promise<void> {
    try {
      // Get booking details with bill items
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          billItems: {
            include: { service: true },
          },
          room: {
            include: { roomType: true },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate service breakdown
      const serviceBreakdown = {
        accommodation: booking.baseAmount || (booking.room.roomType.price * booking.nights),
        foodBeverage: 0,
        spa: 0,
        transport: 0,
        laundry: 0,
        minibar: 0,
        conference: 0,
        other: 0,
      };

      // Calculate service amounts
      booking.billItems.forEach(item => {
        if (item.service) {
          switch (item.service.category) {
            case 'food_beverage':
              serviceBreakdown.foodBeverage += item.finalAmount;
              break;
            case 'spa':
              serviceBreakdown.spa += item.finalAmount;
              break;
            case 'transport':
              serviceBreakdown.transport += item.finalAmount;
              break;
            case 'laundry':
              serviceBreakdown.laundry += item.finalAmount;
              break;
            case 'minibar':
              serviceBreakdown.minibar += item.finalAmount;
              break;
            case 'conference':
              serviceBreakdown.conference += item.finalAmount;
              break;
            default:
              serviceBreakdown.other += item.finalAmount;
          }
        } else {
          serviceBreakdown.other += item.finalAmount;
        }
      });

      // Try to find user by email for user account allocation
      let guestUserId: string | undefined;
      try {
        const user = await prisma.user.findUnique({
          where: { email: booking.guestEmail },
          select: { id: true },
        });
        guestUserId = user?.id;
      } catch (error) {
        // Guest might not be a registered user, continue without user account allocation
      }

      // Process payment revenue to enhanced account system
      await EnhancedAccountService.processPaymentRevenue(
        bookingId,
        totalAmount,
        serviceBreakdown,
        paymentMethod,
        receivedBy || 'System',
        guestUserId
      );

    } catch (error) {
      console.error('Error processing payment to account:', error);
      // Don't throw error to prevent payment processing failure
    }
  }

  /**
   * Modify payment amount with proper audit trail
   */
  static async modifyPayment(
    bookingId: string,
    originalAmount: number,
    newAmount: number,
    reason: string,
    processedBy: string
  ): Promise<void> {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { guestEmail: true },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Try to find user by email for user account allocation
      let guestUserId: string | undefined;
      try {
        const user = await prisma.user.findUnique({
          where: { email: booking.guestEmail },
          select: { id: true },
        });
        guestUserId = user?.id;
      } catch (error) {
        // Guest might not be a registered user, continue without user account allocation
      }

      // Process payment modification in enhanced account system
      await EnhancedAccountService.processPaymentModification(
        bookingId,
        originalAmount,
        newAmount,
        reason,
        processedBy,
        guestUserId
      );

    } catch (error) {
      console.error('Error modifying payment in accounts:', error);
      throw error;
    }
  }

  /**
   * Reverse payment from account system
   */
  static async reversePaymentFromAccount(
    bookingId: string,
    totalAmount: number,
    processedBy?: string
  ): Promise<void> {
    try {
      // Get booking details with bill items
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          billItems: {
            include: { service: true },
          },
          room: {
            include: { roomType: true },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate original service breakdown
      const serviceBreakdown = {
        accommodation: booking.baseAmount || (booking.room.roomType.price * booking.nights),
        foodBeverage: 0,
        spa: 0,
        transport: 0,
        laundry: 0,
        minibar: 0,
        other: 0,
      };

      // Calculate service amounts
      booking.billItems.forEach(item => {
        if (item.service) {
          switch (item.service.category) {
            case 'food_beverage':
              serviceBreakdown.foodBeverage += item.finalAmount;
              break;
            case 'spa':
              serviceBreakdown.spa += item.finalAmount;
              break;
            case 'transport':
              serviceBreakdown.transport += item.finalAmount;
              break;
            case 'laundry':
              serviceBreakdown.laundry += item.finalAmount;
              break;
            case 'minibar':
              serviceBreakdown.minibar += item.finalAmount;
              break;
            default:
              serviceBreakdown.other += item.finalAmount;
          }
        } else {
          serviceBreakdown.other += item.finalAmount;
        }
      });

      // Reverse payment revenue from account system
      await AccountService.reversePaymentRevenue(
        bookingId,
        totalAmount,
        serviceBreakdown,
        processedBy || 'System'
      );

    } catch (error) {
      console.error('Error reversing payment from account:', error);
      // Don't throw error to prevent status change failure
    }
  }

  /**
   * Get payment summary for a booking
   */
  static async getPaymentSummary(bookingId: string): Promise<{
    totalAmount: number;
    totalPaid: number;
    remainingAmount: number;
    paymentStatus: string;
    payments: any[];
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = booking.totalAmount - totalPaid;

      return {
        totalAmount: booking.totalAmount,
        totalPaid,
        remainingAmount: Math.max(0, remainingAmount),
        paymentStatus: booking.paymentStatus,
        payments: booking.payments,
      };
    } catch (error) {
      console.error('Error getting payment summary:', error);
      throw error;
    }
  }

  /**
   * Get services for billing
   */
  static async getServices(category?: string): Promise<any[]> {
    try {
      return await prisma.service.findMany({
        where: {
          isActive: true,
          ...(category && { category: category as any }),
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  static async createService(serviceData: {
    name: string;
    description?: string;
    category: 'accommodation' | 'food_beverage' | 'spa' | 'transport' | 'laundry' | 'minibar' | 'conference' | 'other';
    price: number;
    taxable?: boolean;
  }): Promise<any> {
    try {
      return await prisma.service.create({
        data: serviceData,
      });
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Update payment status based on overdue check
   */
  static async updateOverduePayments(): Promise<void> {
    try {
      const overdueBookings = await prisma.booking.findMany({
        where: {
          paymentStatus: { in: ['pending', 'partially_paid'] },
          checkOut: { lt: new Date() },
        },
      });

      for (const booking of overdueBookings) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: 'overdue' },
        });
      }
    } catch (error) {
      console.error('Error updating overdue payments:', error);
      throw error;
    }
  }
}
