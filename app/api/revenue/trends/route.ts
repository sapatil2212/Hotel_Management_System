import { NextRequest, NextResponse } from 'next/server';
import { RevenueService } from '@/lib/revenue-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');

    const trends = await RevenueService.getRevenueTrends(
      days ? parseInt(days) : 30
    );

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue trends' },
      { status: 500 }
    );
  }
}
