import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, splitPayments } = body;

    if (!bookingId || !splitPayments || !Array.isArray(splitPayments)) {
      return NextResponse.json(
        { error: 'Booking ID and split payments array are required' },
        { status: 400 }
      );
    }

    const result = await BillingService.setupSplitPayments(bookingId, splitPayments);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error setting up split payments:', error);
    return NextResponse.json(
      { error: 'Failed to setup split payments' },
      { status: 500 }
    );
  }
}
