import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to reset data
    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN' && userRole !== 'OWNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    console.log('Starting data reset...');

    // Reset data in correct order (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // 1. Delete bill items
      console.log('Deleting bill items...');
      await tx.bill_item.deleteMany({});

      // 2. Delete split payments
      console.log('Deleting split payments...');
      await tx.split_payment.deleteMany({});

      // 3. Delete payments
      console.log('Deleting payments...');
      await tx.payment.deleteMany({});

      // 4. Delete invoices
      console.log('Deleting invoices...');
      await tx.invoice.deleteMany({});

      // 5. Delete bookings
      console.log('Deleting bookings...');
      await tx.booking.deleteMany({});

      // 6. Delete transactions
      console.log('Deleting transactions...');
      await tx.transaction.deleteMany({});

      // 7. Reset main hotel account balance to 0
      console.log('Resetting main hotel account...');
      await tx.bank_account.updateMany({
        where: {
          isMainAccount: true,
        },
        data: {
          balance: 0,
        },
      });

      // 8. Delete non-main bank accounts (user accounts)
      console.log('Deleting user bank accounts...');
      await tx.bank_account.deleteMany({
        where: {
          isMainAccount: false,
        },
      });

      // 9. Reset room status to available
      console.log('Resetting room status...');
      await tx.rooms.updateMany({
        data: {
          status: 'available',
          availableForBooking: true,
        },
      });

      console.log('Data reset completed successfully!');
    });

    return NextResponse.json({ 
      success: true, 
      message: 'All booking, billing, invoice data has been reset. Main hotel account balance set to ₹0.' 
    });

  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}
