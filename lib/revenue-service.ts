import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } from 'date-fns';

const prisma = new PrismaClient();

export interface RevenueBreakdown {
  accommodation: number;
  foodBeverage: number;
  spa: number;
  transport: number;
  laundry: number;
  minibar: number;
  conference: number;
  other: number;
  total: number;
}

export interface PaymentMethodBreakdown {
  cash: number;
  card: number;
  upi: number;
  bankTransfer: number;
  onlineGateway: number;
  cheque: number;
  wallet: number;
  total: number;
}

export interface BookingSourceBreakdown {
  website: number;
  phone: number;
  walkIn: number;
  ota: number;
  corporate: number;
  agent: number;
  referral: number;
  total: number;
}

export interface RevenueReportData {
  period: {
    start: Date;
    end: Date;
    type: 'daily' | 'monthly' | 'yearly';
  };
  revenue: RevenueBreakdown;
  payments: PaymentMethodBreakdown;
  bookingSources: BookingSourceBreakdown;
  bookingStats: {
    totalBookings: number;
    occupiedRooms: number;
    occupancyRate: number;
    averageStayDuration: number;
    averageRevenuePerBooking: number;
  };
  outstandingPayments: {
    pending: number;
    partiallyPaid: number;
    overdue: number;
    total: number;
  };
  taxCollected: {
    gst: number;
    serviceTax: number;
    otherTax: number;
    total: number;
  };
  trends: {
    revenueGrowth: number;
    bookingGrowth: number;
    averageRevenueGrowth: number;
  };
}

export class RevenueService {
  /**
   * Generate comprehensive revenue report
   */
  static async generateRevenueReport(
    startDate: Date,
    endDate: Date,
    periodType: 'daily' | 'monthly' | 'yearly' = 'daily'
  ): Promise<RevenueReportData> {
    try {
      // Get bookings in the period - only include paid bookings for revenue calculation
      const bookings = await prisma.booking.findMany({
        where: {
          checkIn: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: 'paid', // Only count paid bookings for revenue
        },
        include: {
          billItems: {
            include: { service: true },
          },
          payments: true,
          room: {
            include: { roomType: true },
          },
        },
      });

      // Calculate revenue by category
      const revenue = await this.calculateRevenueByCategory(bookings);

      // Calculate payment method breakdown
      const payments = await this.calculatePaymentMethodBreakdown(bookings);

      // Calculate booking source breakdown
      const bookingSources = await this.calculateBookingSourceBreakdown(bookings);

      // Calculate booking statistics
      const bookingStats = await this.calculateBookingStatistics(bookings, startDate, endDate);

      // Calculate outstanding payments
      const outstandingPayments = await this.calculateOutstandingPayments();

      // Calculate tax collected
      const taxCollected = await this.calculateTaxCollected(bookings);

      // Calculate trends (compare with previous period)
      const trends = await this.calculateTrends(startDate, endDate, periodType);

      return {
        period: {
          start: startDate,
          end: endDate,
          type: periodType,
        },
        revenue,
        payments,
        bookingSources,
        bookingStats,
        outstandingPayments,
        taxCollected,
        trends,
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  }

  /**
   * Get daily revenue report
   */
  static async getDailyRevenue(date: Date = new Date()): Promise<RevenueReportData> {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);
    return this.generateRevenueReport(startDate, endDate, 'daily');
  }

  /**
   * Get monthly revenue report
   */
  static async getMonthlyRevenue(date: Date = new Date()): Promise<RevenueReportData> {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    return this.generateRevenueReport(startDate, endDate, 'monthly');
  }

  /**
   * Get yearly revenue report
   */
  static async getYearlyRevenue(date: Date = new Date()): Promise<RevenueReportData> {
    const startDate = startOfYear(date);
    const endDate = endOfYear(date);
    return this.generateRevenueReport(startDate, endDate, 'yearly');
  }

  /**
   * Get revenue trends for dashboard
   */
  static async getRevenueTrends(days: number = 30): Promise<Array<{
    date: Date;
    revenue: number;
    bookings: number;
  }>> {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      const dailyData = [];

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayStart = startOfDay(new Date(date));
        const dayEnd = endOfDay(new Date(date));

        const dayBookings = await prisma.booking.findMany({
          where: {
            checkIn: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        const dayRevenue = dayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

        dailyData.push({
          date: new Date(date),
          revenue: dayRevenue,
          bookings: dayBookings.length,
        });
      }

      return dailyData;
    } catch (error) {
      console.error('Error getting revenue trends:', error);
      throw error;
    }
  }

  /**
   * Calculate revenue by service category
   */
  private static async calculateRevenueByCategory(bookings: any[]): Promise<RevenueBreakdown> {
    const categoryRevenue: RevenueBreakdown = {
      accommodation: 0,
      foodBeverage: 0,
      spa: 0,
      transport: 0,
      laundry: 0,
      minibar: 0,
      conference: 0,
      other: 0,
      total: 0,
    };

    bookings.forEach(booking => {
      // Room revenue is accommodation
      const roomRevenue = booking.baseAmount || 0;
      categoryRevenue.accommodation += roomRevenue;

      // Add-on services revenue
      booking.billItems.forEach((item: any) => {
        const amount = item.finalAmount;
        
        if (item.service) {
          switch (item.service.category) {
            case 'food_beverage':
              categoryRevenue.foodBeverage += amount;
              break;
            case 'spa':
              categoryRevenue.spa += amount;
              break;
            case 'transport':
              categoryRevenue.transport += amount;
              break;
            case 'laundry':
              categoryRevenue.laundry += amount;
              break;
            case 'minibar':
              categoryRevenue.minibar += amount;
              break;
            case 'conference':
              categoryRevenue.conference += amount;
              break;
            default:
              categoryRevenue.other += amount;
          }
        } else {
          categoryRevenue.other += amount;
        }
      });
    });

    categoryRevenue.total = Object.values(categoryRevenue)
      .filter(value => typeof value === 'number')
      .reduce((sum, value) => sum + value, 0) - categoryRevenue.total; // Exclude total from calculation

    return categoryRevenue;
  }

  /**
   * Calculate payment method breakdown
   */
  private static async calculatePaymentMethodBreakdown(bookings: any[]): Promise<PaymentMethodBreakdown> {
    const paymentBreakdown: PaymentMethodBreakdown = {
      cash: 0,
      card: 0,
      upi: 0,
      bankTransfer: 0,
      onlineGateway: 0,
      cheque: 0,
      wallet: 0,
      total: 0,
    };

    bookings.forEach(booking => {
      booking.payments.forEach((payment: any) => {
        switch (payment.paymentMethod) {
          case 'cash':
            paymentBreakdown.cash += payment.amount;
            break;
          case 'card':
            paymentBreakdown.card += payment.amount;
            break;
          case 'upi':
            paymentBreakdown.upi += payment.amount;
            break;
          case 'bank_transfer':
            paymentBreakdown.bankTransfer += payment.amount;
            break;
          case 'online_gateway':
            paymentBreakdown.onlineGateway += payment.amount;
            break;
          case 'cheque':
            paymentBreakdown.cheque += payment.amount;
            break;
          case 'wallet':
            paymentBreakdown.wallet += payment.amount;
            break;
        }
      });
    });

    paymentBreakdown.total = Object.values(paymentBreakdown)
      .filter(value => typeof value === 'number')
      .reduce((sum, value) => sum + value, 0) - paymentBreakdown.total;

    return paymentBreakdown;
  }

  /**
   * Calculate booking source breakdown
   */
  private static async calculateBookingSourceBreakdown(bookings: any[]): Promise<BookingSourceBreakdown> {
    const sourceBreakdown: BookingSourceBreakdown = {
      website: 0,
      phone: 0,
      walkIn: 0,
      ota: 0,
      corporate: 0,
      agent: 0,
      referral: 0,
      total: 0,
    };

    const sourceRevenue: { [key: string]: number } = {};

    bookings.forEach(booking => {
      const source = booking.source;
      const amount = booking.totalAmount;

      if (!sourceRevenue[source]) {
        sourceRevenue[source] = 0;
      }
      sourceRevenue[source] += amount;
    });

    // Map sources to breakdown categories
    Object.entries(sourceRevenue).forEach(([source, amount]) => {
      switch (source) {
        case 'website':
          sourceBreakdown.website += amount;
          break;
        case 'phone':
          sourceBreakdown.phone += amount;
          break;
        case 'walk_in':
          sourceBreakdown.walkIn += amount;
          break;
        case 'ota':
          sourceBreakdown.ota += amount;
          break;
        case 'corporate':
          sourceBreakdown.corporate += amount;
          break;
        case 'agent':
          sourceBreakdown.agent += amount;
          break;
        case 'referral':
          sourceBreakdown.referral += amount;
          break;
        default:
          sourceBreakdown.website += amount; // Default to website
      }
    });

    sourceBreakdown.total = Object.values(sourceBreakdown)
      .filter(value => typeof value === 'number')
      .reduce((sum, value) => sum + value, 0) - sourceBreakdown.total;

    return sourceBreakdown;
  }

  /**
   * Calculate booking statistics
   */
  private static async calculateBookingStatistics(
    bookings: any[],
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalBookings: number;
    occupiedRooms: number;
    occupancyRate: number;
    averageStayDuration: number;
    averageRevenuePerBooking: number;
  }> {
    // Get total rooms
    const totalRooms = await prisma.rooms.count({
      where: { availableForBooking: true },
    });

    const totalBookings = bookings.length;
    const occupiedRooms = new Set(bookings.map(b => b.roomId)).size;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const totalNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);
    const averageStayDuration = totalBookings > 0 ? totalNights / totalBookings : 0;

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const averageRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalBookings,
      occupiedRooms,
      occupancyRate,
      averageStayDuration,
      averageRevenuePerBooking,
    };
  }

  /**
   * Calculate outstanding payments
   */
  private static async calculateOutstandingPayments(): Promise<{
    pending: number;
    partiallyPaid: number;
    overdue: number;
    total: number;
  }> {
    const outstandingBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: {
          in: ['pending', 'partially_paid', 'overdue'],
        },
      },
      include: { payments: true },
    });

    let pending = 0;
    let partiallyPaid = 0;
    let overdue = 0;

    outstandingBookings.forEach(booking => {
      const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remaining = booking.totalAmount - totalPaid;

      switch (booking.paymentStatus) {
        case 'pending':
          pending += remaining;
          break;
        case 'partially_paid':
          partiallyPaid += remaining;
          break;
        case 'overdue':
          overdue += remaining;
          break;
      }
    });

    return {
      pending,
      partiallyPaid,
      overdue,
      total: pending + partiallyPaid + overdue,
    };
  }

  /**
   * Calculate tax collected
   */
  private static async calculateTaxCollected(bookings: any[]): Promise<{
    gst: number;
    serviceTax: number;
    otherTax: number;
    total: number;
  }> {
    let gst = 0;
    let serviceTax = 0;
    let otherTax = 0;

    bookings.forEach(booking => {
      gst += booking.gstAmount || 0;
      serviceTax += booking.serviceTaxAmount || 0;
      otherTax += booking.otherTaxAmount || 0;
    });

    return {
      gst,
      serviceTax,
      otherTax,
      total: gst + serviceTax + otherTax,
    };
  }

  /**
   * Calculate trends compared to previous period
   */
  private static async calculateTrends(
    startDate: Date,
    endDate: Date,
    periodType: 'daily' | 'monthly' | 'yearly'
  ): Promise<{
    revenueGrowth: number;
    bookingGrowth: number;
    averageRevenueGrowth: number;
  }> {
    try {
      // Calculate previous period dates
      let prevStartDate: Date;
      let prevEndDate: Date;

      const periodLength = endDate.getTime() - startDate.getTime();

      switch (periodType) {
        case 'daily':
          prevStartDate = subDays(startDate, 1);
          prevEndDate = subDays(endDate, 1);
          break;
        case 'monthly':
          prevStartDate = subMonths(startDate, 1);
          prevEndDate = subMonths(endDate, 1);
          break;
        case 'yearly':
          prevStartDate = subYears(startDate, 1);
          prevEndDate = subYears(endDate, 1);
          break;
        default:
          prevStartDate = new Date(startDate.getTime() - periodLength);
          prevEndDate = new Date(endDate.getTime() - periodLength);
      }

      // Get current period data
      const currentBookings = await prisma.booking.findMany({
        where: {
          checkIn: { gte: startDate, lte: endDate },
        },
      });

      // Get previous period data
      const previousBookings = await prisma.booking.findMany({
        where: {
          checkIn: { gte: prevStartDate, lte: prevEndDate },
        },
      });

      const currentRevenue = currentBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const previousRevenue = previousBookings.reduce((sum, b) => sum + b.totalAmount, 0);

      const currentBookingCount = currentBookings.length;
      const previousBookingCount = previousBookings.length;

      const currentAvgRevenue = currentBookingCount > 0 ? currentRevenue / currentBookingCount : 0;
      const previousAvgRevenue = previousBookingCount > 0 ? previousRevenue / previousBookingCount : 0;

      // Calculate growth percentages
      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      const bookingGrowth = previousBookingCount > 0 
        ? ((currentBookingCount - previousBookingCount) / previousBookingCount) * 100 
        : 0;

      const averageRevenueGrowth = previousAvgRevenue > 0 
        ? ((currentAvgRevenue - previousAvgRevenue) / previousAvgRevenue) * 100 
        : 0;

      return {
        revenueGrowth,
        bookingGrowth,
        averageRevenueGrowth,
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {
        revenueGrowth: 0,
        bookingGrowth: 0,
        averageRevenueGrowth: 0,
      };
    }
  }

  /**
   * Update or create revenue report in database
   */
  static async updateRevenueReport(date: Date, periodType: 'daily' | 'monthly' | 'yearly'): Promise<void> {
    try {
      let startDate: Date;
      let endDate: Date;

      switch (periodType) {
        case 'daily':
          startDate = startOfDay(date);
          endDate = endOfDay(date);
          break;
        case 'monthly':
          startDate = startOfMonth(date);
          endDate = endOfMonth(date);
          break;
        case 'yearly':
          startDate = startOfYear(date);
          endDate = endOfYear(date);
          break;
      }

      const reportData = await this.generateRevenueReport(startDate, endDate, periodType);

      // Count actual bookings by source instead of calculating from revenue
      const sourceBookingCounts = await this.getBookingCountsBySource(startDate, endDate);

      // Upsert revenue report
      await prisma.revenue_report.upsert({
        where: {
          date_period_type: {
            date: startDate,
            period_type: periodType,
          },
        },
        update: {
          accommodation_revenue: reportData.revenue.accommodation,
          food_beverage_revenue: reportData.revenue.foodBeverage,
          spa_revenue: reportData.revenue.spa,
          transport_revenue: reportData.revenue.transport,
          laundry_revenue: reportData.revenue.laundry,
          minibar_revenue: reportData.revenue.minibar,
          other_revenue: reportData.revenue.other,
          total_revenue: reportData.revenue.total,
          cash_payments: reportData.payments.cash,
          card_payments: reportData.payments.card,
          upi_payments: reportData.payments.upi,
          online_payments: reportData.payments.onlineGateway,
          bank_transfer_payments: reportData.payments.bankTransfer,
          website_bookings: sourceBookingCounts.website,
          ota_bookings: sourceBookingCounts.ota,
          phone_bookings: sourceBookingCounts.phone,
          walk_in_bookings: sourceBookingCounts.walk_in,
          corporate_bookings: sourceBookingCounts.corporate,
          total_bookings: reportData.bookingStats.totalBookings,
          tax_collected: reportData.taxCollected.total,
          outstanding_amount: reportData.outstandingPayments.total,
        },
        create: {
          date: startDate,
          period_type: periodType,
          accommodation_revenue: reportData.revenue.accommodation,
          food_beverage_revenue: reportData.revenue.foodBeverage,
          spa_revenue: reportData.revenue.spa,
          transport_revenue: reportData.revenue.transport,
          laundry_revenue: reportData.revenue.laundry,
          minibar_revenue: reportData.revenue.minibar,
          other_revenue: reportData.revenue.other,
          total_revenue: reportData.revenue.total,
          cash_payments: reportData.payments.cash,
          card_payments: reportData.payments.card,
          upi_payments: reportData.payments.upi,
          online_payments: reportData.payments.onlineGateway,
          bank_transfer_payments: reportData.payments.bankTransfer,
          website_bookings: sourceBookingCounts.website,
          ota_bookings: sourceBookingCounts.ota,
          phone_bookings: sourceBookingCounts.phone,
          walk_in_bookings: sourceBookingCounts.walk_in,
          corporate_bookings: sourceBookingCounts.corporate,
          total_bookings: reportData.bookingStats.totalBookings,
          tax_collected: reportData.taxCollected.total,
          outstanding_amount: reportData.outstandingPayments.total,
        },
      });
    } catch (error) {
      console.error('Error updating revenue report:', error);
      throw error;
    }
  }

  /**
   * Get actual booking counts by source for accurate reporting
   */
  static async getBookingCountsBySource(startDate: Date, endDate: Date): Promise<{
    website: number;
    ota: number;
    phone: number;
    walk_in: number;
    corporate: number;
    agent: number;
    referral: number;
  }> {
    try {
      const bookingCounts = await prisma.booking.groupBy({
        by: ['source'],
        where: {
          checkIn: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: 'paid', // Only count paid bookings
        },
        _count: {
          source: true,
        },
      });

      const counts = {
        website: 0,
        ota: 0,
        phone: 0,
        walk_in: 0,
        corporate: 0,
        agent: 0,
        referral: 0,
      };

      bookingCounts.forEach(item => {
        const source = item.source as keyof typeof counts;
        if (source in counts) {
          counts[source] = item._count.source;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error getting booking counts by source:', error);
      return {
        website: 0,
        ota: 0,
        phone: 0,
        walk_in: 0,
        corporate: 0,
        agent: 0,
        referral: 0,
      };
    }
  }

  /**
   * Export revenue data to Excel/CSV format
   */
  static async exportRevenueData(
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<any[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          checkIn: { gte: startDate, lte: endDate },
        },
        include: {
          room: { include: { roomType: true } },
          billItems: { include: { service: true } },
          payments: true,
        },
        orderBy: { checkIn: 'asc' },
      });

      return bookings.map(booking => ({
        'Booking ID': booking.id,
        'Guest Name': booking.guestName,
        'Check In': booking.checkIn.toDateString(),
        'Check Out': booking.checkOut.toDateString(),
        'Nights': booking.nights,
        'Room Type': booking.room.roomType.name,
        'Room Number': booking.room.roomNumber,
        'Base Amount': booking.baseAmount || 0,
        'Discount': booking.discountAmount || 0,
        'GST': booking.gstAmount || 0,
        'Service Tax': booking.serviceTaxAmount || 0,
        'Total Amount': booking.totalAmount,
        'Payment Status': booking.paymentStatus,
        'Source': booking.source,
        'Add-on Services': booking.billItems.length,
        'Total Paid': booking.payments.reduce((sum, p) => sum + p.amount, 0),
      }));
    } catch (error) {
      console.error('Error exporting revenue data:', error);
      throw error;
    }
  }
}
