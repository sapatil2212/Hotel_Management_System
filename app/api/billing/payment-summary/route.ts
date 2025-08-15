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

    const summary = await BillingService.getPaymentSummary(bookingId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment summary' },
      { status: 500 }
    );
  }
}
