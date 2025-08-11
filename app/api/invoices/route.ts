import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/invoice-service';

// GET /api/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');
    
    const filters: any = {};
    if (status) filters.status = status;
    if (bookingId) filters.bookingId = bookingId;
    
    const invoices = await InvoiceService.getAllInvoices(filters);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Generate invoice from booking
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { bookingId, dueDate, notes, terms } = data;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.generateInvoiceFromBooking({
      bookingId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      terms
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
