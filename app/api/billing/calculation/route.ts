import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const calculation = await BillingService.calculateBill(bookingId);
    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error calculating bill:', error);
    return NextResponse.json(
      { error: 'Failed to calculate bill' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    await BillingService.recalculateBookingTotal(bookingId);
    const calculation = await BillingService.calculateBill(bookingId);
    
    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error recalculating bill:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate bill' },
      { status: 500 }
    );
  }
}
