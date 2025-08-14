import { NextRequest, NextResponse } from 'next/server';
import { EnhancedInvoiceService } from '@/lib/enhanced-invoice-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

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

    const accessToken = await EnhancedInvoiceService.createGuestBillingAccess(bookingId);
    
    return NextResponse.json({ 
      accessToken,
      url: `${process.env.NEXTAUTH_URL}/guest-billing/${accessToken}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating guest billing access:', error);
    return NextResponse.json(
      { error: 'Failed to create guest billing access' },
      { status: 500 }
    );
  }
}
