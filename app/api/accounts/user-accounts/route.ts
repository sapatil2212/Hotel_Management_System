import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await EnhancedAccountService.getAllUserAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user accounts' },
      { status: 500 }
    );
  }
}




