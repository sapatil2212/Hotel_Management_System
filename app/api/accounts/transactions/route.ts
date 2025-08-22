import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Check permissions - reception can only see their own transactions
    let targetUserId = userId;
    if (userRole === 'RECEPTION' && (!userId || userId !== currentUserId)) {
      targetUserId = currentUserId;
    }

    const transactions = await EnhancedAccountService.getTransactionHistory(
      accountId && accountId !== 'all' ? accountId : undefined,
      targetUserId || undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit
    );

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
