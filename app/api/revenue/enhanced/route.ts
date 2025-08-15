import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const accountId = searchParams.get('accountId');

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    // Get paid bookings in the period
    const whereClause: any = {
      checkIn: {
        gte: start,
        lte: end,
      },
      paymentStatus: 'paid',
    };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
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

    // Calculate categorized revenue
    const categorizedRevenue = {
      accommodation: 0,
      foodBeverage: 0,
      spa: 0,
      transport: 0,
      laundry: 0,
      minibar: 0,
      conference: 0,
      other: 0,
    };

    let totalRevenue = 0;

    bookings.forEach(booking => {
      // Add accommodation revenue (base booking amount)
      const accommodationAmount = booking.baseAmount || booking.totalAmount;
      categorizedRevenue.accommodation += accommodationAmount;
      totalRevenue += booking.totalAmount;

      // Add additional services revenue
      booking.billItems.forEach(item => {
        if (item.service) {
          switch (item.service.category) {
            case 'food_beverage':
              categorizedRevenue.foodBeverage += item.finalAmount;
              break;
            case 'spa':
              categorizedRevenue.spa += item.finalAmount;
              break;
            case 'transport':
              categorizedRevenue.transport += item.finalAmount;
              break;
            case 'laundry':
              categorizedRevenue.laundry += item.finalAmount;
              break;
            case 'minibar':
              categorizedRevenue.minibar += item.finalAmount;
              break;
            case 'conference':
              categorizedRevenue.conference += item.finalAmount;
              break;
            default:
              categorizedRevenue.other += item.finalAmount;
              break;
          }
        }
      });
    });

    // Calculate payment methods breakdown
    const paymentMethods = {
      cash: 0,
      card: 0,
      upi: 0,
      bankTransfer: 0,
      onlineGateway: 0,
      cheque: 0,
      wallet: 0,
    };

    bookings.forEach(booking => {
      booking.payments.forEach(payment => {
        switch (payment.paymentMethod) {
          case 'cash':
            paymentMethods.cash += payment.amount;
            break;
          case 'card':
            paymentMethods.card += payment.amount;
            break;
          case 'upi':
            paymentMethods.upi += payment.amount;
            break;
          case 'bank_transfer':
            paymentMethods.bankTransfer += payment.amount;
            break;
          case 'online_gateway':
            paymentMethods.onlineGateway += payment.amount;
            break;
          case 'cheque':
            paymentMethods.cheque += payment.amount;
            break;
          case 'wallet':
            paymentMethods.wallet += payment.amount;
            break;
        }
      });
    });

    // Calculate booking sources
    const bookingSources = {
      website: 0,
      phone: 0,
      walkIn: 0,
      ota: 0,
      corporate: 0,
      agent: 0,
      referral: 0,
    };

    bookings.forEach(booking => {
      const revenue = booking.totalAmount;
      switch (booking.source) {
        case 'website':
          bookingSources.website += revenue;
          break;
        case 'phone':
          bookingSources.phone += revenue;
          break;
        case 'walk_in':
          bookingSources.walkIn += revenue;
          break;
        case 'ota':
          bookingSources.ota += revenue;
          break;
        case 'corporate':
          bookingSources.corporate += revenue;
          break;
        case 'agent':
          bookingSources.agent += revenue;
          break;
        case 'referral':
          bookingSources.referral += revenue;
          break;
      }
    });

    // Calculate trends (simplified - you might want to implement proper period comparison)
    const trends = {
      revenueGrowth: 0, // Would need previous period data
      bookingGrowth: 0, // Would need previous period data
      averageRevenueGrowth: 0, // Would need previous period data
    };

    const revenueData = {
      totalRevenue,
      categorizedRevenue,
      paymentMethods,
      bookingSources,
      trends,
    };

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching enhanced revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}




