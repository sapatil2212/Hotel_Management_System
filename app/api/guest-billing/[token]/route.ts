import { NextRequest, NextResponse } from 'next/server';
import { EnhancedInvoiceService } from '@/lib/enhanced-invoice-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const billingInfo = await EnhancedInvoiceService.getGuestBillingInfo(params.token);
    return NextResponse.json(billingInfo);
  } catch (error) {
    console.error('Error fetching guest billing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    );
  }
}
