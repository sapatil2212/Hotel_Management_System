import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { RevenueHooks } from '@/lib/revenue-hooks';
import { AccountService } from '@/lib/account-service';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            room: {
              include: { roomType: true },
            },
          },
        },
        payments: true,
        invoiceItems: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { id, booking, payments, invoiceItems, createdAt, ...updateData } = body;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        booking: {
          include: {
            room: {
              include: { roomType: true },
            },
          },
        },
        payments: true,
        invoiceItems: true,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let reason = 'Invoice cancellation';
    let processedBy = session.user?.name || 'System';
    
    try {
      const data = await request.json();
      if (data) {
        reason = data.reason || reason;
        processedBy = data.processedBy || processedBy;
      }
    } catch (parseError) {
      // If JSON parsing fails, use default values
      console.log('No request body provided, using default values');
    }

    // Check if invoice exists and get its details
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        booking: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceAmount = invoice.totalAmount;
    const booking = invoice.booking;

    // Calculate total payments for this invoice
    const totalPayments = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Delete the invoice (this will cascade delete related payments)
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    console.log(`🗑️ Invoice ${params.id} deleted successfully`);

    // If there were payments for this invoice, reverse the revenue
    if (totalPayments > 0) {
      console.log(`💰 Reversing revenue for deleted invoice: ${totalPayments} for booking ${booking.id}`);
      await RevenueHooks.onPaymentReversed(booking.id, totalPayments);
      console.log(`✅ Revenue reversed successfully for deleted invoice`);
    }

    // Delete all revenue entries for this booking since invoices are being deleted
    console.log(`🗑️ Deleting all revenue entries for booking ${booking.id}`);
    try {
      await RevenueHooks.deleteRevenueForBooking(booking.id);
      console.log(`✅ All revenue entries deleted successfully for booking ${booking.id}`);
    } catch (revenueError) {
      console.error(`❌ Error deleting revenue entries for booking ${booking.id}:`, revenueError);
      // Continue with the deletion process even if revenue deletion fails
      // This ensures the invoice is still deleted
    }

    // Update booking payment status if needed
    const remainingPayments = await prisma.payment.findMany({
      where: { bookingId: booking.id },
    });

    const totalRemainingPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
    let paymentStatus: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    
    if (totalRemainingPaid >= booking.totalAmount) {
      paymentStatus = 'paid';
    } else if (totalRemainingPaid > 0) {
      paymentStatus = 'partially_paid';
    } else {
      paymentStatus = 'pending';
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus },
    });

         // Create audit log for invoice deletion
     if (totalPayments > 0) {
       // Get main account for audit log
       const mainAccount = await AccountService.getMainAccount();
       
       await prisma.transaction.create({
         data: {
           accountId: mainAccount.id,
           type: 'debit',
           category: 'refunds',
           amount: totalPayments,
           description: `Invoice deletion: ${reason || 'Revenue reversal'}`,
           referenceId: booking.id,
           referenceType: 'booking',
           processedBy: processedBy || session.user?.name || 'System',
           notes: `Deleted invoice of ${invoiceAmount} with ${totalPayments} in payments for booking ${booking.id}. Reason: ${reason || 'Revenue reversal'}`,
           isModification: true,
           originalAmount: totalPayments,
           modificationReason: reason || 'Revenue reversal',
         },
       });
     }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice deleted successfully',
      reversedAmount: totalPayments,
      newPaymentStatus: paymentStatus
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
