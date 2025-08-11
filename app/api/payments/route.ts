import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/invoice-service';

// GET /api/payments - Get payment history for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const payments = await InvoiceService.getPaymentHistory(bookingId);
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Record a payment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      bookingId,
      invoiceId,
      amount,
      paymentMethod,
      paymentReference,
      receivedBy,
      notes
    } = data;

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Booking ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    const payment = await InvoiceService.recordPayment({
      bookingId,
      invoiceId,
      amount: parseFloat(amount),
      paymentMethod,
      paymentReference,
      receivedBy,
      notes
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}
