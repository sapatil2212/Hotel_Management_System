import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createExpenseSchema = z.object({
  expenseTypeId: z.string().min(1, 'Expense type is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'online_gateway', 'cheque', 'wallet']).optional(),
  expenseDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  deductFromUserId: z.string().optional(), // For admin/owner to deduct from specific user
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const expenseTypeId = searchParams.get('expenseTypeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isApproved = searchParams.get('isApproved');

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (userRole === 'RECEPTION') {
      // Reception can only see their own expenses
      where.userId = currentUserId;
    } else if (userId && userId !== 'all' && (userRole === 'ADMIN' || userRole === 'OWNER')) {
      // Admin/Owner can filter by specific user
      where.userId = userId;
    }

    // Additional filters
    if (expenseTypeId && expenseTypeId !== 'all') {
      where.expenseTypeId = expenseTypeId;
    }

    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (isApproved && isApproved !== 'all') {
      where.isApproved = isApproved === 'true';
    }

    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          expenseType: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createExpenseSchema.parse(body);

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Determine which user's account to deduct from
    let targetUserId = currentUserId;

    // Interpret special value 'current_user' as the current session user
    const requestedUserId = validated.deductFromUserId === 'current_user' ? undefined : validated.deductFromUserId;

    if (requestedUserId && (userRole === 'ADMIN' || userRole === 'OWNER')) {
      // Admin/Owner can deduct from any user's account
      targetUserId = requestedUserId;
    }

    // Get or create user's bank account (auto-create if missing)
    let userAccount = await prisma.bank_account.findFirst({
      where: {
        userId: targetUserId,
        isActive: true,
      },
    });
    if (!userAccount) {
      const user = await prisma.user.findUnique({ where: { id: targetUserId }, select: { name: true } });
      const accountName = `${user?.name || 'User'}'s Account`;
      userAccount = await prisma.bank_account.create({
        data: {
          accountName,
          accountType: 'current',
          balance: 0,
          userId: targetUserId,
          isActive: true,
          isMainAccount: false,
        },
      });
    }

    // Check if user has sufficient balance
    if (userAccount.balance < validated.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance in user account' },
        { status: 400 }
      );
    }

    // Get main hotel account
    const mainAccount = await prisma.bank_account.findFirst({
      where: {
        isMainAccount: true,
        isActive: true,
      },
    });

    if (!mainAccount) {
      return NextResponse.json(
        { error: 'Main hotel account not found' },
        { status: 404 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create expense record
      const expense = await tx.expense.create({
        data: {
          expenseTypeId: validated.expenseTypeId,
          amount: validated.amount,
          description: validated.description,
          notes: validated.notes,
          paymentMethod: validated.paymentMethod,
          userId: targetUserId,
          expenseDate: validated.expenseDate ? new Date(validated.expenseDate) : new Date(),
          referenceNumber: validated.referenceNumber,
          isApproved: userRole === 'OWNER' || userRole === 'ADMIN', // Auto-approve for admin/owner
        },
        include: {
          expenseType: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // If approved, process the financial transactions
      if (expense.isApproved) {
        // Deduct from user account
        await tx.bank_account.update({
          where: { id: userAccount.id },
          data: {
            balance: {
              decrement: validated.amount,
            },
          },
        });

        // Deduct from main account
        await tx.bank_account.update({
          where: { id: mainAccount.id },
          data: {
            balance: {
              decrement: validated.amount,
            },
          },
        });

        // Create transaction records for user account
        await tx.transaction.create({
          data: {
            accountId: userAccount.id,
            type: 'debit',
            category: 'other_expense',
            amount: validated.amount,
            description: `Expense: ${validated.description}`,
            referenceId: expense.id,
            referenceType: 'expense',
            paymentMethod: validated.paymentMethod,
            processedBy: currentUserId,
            notes: validated.notes,
          },
        });

        // Create transaction record for main account
        await tx.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: 'debit',
            category: 'other_expense',
            amount: validated.amount,
            description: `Expense by ${expense.user.name}: ${validated.description}`,
            referenceId: expense.id,
            referenceType: 'expense',
            paymentMethod: validated.paymentMethod,
            processedBy: currentUserId,
            notes: `User: ${expense.user.name} | ${validated.notes || ''}`,
          },
        });
      }

      return expense;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
