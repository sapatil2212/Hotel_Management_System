const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupExpenseTypes() {
  console.log('🏨 Setting up default expense types...');

  const defaultExpenseTypes = [
    {
      name: 'Light Bill',
      description: 'Electricity bills and lighting expenses',
    },
    {
      name: 'Gas',
      description: 'Gas supply and cooking gas expenses',
    },
    {
      name: 'Wi-Fi',
      description: 'Internet and Wi-Fi service charges',
    },
    {
      name: 'TV',
      description: 'Cable TV and entertainment service charges',
    },
    {
      name: 'Electric Maintenance',
      description: 'Electrical repairs and maintenance',
    },
    {
      name: 'Water Bill',
      description: 'Water supply charges',
    },
    {
      name: 'Staff Salary',
      description: 'Employee salaries and wages',
    },
    {
      name: 'Cleaning Supplies',
      description: 'Housekeeping and cleaning materials',
    },
    {
      name: 'Laundry Supplies',
      description: 'Laundry detergents and supplies',
    },
    {
      name: 'Kitchen Supplies',
      description: 'Restaurant and kitchen supplies',
    },
    {
      name: 'Marketing',
      description: 'Advertising and promotional expenses',
    },
    {
      name: 'Insurance',
      description: 'Property and business insurance',
    },
    {
      name: 'Equipment Maintenance',
      description: 'Maintenance of hotel equipment',
    },
    {
      name: 'Security',
      description: 'Security services and equipment',
    },
    {
      name: 'Telephone',
      description: 'Phone bills and communication charges',
    },
  ];

  for (const expenseType of defaultExpenseTypes) {
    try {
      // Check if expense type already exists
      const existing = await prisma.expense_type.findUnique({
        where: { name: expenseType.name },
      });

      if (!existing) {
        await prisma.expense_type.create({
          data: expenseType,
        });
        console.log(`✅ Created expense type: ${expenseType.name}`);
      } else {
        console.log(`⏭️  Expense type already exists: ${expenseType.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating expense type ${expenseType.name}:`, error);
    }
  }

  console.log('🎉 Default expense types setup completed!');
}

async function setupMainAccount() {
  console.log('🏦 Setting up main hotel account...');

  try {
    // Check if main account already exists
    const existing = await prisma.bank_account.findFirst({
      where: { isMainAccount: true },
    });

    if (!existing) {
      await prisma.bank_account.create({
        data: {
          accountName: 'Main Hotel Account',
          accountType: 'main',
          balance: 0,
          isMainAccount: true,
          isActive: true,
        },
      });
      console.log('✅ Created main hotel account');
    } else {
      console.log('⏭️  Main hotel account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating main account:', error);
  }
}

async function main() {
  try {
    await setupMainAccount();
    await setupExpenseTypes();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();




