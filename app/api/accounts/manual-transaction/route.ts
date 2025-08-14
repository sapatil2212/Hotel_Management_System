import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';
import { z } from 'zod';

const manualTransactionSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['deposit', 'withdrawal'], 'Type must be deposit or withdrawal'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'online_gateway', 'cheque', 'wallet']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Only admin and owner can perform manual transactions
    if (userRole !== 'ADMIN' && userRole !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only Admin and Owner can perform manual transactions.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = manualTransactionSchema.parse(body);

    let result;
    
    if (validated.type === 'deposit') {
      result = await EnhancedAccountService.manualDeposit(
        validated.accountId,
        validated.amount,
        validated.description,
        currentUserId,
        validated.notes,
        validated.paymentMethod
      );
    } else {
      result = await EnhancedAccountService.manualWithdrawal(
        validated.accountId,
        validated.amount,
        validated.description,
        currentUserId,
        validated.notes,
        validated.paymentMethod
      );
    }

    return NextResponse.json({
      success: true,
      message: `Manual ${validated.type} completed successfully`,
      transaction: result.transaction,
      account: result.account,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing manual transaction:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process manual transaction',
      },
      { status: 500 }
    );
  }
}




