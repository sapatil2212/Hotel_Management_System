import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';
import { z } from 'zod';

const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Source account is required'),
  toAccountId: z.string().min(1, 'Destination account is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Only admin and owner can transfer funds
    if (userRole !== 'ADMIN' && userRole !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = transferSchema.parse(body);

    // Prevent transfer to same account
    if (validated.fromAccountId === validated.toAccountId) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same account' },
        { status: 400 }
      );
    }

    const result = await EnhancedAccountService.transferBetweenAccounts(
      validated.fromAccountId,
      validated.toAccountId,
      validated.amount,
      validated.description,
      currentUserId
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing transfer:', error);
    return NextResponse.json(
      { error: 'Failed to process transfer' },
      { status: 500 }
    );
  }
}




