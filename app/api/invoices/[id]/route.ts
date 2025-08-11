import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/invoice-service';

// GET /api/invoices/[id] - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await InvoiceService.getInvoice(params.id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { status } = data;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.updateInvoiceStatus(params.id, status);
    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
