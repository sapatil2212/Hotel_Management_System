const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupBankAccounts() {
  try {
    console.log('🏦 Setting up bank account system...');

    // Create main hotel account if it doesn't exist
    let mainAccount = await prisma.bank_account.findFirst({
      where: { accountType: 'main', isActive: true },
    });

    if (!mainAccount) {
      mainAccount = await prisma.bank_account.create({
        data: {
          accountName: 'Main Hotel Account',
          accountType: 'main',
          bankName: 'Hotel Management System',
          balance: 0,
          isActive: true,
          updatedAt: new Date(),
        },
      });
      console.log('✅ Created main hotel account');
    } else {
      console.log('✅ Main hotel account already exists');
    }

    // Create petty cash account
    let pettyCashAccount = await prisma.bank_account.findFirst({
      where: { accountType: 'petty_cash', isActive: true },
    });

    if (!pettyCashAccount) {
      pettyCashAccount = await prisma.bank_account.create({
        data: {
          accountName: 'Petty Cash',
          accountType: 'petty_cash',
          bankName: 'Hotel Management System',
          balance: 5000, // Initial petty cash
          isActive: true,
          updatedAt: new Date(),
        },
      });

      // Add opening balance transaction
      await prisma.transaction.create({
        data: {
          accountId: pettyCashAccount.id,
          type: 'credit',
          category: 'transfer_in',
          amount: 5000,
          description: 'Initial petty cash setup',
          referenceType: 'adjustment',
          processedBy: 'System',
          notes: 'Opening balance for petty cash account',
          updatedAt: new Date(),
        },
      });

      console.log('✅ Created petty cash account with ₹5,000');
    } else {
      console.log('✅ Petty cash account already exists');
    }

    // Create online payments account
    let onlineAccount = await prisma.bank_account.findFirst({
      where: { accountType: 'online_payments', isActive: true },
    });

    if (!onlineAccount) {
      onlineAccount = await prisma.bank_account.create({
        data: {
          accountName: 'Online Payments Account',
          accountType: 'online_payments',
          bankName: 'Payment Gateway',
          balance: 0,
          isActive: true,
          updatedAt: new Date(),
        },
      });
      console.log('✅ Created online payments account');
    } else {
      console.log('✅ Online payments account already exists');
    }

    // Create savings account
    let savingsAccount = await prisma.bank_account.findFirst({
      where: { accountType: 'savings', isActive: true },
    });

    if (!savingsAccount) {
      savingsAccount = await prisma.bank_account.create({
        data: {
          accountName: 'Hotel Savings Account',
          accountType: 'savings',
          bankName: 'Bank of Hotel',
          balance: 0,
          isActive: true,
          updatedAt: new Date(),
        },
      });
      console.log('✅ Created savings account');
    } else {
      console.log('✅ Savings account already exists');
    }

    // Add some sample expense transactions for demonstration
    const existingTransactions = await prisma.transaction.count();
    
    if (existingTransactions === 0 || existingTransactions === 1) { // Only opening balance exists
      console.log('🔄 Adding sample expense transactions...');

      const sampleExpenses = [
        {
          category: 'utilities',
          amount: 2500,
          description: 'Monthly electricity bill',
          paymentMethod: 'bank_transfer',
        },
        {
          category: 'staff_salary',
          amount: 15000,
          description: 'Housekeeping staff salary',
          paymentMethod: 'bank_transfer',
        },
        {
          category: 'supplies',
          amount: 3200,
          description: 'Room amenities and toiletries',
          paymentMethod: 'cash',
        },
        {
          category: 'marketing',
          amount: 5000,
          description: 'Online advertising campaign',
          paymentMethod: 'card',
        },
        {
          category: 'room_maintenance',
          amount: 1800,
          description: 'Room 101 AC repair',
          paymentMethod: 'cash',
        },
      ];

      for (const expense of sampleExpenses) {
        await prisma.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: 'debit',
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            referenceType: 'expense',
            paymentMethod: expense.paymentMethod,
            processedBy: 'System Setup',
            notes: 'Sample expense for demonstration',
            updatedAt: new Date(),
          },
        });

        // Update account balance
        await prisma.bank_account.update({
          where: { id: mainAccount.id },
          data: {
            balance: { decrement: expense.amount },
            updatedAt: new Date(),
          },
        });
      }

      console.log('✅ Added sample expense transactions');
    }

    console.log('\n🎉 Bank account system setup completed successfully!');
    console.log('\n📊 Account Summary:');
    
    const accounts = await prisma.bank_account.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    accounts.forEach(account => {
      console.log(`   • ${account.accountName}: ₹${account.balance.toFixed(2)} (${account._count.transactions} transactions)`);
    });

    console.log('\n💡 Next Steps:');
    console.log('   1. Go to /dashboard/billing');
    console.log('   2. Switch to "Account Management" tab');
    console.log('   3. View your account balances and transactions');
    console.log('   4. Generate bills to see automatic account updates');

  } catch (error) {
    console.error('❌ Error setting up bank accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupBankAccounts()
  .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });

