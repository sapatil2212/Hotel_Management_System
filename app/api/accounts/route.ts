import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { AccountService } from '@/lib/account-service';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'balances':
        const balances = await AccountService.getAllAccountBalances();
        return NextResponse.json(balances);

      case 'summary':
        const period = searchParams.get('period') || 'month';
        const accountId = searchParams.get('accountId');
        
        let startDate: Date, endDate: Date;
        const now = new Date();
        
        switch (period) {
          case 'day':
            startDate = startOfDay(now);
            endDate = endOfDay(now);
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            endDate = now;
            break;
          case 'month':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
          case 'year':
            startDate = startOfYear(now);
            endDate = endOfYear(now);
            break;
          default:
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        }

        const summary = await AccountService.getTransactionSummary(startDate, endDate, accountId || undefined);
        return NextResponse.json(summary);

      case 'breakdown':
        const breakdownPeriod = searchParams.get('period') || 'month';
        const breakdownAccountId = searchParams.get('accountId');
        
        let breakdownStart: Date, breakdownEnd: Date;
        const today = new Date();
        
        switch (breakdownPeriod) {
          case 'day':
            breakdownStart = startOfDay(today);
            breakdownEnd = endOfDay(today);
            break;
          case 'month':
            breakdownStart = startOfMonth(today);
            breakdownEnd = endOfMonth(today);
            break;
          case 'year':
            breakdownStart = startOfYear(today);
            breakdownEnd = endOfYear(today);
            break;
          default:
            breakdownStart = startOfMonth(today);
            breakdownEnd = endOfMonth(today);
        }

        const breakdown = await AccountService.getRevenueBreakdown(breakdownStart, breakdownEnd, breakdownAccountId || undefined);
        return NextResponse.json(breakdown);

      case 'transactions':
        const limit = parseInt(searchParams.get('limit') || '50');
        const transactionAccountId = searchParams.get('accountId');
        
        const transactions = await AccountService.getRecentTransactions(limit, transactionAccountId || undefined);
        return NextResponse.json(transactions);

      case 'cashflow':
        const days = parseInt(searchParams.get('days') || '30');
        const cashFlow = await AccountService.getDailyCashFlow(days);
        return NextResponse.json(cashFlow);

      case 'user-accounts':
        const userAccounts = await EnhancedAccountService.getAllUserAccounts();
        return NextResponse.json(userAccounts);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in accounts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_account':
        const { accountName, accountType, accountNumber, bankName, initialBalance } = body;
        const account = await AccountService.createAccount(
          accountName,
          accountType,
          accountNumber,
          bankName,
          initialBalance || 0
        );
        return NextResponse.json(account);

      case 'add_expense':
        const { category, amount, description, paymentMethod, notes, accountId } = body;
        const expense = await AccountService.addExpense(
          category,
          amount,
          description,
          session.user?.name || 'Admin',
          paymentMethod,
          notes,
          accountId
        );
        return NextResponse.json(expense);

      case 'transfer':
        const { fromAccountId, toAccountId, transferAmount, transferDescription } = body;
        const transfer = await AccountService.transferBetweenAccounts(
          fromAccountId,
          toAccountId,
          transferAmount,
          transferDescription,
          session.user?.name || 'Admin'
        );
        return NextResponse.json(transfer);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in accounts POST API:', error);
    return NextResponse.json(
      { error: 'Failed to process account operation' },
      { status: 500 }
    );
  }
}

