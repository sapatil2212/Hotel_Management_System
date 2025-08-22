const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTransactionCleanup() {
  console.log('🧪 Testing Transaction Cleanup System...\n');

  try {
    // Step 1: Create a test booking with invoice and payment
    console.log('📝 Step 1: Creating test booking with invoice and payment...');
    
    const testBooking = await prisma.booking.create({
      data: {
        guestName: 'Test Guest',
        guestEmail: 'test@example.com',
        guestPhone: '1234567890',
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
        nights: 1,
        adults: 2,
        children: 0,
        totalAmount: 5000,
        status: 'CONFIRMED',
        roomId: 'test-room-id', // You'll need to use a valid room ID
        paymentStatus: 'pending'
      }
    });
    console.log(`✅ Created test booking: ${testBooking.id}`);

    // Step 2: Create a test invoice
    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        bookingId: testBooking.id,
        guestName: testBooking.guestName,
        guestEmail: testBooking.guestEmail,
        guestPhone: testBooking.guestPhone,
        checkIn: testBooking.checkIn,
        checkOut: testBooking.checkOut,
        nights: testBooking.nights,
        adults: testBooking.adults,
        children: testBooking.children,
        roomTypeName: 'Test Room',
        roomNumber: '101',
        baseAmount: 5000,
        discountAmount: 0,
        gstAmount: 900,
        serviceTaxAmount: 0,
        otherTaxAmount: 0,
        totalTaxAmount: 900,
        totalAmount: 5900,
        status: 'paid',
        dueDate: new Date(),
        issuedDate: new Date(),
        terms: 'Payment due upon receipt'
      }
    });
    console.log(`✅ Created test invoice: ${testInvoice.id}`);

    // Step 3: Create a test payment
    const testPayment = await prisma.payment.create({
      data: {
        bookingId: testBooking.id,
        invoiceId: testInvoice.id,
        amount: 5900,
        paymentMethod: 'cash',
        paymentReference: `PAY-${Date.now()}`,
        paymentDate: new Date(),
        receivedBy: 'Test Staff',
        status: 'completed'
      }
    });
    console.log(`✅ Created test payment: ${testPayment.id}`);

    // Step 4: Create test transactions
    const mainAccount = await prisma.bank_account.findFirst({
      where: { isMainAccount: true }
    });

    if (!mainAccount) {
      console.log('❌ No main account found. Creating one...');
      await prisma.bank_account.create({
        data: {
          accountName: 'Main Hotel Account',
          accountType: 'main',
          balance: 0,
          isActive: true
        }
      });
    }

    // Create transaction for the booking
    const bookingTransaction = await prisma.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: 'credit',
        category: 'accommodation_revenue',
        amount: 5900,
        description: 'Revenue from Test Booking',
        referenceId: testBooking.id,
        referenceType: 'booking',
        paymentMethod: 'cash',
        processedBy: 'Test System',
        notes: 'Test transaction for booking'
      }
    });
    console.log(`✅ Created booking transaction: ${bookingTransaction.id}`);

    // Create transaction for the invoice
    const invoiceTransaction = await prisma.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: 'credit',
        category: 'accommodation_revenue',
        amount: 5900,
        description: 'Revenue from Test Invoice',
        referenceId: testInvoice.id,
        referenceType: 'invoice',
        paymentMethod: 'cash',
        processedBy: 'Test System',
        notes: 'Test transaction for invoice'
      }
    });
    console.log(`✅ Created invoice transaction: ${invoiceTransaction.id}`);

    // Create transaction for the payment
    const paymentTransaction = await prisma.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: 'credit',
        category: 'accommodation_revenue',
        amount: 5900,
        description: 'Revenue from Test Payment',
        referenceId: testPayment.id,
        referenceType: 'payment',
        paymentMethod: 'cash',
        processedBy: 'Test System',
        notes: 'Test transaction for payment'
      }
    });
    console.log(`✅ Created payment transaction: ${paymentTransaction.id}`);

    // Step 5: Verify transactions exist
    console.log('\n📊 Step 5: Verifying transactions exist...');
    const transactionsBefore = await prisma.transaction.findMany({
      where: {
        OR: [
          { referenceId: testBooking.id },
          { referenceId: testInvoice.id },
          { referenceId: testPayment.id }
        ]
      }
    });
    console.log(`✅ Found ${transactionsBefore.length} transactions before deletion`);

    // Step 6: Delete the booking (this should trigger cleanup)
    console.log('\n🗑️ Step 6: Deleting test booking...');
    await prisma.booking.delete({
      where: { id: testBooking.id }
    });
    console.log('✅ Test booking deleted');

    // Step 7: Verify transactions are cleaned up
    console.log('\n🔍 Step 7: Verifying transactions are cleaned up...');
    const transactionsAfter = await prisma.transaction.findMany({
      where: {
        OR: [
          { referenceId: testBooking.id },
          { referenceId: testInvoice.id },
          { referenceId: testPayment.id }
        ]
      }
    });
    console.log(`✅ Found ${transactionsAfter.length} transactions after deletion`);

    if (transactionsAfter.length === 0) {
      console.log('🎉 SUCCESS: All transactions were properly cleaned up!');
    } else {
      console.log('❌ FAILURE: Some transactions were not cleaned up!');
      console.log('Remaining transactions:', transactionsAfter);
    }

    // Step 8: Clean up test data
    console.log('\n🧹 Step 8: Cleaning up test data...');
    
    // Delete any remaining transactions
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { referenceId: testBooking.id },
          { referenceId: testInvoice.id },
          { referenceId: testPayment.id }
        ]
      }
    });

    // Delete any remaining payments
    await prisma.payment.deleteMany({
      where: {
        OR: [
          { bookingId: testBooking.id },
          { invoiceId: testInvoice.id }
        ]
      }
    });

    // Delete any remaining invoices
    await prisma.invoice.deleteMany({
      where: { bookingId: testBooking.id }
    });

    // Delete any remaining bookings
    await prisma.booking.deleteMany({
      where: { id: testBooking.id }
    });

    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTransactionCleanup();

