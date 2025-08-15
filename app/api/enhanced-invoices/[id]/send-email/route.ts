import { NextRequest, NextResponse } from 'next/server';
import { EnhancedInvoiceService } from '@/lib/enhanced-invoice-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await EnhancedInvoiceService.sendInvoiceEmail(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}
