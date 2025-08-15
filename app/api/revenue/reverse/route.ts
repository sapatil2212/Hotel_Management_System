import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      );
    }

    const currentDate = new Date();

    // Update daily revenue report
    const dayStart = startOfDay(currentDate);
    await updateRevenueReport(dayStart, 'daily', -amount);

    // Update monthly revenue report
    const monthStart = startOfMonth(currentDate);
    await updateRevenueReport(monthStart, 'monthly', -amount);

    // Update yearly revenue report
    const yearStart = startOfYear(currentDate);
    await updateRevenueReport(yearStart, 'yearly', -amount);

    return NextResponse.json({ 
      success: true, 
      message: 'Revenue reversed successfully',
      reversedAmount: amount 
    });
  } catch (error) {
    console.error('Error reversing revenue:', error);
    return NextResponse.json(
      { error: 'Failed to reverse revenue' },
      { status: 500 }
    );
  }
}

async function updateRevenueReport(date: Date, periodType: string, amountChange: number) {
  try {
    const existingReport = await prisma.revenue_report.findFirst({
      where: {
        date: date,
        period_type: periodType,
      },
    });

    if (existingReport) {
      // Update existing report
      await prisma.revenue_report.update({
        where: { id: existingReport.id },
        data: {
          accommodation_revenue: Math.max(0, existingReport.accommodation_revenue + amountChange),
          total_revenue: Math.max(0, existingReport.total_revenue + amountChange),
          total_bookings: Math.max(0, existingReport.total_bookings - 1),
        },
      });
    } else {
      // Create new report with negative values (should not normally happen)
      await prisma.revenue_report.create({
        data: {
          date: date,
          period_type: periodType,
          accommodation_revenue: Math.max(0, amountChange),
          total_revenue: Math.max(0, amountChange),
          total_bookings: amountChange < 0 ? 0 : 1,
        },
      });
    }
  } catch (error) {
    console.error(`Error updating ${periodType} revenue report:`, error);
  }
}
