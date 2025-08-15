import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { BillingService } from '@/lib/billing-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, amount, processedBy } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      );
    }

    // Reverse payment from account system
    await BillingService.reversePaymentFromAccount(
      bookingId,
      amount,
      processedBy || session.user?.name || 'Admin'
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Payment reversed from account successfully',
      reversedAmount: amount 
    });
  } catch (error) {
    console.error('Error reversing payment from account:', error);
    return NextResponse.json(
      { error: 'Failed to reverse payment from account' },
      { status: 500 }
    );
  }
}

