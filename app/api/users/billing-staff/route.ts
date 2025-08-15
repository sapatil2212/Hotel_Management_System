import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users with their bank account information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankAccounts: {
          select: {
            id: true,
            accountName: true,
            balance: true,
            accountType: true,
            isActive: true,
          },
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform data to include account info
    const usersWithAccountInfo = users.map(user => ({
      ...user,
      hasAccount: user.bankAccounts.length > 0,
      accountBalance: user.bankAccounts[0]?.balance || 0,
      accountId: user.bankAccounts[0]?.id || null,
      accountType: user.bankAccounts[0]?.accountType || null,
    }));

    return NextResponse.json(usersWithAccountInfo);
  } catch (error) {
    console.error('Error fetching billing staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing staff' },
      { status: 500 }
    );
  }
}
