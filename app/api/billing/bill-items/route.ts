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

    const billItems = await BillingService.getBillItems(bookingId);
    return NextResponse.json(billItems);
  } catch (error) {
    console.error('Error fetching bill items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill items' },
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
    const { bookingId, ...itemData } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const billItem = await BillingService.addBillItem(bookingId, {
      ...itemData,
      addedBy: session.user?.name || 'Admin',
    });

    return NextResponse.json(billItem, { status: 201 });
  } catch (error) {
    console.error('Error adding bill item:', error);
    return NextResponse.json(
      { error: 'Failed to add bill item' },
      { status: 500 }
    );
  }
}
