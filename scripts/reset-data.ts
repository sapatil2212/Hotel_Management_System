import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetData() {
  console.log('🔄 Starting data reset...');

  try {
    // Reset data in correct order (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // 1. Delete bill items
      console.log('🗑️  Deleting bill items...');
      const billItemsDeleted = await tx.bill_item.deleteMany({});
      console.log(`   ✅ Deleted ${billItemsDeleted.count} bill items`);

      // 2. Delete split payments
      console.log('🗑️  Deleting split payments...');
      const splitPaymentsDeleted = await tx.split_payment.deleteMany({});
      console.log(`   ✅ Deleted ${splitPaymentsDeleted.count} split payments`);

      // 3. Delete payments
      console.log('🗑️  Deleting payments...');
      const paymentsDeleted = await tx.payment.deleteMany({});
      console.log(`   ✅ Deleted ${paymentsDeleted.count} payments`);

      // 4. Delete invoices
      console.log('🗑️  Deleting invoices...');
      const invoicesDeleted = await tx.invoice.deleteMany({});
      console.log(`   ✅ Deleted ${invoicesDeleted.count} invoices`);

      // 5. Delete bookings
      console.log('🗑️  Deleting bookings...');
      const bookingsDeleted = await tx.booking.deleteMany({});
      console.log(`   ✅ Deleted ${bookingsDeleted.count} bookings`);

      // 6. Delete transactions
      console.log('🗑️  Deleting transactions...');
      const transactionsDeleted = await tx.transaction.deleteMany({});
      console.log(`   ✅ Deleted ${transactionsDeleted.count} transactions`);

      // 7. Reset main hotel account balance to 0
      console.log('🏦 Resetting main hotel account...');
      const mainAccountReset = await tx.bank_account.updateMany({
        where: {
          isMainAccount: true,
        },
        data: {
          balance: 0,
        },
      });
      console.log(`   ✅ Reset ${mainAccountReset.count} main accounts to ₹0`);

      // 8. Delete non-main bank accounts (user accounts)
      console.log('🗑️  Deleting user bank accounts...');
      const userAccountsDeleted = await tx.bank_account.deleteMany({
        where: {
          isMainAccount: false,
        },
      });
      console.log(`   ✅ Deleted ${userAccountsDeleted.count} user accounts`);

      // 9. Reset room status to available
      console.log('🏨 Resetting room status...');
      const roomsReset = await tx.rooms.updateMany({
        data: {
          status: 'available',
          availableForBooking: true,
        },
      });
      console.log(`   ✅ Reset ${roomsReset.count} rooms to available`);

      console.log('');
      console.log('🎉 Data reset completed successfully!');
      console.log('📊 Summary:');
      console.log(`   • Bookings deleted: ${bookingsDeleted.count}`);
      console.log(`   • Payments deleted: ${paymentsDeleted.count}`);
      console.log(`   • Invoices deleted: ${invoicesDeleted.count}`);
      console.log(`   • Transactions deleted: ${transactionsDeleted.count}`);
      console.log(`   • User accounts deleted: ${userAccountsDeleted.count}`);
      console.log(`   • Main hotel account balance: ₹0`);
      console.log(`   • Rooms reset: ${roomsReset.count} rooms available`);
    });

  } catch (error) {
    console.error('❌ Error resetting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetData()
  .then(() => {
    console.log('✅ Reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  });
