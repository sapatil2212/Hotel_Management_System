const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDummyData() {
  console.log('🧹 Cleaning dummy data and resetting accounts...');

  try {
    // Remove sample/demo transactions
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: {
        OR: [
          { processedBy: 'System Setup' },
          { processedBy: 'System' },
          { notes: { contains: 'Sample' } },
          { notes: { contains: 'demonstration' } },
          { description: { contains: 'Sample' } },
          { description: { contains: 'Demo' } },
          { description: { contains: 'Initial' } },
          { description: { contains: 'Opening Balance' } },
        ]
      }
    });

    console.log(`✅ Removed ${deletedTransactions.count} dummy transactions`);

    // Reset all account balances to 0
    const updatedAccounts = await prisma.bank_account.updateMany({
      data: {
        balance: 0,
      }
    });

    console.log(`✅ Reset ${updatedAccounts.count} account balances to ₹0`);

    // Get account summary after cleanup
    const accounts = await prisma.bank_account.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            name: true,
          }
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    console.log('\n📊 Account Summary After Cleanup:');
    accounts.forEach(account => {
      const userInfo = account.user ? ` (${account.user.name})` : '';
      const mainTag = account.isMainAccount ? ' [MAIN]' : '';
      console.log(`   • ${account.accountName}${userInfo}${mainTag}: ₹${account.balance.toFixed(2)} (${account._count.transactions} transactions)`);
    });

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\n💡 System is now ready for real transactions:');
    console.log('   • All accounts start with ₹0 balance');
    console.log('   • Balances will update when real transactions occur');
    console.log('   • Use the manual deposit feature to add initial funds if needed');

  } catch (error) {
    console.error('❌ Error cleaning dummy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDummyData();




