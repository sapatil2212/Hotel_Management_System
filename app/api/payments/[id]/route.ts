import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { BillingService } from '@/lib/billing-service';
import { RevenueHooks } from '@/lib/revenue-hooks';
import { AccountService } from '@/lib/account-service';

// PUT /api/payments/[id] - Update a payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentId = params.id;
    const data = await request.json();
    const { amount, paymentMethod, notes, reason } = data;

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    // Get the existing payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const originalAmount = existingPayment.amount;
    const newAmount = parseFloat(amount);
    const amountDifference = newAmount - originalAmount;

    // Update the payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amount: newAmount,
        paymentMethod: paymentMethod as any,
        notes: notes || existingPayment.notes,
        updatedAt: new Date(),
      },
      include: {
        booking: true,
      },
    });

    // If amount changed, adjust revenue
    if (Math.abs(amountDifference) > 0.01) {
      const booking = existingPayment.booking;
      
      if (amountDifference > 0) {
        // Amount increased - add to revenue
        console.log(`💰 Adding revenue adjustment: +${amountDifference} for booking ${booking.id}`);
        await RevenueHooks.onPaymentCompleted(booking.id, amountDifference);
      } else {
        // Amount decreased - reverse revenue
        console.log(`💰 Reversing revenue adjustment: ${amountDifference} for booking ${booking.id}`);
        await RevenueHooks.onPaymentReversed(booking.id, Math.abs(amountDifference));
      }

      // Update booking payment status
      const allPayments = await prisma.payment.findMany({
        where: { bookingId: booking.id },
      });

      const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
      let paymentStatus: 'pending' | 'partially_paid' | 'paid' | 'overdue';
      
      if (totalPaid >= booking.totalAmount) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      } else {
        paymentStatus = 'pending';
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus },
      });

             // Get main account for audit log
       const mainAccount = await AccountService.getMainAccount();
       
       // Create audit log for payment modification
       await prisma.transaction.create({
         data: {
           accountId: mainAccount.id,
           type: amountDifference > 0 ? 'credit' : 'debit',
           category: amountDifference > 0 ? 'accommodation_revenue' : 'refunds',
           amount: Math.abs(amountDifference),
           description: `Payment modification: ${reason || 'Revenue adjustment'}`,
           referenceId: paymentId,
           referenceType: 'payment',
           processedBy: session.user?.name || 'System',
           notes: `Original: ${originalAmount}, New: ${newAmount}, Reason: ${reason || 'Revenue adjustment'}`,
           isModification: true,
           originalAmount: originalAmount,
           modificationReason: reason || 'Revenue adjustment',
         },
       });
    }

    return NextResponse.json(updatedPayment);
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentId = params.id;
    const data = await request.json();
    const { reason, processedBy } = data;

    // Get the payment with booking details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentAmount = payment.amount;
    const booking = payment.booking;

    // Delete the payment
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    // Reverse revenue for this payment
    console.log(`💰 Reversing revenue for deleted payment: ${paymentAmount} for booking ${booking.id}`);
    await RevenueHooks.onPaymentReversed(booking.id, paymentAmount);

    // Update booking payment status
    const remainingPayments = await prisma.payment.findMany({
      where: { bookingId: booking.id },
    });

    const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
    let paymentStatus: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    
    if (totalPaid >= booking.totalAmount) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially_paid';
    } else {
      paymentStatus = 'pending';
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus },
    });

         // Get main account for audit log
     const mainAccount = await AccountService.getMainAccount();
     
     // Create audit log for payment deletion
     await prisma.transaction.create({
       data: {
         accountId: mainAccount.id,
         type: 'debit',
         category: 'refunds',
         amount: paymentAmount,
         description: `Payment deletion: ${reason || 'Revenue reversal'}`,
         referenceId: booking.id,
         referenceType: 'booking',
         processedBy: processedBy || session.user?.name || 'System',
         notes: `Deleted payment of ${paymentAmount} for booking ${booking.id}. Reason: ${reason || 'Revenue reversal'}`,
         isModification: true,
         originalAmount: paymentAmount,
         modificationReason: reason || 'Revenue reversal',
       },
     });

    return NextResponse.json({ 
      message: 'Payment deleted successfully',
      reversedAmount: paymentAmount,
      newPaymentStatus: paymentStatus
    });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
