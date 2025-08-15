import { PrismaClient } from '@prisma/client';
import { RevenueService } from './revenue-service';
import { startOfDay, startOfMonth, startOfYear } from 'date-fns';

const prisma = new PrismaClient();

export class RevenueHooks {
  /**
   * Update revenue when payment status changes to paid
   */
  static async onPaymentCompleted(bookingId: string, amount: number, paymentDate: Date = new Date()) {
    try {
      console.log(`🔄 Starting revenue update for booking ${bookingId} - Amount: ${amount}`);
      
      // Get booking details for better logging
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          guestName: true,
          totalAmount: true,
          paymentStatus: true,
          checkIn: true,
        },
      });

      if (!booking) {
        console.error(`❌ Booking ${bookingId} not found for revenue update`);
        return;
      }

      console.log(`📊 Updating revenue for ${booking.guestName} - Total: ${booking.totalAmount}, Payment: ${amount}`);

      // Update daily revenue
      console.log(`📅 Updating daily revenue for ${paymentDate.toDateString()}`);
      await RevenueService.updateRevenueReport(paymentDate, 'daily');
      
      // Update monthly revenue
      console.log(`📅 Updating monthly revenue for ${paymentDate.toDateString()}`);
      await RevenueService.updateRevenueReport(paymentDate, 'monthly');
      
      // Update yearly revenue
      console.log(`📅 Updating yearly revenue for ${paymentDate.toDateString()}`);
      await RevenueService.updateRevenueReport(paymentDate, 'yearly');

      // Log successful revenue update
      console.log(`✅ Revenue updated successfully for booking ${bookingId}`);
      console.log(`💰 Guest: ${booking.guestName}, Amount: ${amount}, Date: ${paymentDate.toISOString()}`);

      // Create revenue update log for audit trail
      await this.createRevenueUpdateLog(bookingId, amount, 'payment_completed', paymentDate);

    } catch (error) {
      console.error('❌ Error updating revenue on payment completion:', error);
      
      // Create error log
      await this.createRevenueErrorLog(bookingId, amount, 'payment_completed', error);
      
      // Re-throw error to ensure payment processing knows about the failure
      throw error;
    }
  }

  /**
   * Reverse revenue when payment status changes from paid to pending/cancelled
   */
  static async onPaymentReversed(bookingId: string, amount: number, originalDate: Date = new Date()) {
    try {
      console.log(`🔄 Starting revenue reversal for booking ${bookingId} - Amount: ${amount}`);
      
      // Get the booking to determine service categories
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          billItems: {
            include: { service: true },
          },
        },
      });

      if (!booking) {
        console.error('❌ Booking not found for revenue reversal');
        return;
      }

      console.log(`📊 Reversing revenue for ${booking.guestName} - Amount: ${amount}`);

      // Calculate how much to reverse from each category
      const categoryAmounts = this.calculateCategoryAmounts(booking, amount);

      // Reverse daily revenue
      console.log(`📅 Reversing daily revenue for ${originalDate.toDateString()}`);
      await this.reverseRevenueReport(originalDate, 'daily', categoryAmounts);
      
      // Reverse monthly revenue
      console.log(`📅 Reversing monthly revenue for ${originalDate.toDateString()}`);
      await this.reverseRevenueReport(originalDate, 'monthly', categoryAmounts);
      
      // Reverse yearly revenue
      console.log(`📅 Reversing yearly revenue for ${originalDate.toDateString()}`);
      await this.reverseRevenueReport(originalDate, 'yearly', categoryAmounts);

      console.log(`✅ Revenue reversed successfully for booking ${bookingId}`);
      
      // Create revenue reversal log for audit trail
      await this.createRevenueUpdateLog(bookingId, amount, 'payment_reversed', originalDate);

    } catch (error) {
      console.error('❌ Error reversing revenue:', error);
      
      // Create error log
      await this.createRevenueErrorLog(bookingId, amount, 'payment_reversed', error);
      
      // Re-throw error to ensure status change knows about the failure
      throw error;
    }
  }

  /**
   * Calculate how much revenue to assign to each category
   */
  private static calculateCategoryAmounts(booking: any, totalAmount: number): {
    accommodation: number;
    foodBeverage: number;
    spa: number;
    transport: number;
    laundry: number;
    minibar: number;
    other: number;
  } {
    const categoryAmounts = {
      accommodation: 0,
      foodBeverage: 0,
      spa: 0,
      transport: 0,
      laundry: 0,
      minibar: 0,
      other: 0,
    };

    // Calculate room revenue (base accommodation)
    const roomRevenue = booking.baseAmount || (booking.totalAmount * 0.7); // Assume 70% is room if baseAmount not available
    categoryAmounts.accommodation = roomRevenue;

    // Calculate service revenue by category
    booking.billItems.forEach((item: any) => {
      if (item.service) {
        switch (item.service.category) {
          case 'food_beverage':
            categoryAmounts.foodBeverage += item.finalAmount;
            break;
          case 'spa':
            categoryAmounts.spa += item.finalAmount;
            break;
          case 'transport':
            categoryAmounts.transport += item.finalAmount;
            break;
          case 'laundry':
            categoryAmounts.laundry += item.finalAmount;
            break;
          case 'minibar':
            categoryAmounts.minibar += item.finalAmount;
            break;
          default:
            categoryAmounts.other += item.finalAmount;
        }
      } else {
        categoryAmounts.other += item.finalAmount;
      }
    });

    return categoryAmounts;
  }

  /**
   * Reverse revenue report for a specific period
   */
  private static async reverseRevenueReport(
    date: Date, 
    periodType: 'daily' | 'monthly' | 'yearly',
    categoryAmounts: any
  ) {
    try {
      let reportDate: Date;

      switch (periodType) {
        case 'daily':
          reportDate = startOfDay(date);
          break;
        case 'monthly':
          reportDate = startOfMonth(date);
          break;
        case 'yearly':
          reportDate = startOfYear(date);
          break;
      }

      const existingReport = await prisma.revenue_report.findFirst({
        where: {
          date: reportDate,
          period_type: periodType,
        },
      });

      if (existingReport) {
        const totalReversal = Object.values(categoryAmounts).reduce((sum: number, val: unknown) => sum + (val as number), 0);
        
        console.log(`📊 Reversing ${periodType} revenue: ${totalReversal}`);
        
        await prisma.revenue_report.update({
          where: { id: existingReport.id },
          data: {
            accommodation_revenue: Math.max(0, existingReport.accommodation_revenue - categoryAmounts.accommodation),
            food_beverage_revenue: Math.max(0, existingReport.food_beverage_revenue - categoryAmounts.foodBeverage),
            spa_revenue: Math.max(0, existingReport.spa_revenue - categoryAmounts.spa),
            transport_revenue: Math.max(0, existingReport.transport_revenue - categoryAmounts.transport),
            laundry_revenue: Math.max(0, existingReport.laundry_revenue - categoryAmounts.laundry),
            minibar_revenue: Math.max(0, existingReport.minibar_revenue - categoryAmounts.minibar),
            other_revenue: Math.max(0, existingReport.other_revenue - categoryAmounts.other),
            total_revenue: Math.max(0, existingReport.total_revenue - totalReversal),
            total_bookings: Math.max(0, existingReport.total_bookings - 1),
          },
        });
        
        console.log(`✅ ${periodType} revenue reversed successfully`);
      } else {
        console.log(`⚠️ No ${periodType} revenue report found for ${reportDate.toDateString()}`);
      }
    } catch (error) {
      console.error(`❌ Error reversing ${periodType} revenue report:`, error);
      throw error;
    }
  }

  /**
   * Update revenue when new services are added to a paid booking
   */
  static async onServicesAdded(bookingId: string, additionalAmount: number) {
    try {
      console.log(`🔄 Checking revenue update for added services - Booking: ${bookingId}, Amount: ${additionalAmount}`);
      
      // Check if booking is paid
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { paymentStatus: true, guestName: true },
      });

      if (booking && booking.paymentStatus === 'paid') {
        console.log(`📊 Adding revenue for paid booking ${booking.guestName} - Additional: ${additionalAmount}`);
        await this.onPaymentCompleted(bookingId, additionalAmount);
      } else {
        console.log(`ℹ️ Booking ${bookingId} not paid, skipping revenue update for added services`);
      }
    } catch (error) {
      console.error('❌ Error updating revenue for added services:', error);
      throw error;
    }
  }

  /**
   * Scheduled task to update all revenue reports (run daily via cron)
   */
  static async dailyRevenueUpdate() {
    try {
      console.log('🔄 Starting daily revenue update...');
      const today = new Date();
      
      // Update yesterday's final revenue
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      console.log(`📅 Updating revenue for ${yesterday.toDateString()}`);
      
      await RevenueService.updateRevenueReport(yesterday, 'daily');
      await RevenueService.updateRevenueReport(yesterday, 'monthly');
      await RevenueService.updateRevenueReport(yesterday, 'yearly');

      console.log('✅ Daily revenue update completed successfully');
    } catch (error) {
      console.error('❌ Error in daily revenue update:', error);
      throw error;
    }
  }

  /**
   * Create revenue update log for audit trail
   */
  private static async createRevenueUpdateLog(
    bookingId: string, 
    amount: number, 
    action: 'payment_completed' | 'payment_reversed' | 'services_added',
    date: Date
  ) {
    try {
      // This would create a log entry in a revenue_logs table if it exists
      // For now, we'll just log to console
      console.log(`📝 Revenue Log: ${action} - Booking: ${bookingId}, Amount: ${amount}, Date: ${date.toISOString()}`);
    } catch (error) {
      console.error('Error creating revenue update log:', error);
    }
  }

  /**
   * Create revenue error log for debugging
   */
  private static async createRevenueErrorLog(
    bookingId: string, 
    amount: number, 
    action: string,
    error: any
  ) {
    try {
      console.error(`📝 Revenue Error Log: ${action} - Booking: ${bookingId}, Amount: ${amount}, Error: ${error.message}`);
    } catch (logError) {
      console.error('Error creating revenue error log:', logError);
    }
  }

  /**
   * Get revenue update status for a booking
   */
  static async getRevenueUpdateStatus(bookingId: string): Promise<{
    lastUpdated: Date | null;
    totalRevenue: number;
    status: 'up_to_date' | 'pending' | 'error';
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          totalAmount: true,
          paymentStatus: true,
          updatedAt: true,
        },
      });

      if (!booking) {
        return {
          lastUpdated: null,
          totalRevenue: 0,
          status: 'error',
        };
      }

      return {
        lastUpdated: booking.updatedAt,
        totalRevenue: booking.totalAmount,
        status: booking.paymentStatus === 'paid' ? 'up_to_date' : 'pending',
      };
    } catch (error) {
      console.error('Error getting revenue update status:', error);
      return {
        lastUpdated: null,
        totalRevenue: 0,
        status: 'error',
      };
    }
  }

  /**
   * Delete all revenue entries for a booking when invoices are deleted
   */
  static async deleteRevenueForBooking(bookingId: string) {
    try {
      console.log(`🗑️ Deleting revenue entries for booking ${bookingId}`);
      
      // Get the booking to determine service categories and invoices
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          billItems: {
            include: { service: true },
          },
          invoices: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
            },
          },
        },
      });

      if (!booking) {
        console.error('❌ Booking not found for revenue deletion');
        return;
      }

      console.log(`📊 Deleting revenue for ${booking.guestName}`);

      // Calculate total amount to delete from each category
      // Use invoice amounts if available, otherwise fall back to bill items
      let totalAmount = 0;
      if (booking.invoices.length > 0) {
        totalAmount = booking.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        console.log(`💰 Total invoice amount to delete: ${totalAmount}`);
      } else {
        totalAmount = booking.billItems.reduce((sum, item) => sum + (item as any).amount, 0);
        console.log(`💰 Total bill items amount to delete: ${totalAmount}`);
      }

      // If no amount to delete, just log and return
      if (totalAmount === 0) {
        console.log(`ℹ️ No revenue to delete for booking ${bookingId}`);
        return;
      }

      const categoryAmounts = this.calculateCategoryAmounts(booking, totalAmount);

      // Delete from daily revenue reports for all relevant dates
      console.log(`📅 Deleting from daily revenue reports`);
      if (booking.payments.length > 0) {
        // Delete from payment dates
        for (const payment of booking.payments) {
          await this.deleteFromRevenueReport(payment.paymentDate, 'daily', categoryAmounts);
        }
      } else {
        // Delete from check-in date if no payments
        await this.deleteFromRevenueReport(booking.checkIn, 'daily', categoryAmounts);
      }
      
      // Delete from monthly revenue reports
      console.log(`📅 Deleting from monthly revenue reports`);
      if (booking.payments.length > 0) {
        for (const payment of booking.payments) {
          await this.deleteFromRevenueReport(payment.paymentDate, 'monthly', categoryAmounts);
        }
      } else {
        await this.deleteFromRevenueReport(booking.checkIn, 'monthly', categoryAmounts);
      }
      
      // Delete from yearly revenue reports
      console.log(`📅 Deleting from yearly revenue reports`);
      if (booking.payments.length > 0) {
        for (const payment of booking.payments) {
          await this.deleteFromRevenueReport(payment.paymentDate, 'yearly', categoryAmounts);
        }
      } else {
        await this.deleteFromRevenueReport(booking.checkIn, 'yearly', categoryAmounts);
      }

      // Also delete from any revenue tracking records
      // await this.deleteRevenueTrackingRecords(bookingId); // TODO: Implement if needed

      console.log(`✅ Revenue entries deleted successfully for booking ${bookingId}`);
      
      // Create deletion log for audit trail
      await this.createRevenueUpdateLog(bookingId, totalAmount, 'payment_reversed' as any, new Date());

    } catch (error) {
      console.error('❌ Error deleting revenue entries:', error);
      
      // Create error log
      await this.createRevenueErrorLog(bookingId, 0, 'revenue_deleted', error);
      
      throw error;
    }
  }

  /**

   * Delete revenue from specific report periods
   */
  private static async deleteFromRevenueReport(
    date: Date, 
    periodType: 'daily' | 'monthly' | 'yearly', 
    categoryAmounts: { [key: string]: number }
  ) {
    try {
      const startDate = periodType === 'daily' 
        ? startOfDay(date)
        : periodType === 'monthly' 
        ? startOfMonth(date)
        : startOfYear(date);

      // Find existing revenue report
      const existingReport = await prisma.revenue_report.findFirst({
        where: {
          date: startDate,
          period_type: periodType,
        },
      });

      if (existingReport) {
        // Update the report by subtracting the amounts
        const updatedData: any = {};
        
        Object.entries(categoryAmounts).forEach(([category, amount]) => {
          const fieldName = `${category}_revenue`;
          if (existingReport[fieldName as keyof typeof existingReport] !== undefined) {
            updatedData[fieldName] = {
              decrement: amount,
            };
          }
        });

        if (Object.keys(updatedData).length > 0) {
          await prisma.revenue_report.update({
            where: { id: existingReport.id },
            data: updatedData,
          });
          
          console.log(`✅ Deleted revenue from ${periodType} report for ${startDate.toDateString()}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error deleting from ${periodType} revenue report:`, error);
      throw error;
    }
  }
}
