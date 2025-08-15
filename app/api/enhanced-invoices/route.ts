import { NextRequest, NextResponse } from 'next/server';
import { EnhancedInvoiceService } from '@/lib/enhanced-invoice-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const guestName = searchParams.get('guestName');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const filters: any = {};
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (guestName) filters.guestName = guestName;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const result = await EnhancedInvoiceService.getInvoices(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
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
    const {
      bookingId,
      dueDate,
      notes,
      terms,
      includeQRCode = true,
      sendEmail = false,
      sendWhatsApp = false,
    } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const result = await EnhancedInvoiceService.generateGSTInvoice({
      bookingId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      terms,
      includeQRCode,
      sendEmail,
      sendWhatsApp,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
