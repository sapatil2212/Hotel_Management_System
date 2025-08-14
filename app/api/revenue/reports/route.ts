import { NextRequest, NextResponse } from 'next/server';
import { RevenueService } from '@/lib/revenue-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'daily' | 'monthly' | 'yearly' | 'custom';
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let report;

    switch (type) {
      case 'daily':
        report = await RevenueService.getDailyRevenue(date ? new Date(date) : new Date());
        break;
      case 'monthly':
        report = await RevenueService.getMonthlyRevenue(date ? new Date(date) : new Date());
        break;
      case 'yearly':
        report = await RevenueService.getYearlyRevenue(date ? new Date(date) : new Date());
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'Start date and end date are required for custom reports' },
            { status: 400 }
          );
        }
        report = await RevenueService.generateRevenueReport(
          new Date(startDate),
          new Date(endDate)
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue report' },
      { status: 500 }
    );
  }
}
