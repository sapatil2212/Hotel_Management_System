import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const billItem = await BillingService.updateBillItem(params.id, body);

    return NextResponse.json(billItem);
  } catch (error) {
    console.error('Error updating bill item:', error);
    return NextResponse.json(
      { error: 'Failed to update bill item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await BillingService.removeBillItem(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bill item:', error);
    return NextResponse.json(
      { error: 'Failed to remove bill item' },
      { status: 500 }
    );
  }
}
