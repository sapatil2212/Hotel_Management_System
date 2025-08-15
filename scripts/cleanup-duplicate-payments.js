const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicatePayments() {
  try {
    console.log('🔍 Starting duplicate payment cleanup...');

    // Get all payments grouped by booking, amount, method, and date (within 5 minutes)
    const payments = await prisma.payment.findMany({
      orderBy: [
        { bookingId: 'asc' },
        { amount: 'asc' },
        { paymentMethod: 'asc' },
        { paymentDate: 'asc' }
      ]
    });

    const duplicates = [];
    const seen = new Set();

    // Find duplicates based on bookingId, amount, paymentMethod, and paymentDate (within 5 minutes)
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const key = `${payment.bookingId}-${payment.amount}-${payment.paymentMethod}`;
      
      // Check if we've seen this combination before
      if (seen.has(key)) {
        // Find the previous payment with the same key
        const previousPayment = payments.find(p => 
          p.bookingId === payment.bookingId && 
          p.amount === payment.amount && 
          p.paymentMethod === payment.paymentMethod &&
          p.id !== payment.id
        );
        
        if (previousPayment) {
          // Check if they're within 5 minutes of each other
          const timeDiff = Math.abs(new Date(payment.paymentDate) - new Date(previousPayment.paymentDate));
          if (timeDiff < 5 * 60 * 1000) { // 5 minutes in milliseconds
            duplicates.push({
              duplicate: payment,
              original: previousPayment,
              timeDiff: timeDiff / 1000 / 60 // Convert to minutes
            });
          }
        }
      } else {
        seen.add(key);
      }
    }

    console.log(`📊 Found ${duplicates.length} duplicate payments`);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate payments found');
      return;
    }

    // Display duplicates found
    console.log('\n📋 Duplicate payments found:');
    duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. Booking: ${dup.duplicate.bookingId}`);
      console.log(`   Amount: ₹${dup.duplicate.amount}`);
      console.log(`   Method: ${dup.duplicate.paymentMethod}`);
      console.log(`   Duplicate ID: ${dup.duplicate.id}`);
      console.log(`   Original ID: ${dup.original.id}`);
      console.log(`   Time difference: ${dup.timeDiff.toFixed(2)} minutes`);
      console.log('');
    });

    // Ask for confirmation before deletion
    console.log('⚠️  This will delete duplicate payments. Make sure you have a backup!');
    console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');
    
    // Wait 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Delete duplicate payments
    let deletedCount = 0;
    for (const dup of duplicates) {
      try {
        await prisma.payment.delete({
          where: { id: dup.duplicate.id }
        });
        console.log(`🗑️  Deleted duplicate payment: ${dup.duplicate.id}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error deleting payment ${dup.duplicate.id}:`, error.message);
      }
    }

    console.log(`\n✅ Cleanup completed! Deleted ${deletedCount} duplicate payments`);

    // Verify cleanup
    const remainingPayments = await prisma.payment.count();
    console.log(`📊 Total payments remaining: ${remainingPayments}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicatePayments()
  .then(() => {
    console.log('🎉 Cleanup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup script failed:', error);
    process.exit(1);
  });
