import { NextRequest, NextResponse } from 'next/server';
import { RevenueHooks } from '@/lib/revenue-hooks';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get revenue update status
    const originalRevenueStatus = await RevenueHooks.getRevenueUpdateStatus(bookingId);

    // Get booking details with invoices and bill items
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        guestName: true,
        totalAmount: true,
        paymentStatus: true,
        checkIn: true,
        checkOut: true,
        payments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            paymentDate: true,
            receivedBy: true,
            notes: true,
          },
          orderBy: { paymentDate: 'desc' },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            invoiceItems: {
              select: {
                id: true,
                description: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
        },
        billItems: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            finalAmount: true,
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Calculate actual billable amount from invoices (more accurate than bill items)
    let actualBillableAmount = 0;
    
    if (booking.invoices.length > 0) {
      // Use invoice total amount as the source of truth
      actualBillableAmount = booking.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    } else {
      // Fallback to bill items if no invoices exist
      actualBillableAmount = booking.billItems.reduce((sum, item) => sum + item.finalAmount, 0);
    }
    
    // Calculate total paid amount
    const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate remaining amount based on actual billable amount
    const remainingAmount = Math.max(0, actualBillableAmount - totalPaid);
    
    // Check if booking has any invoices/bills generated
    const hasInvoices = booking.invoices.length > 0;
    
    // Determine correct payment status
    let correctPaymentStatus = booking.paymentStatus;
    if (totalPaid >= actualBillableAmount && actualBillableAmount > 0) {
      correctPaymentStatus = 'paid';
    } else if (totalPaid > 0 && totalPaid < actualBillableAmount) {
      correctPaymentStatus = 'partially_paid';
    } else if (actualBillableAmount > 0) {
      correctPaymentStatus = 'pending';
    }
    
    // Determine revenue status
    let revenueStatus = {
      lastUpdated: originalRevenueStatus.lastUpdated,
      totalRevenue: actualBillableAmount,
      status: 'pending' as 'up_to_date' | 'pending' | 'error'
    };
    
    if (correctPaymentStatus === 'paid') {
      revenueStatus.status = 'up_to_date';
    } else if (correctPaymentStatus === 'partially_paid') {
      revenueStatus.status = 'pending';
    } else if (actualBillableAmount === 0) {
      revenueStatus.status = 'error';
    }

    // Deduplicate payments by amount, method, and date to avoid showing duplicate payments
    const uniquePayments = booking.payments.reduce((acc, payment) => {
      // Check if a payment with the same amount, method, and date already exists
      // Use a more flexible deduplication approach
      const isDuplicate = acc.find(p => {
        // Check if payment is within 5 minutes and has same amount and method
        const timeDiff = Math.abs(new Date(p.paymentDate).getTime() - new Date(payment.paymentDate).getTime());
        const isTimeClose = timeDiff < 300000; // 5 minutes instead of 1 minute
        
        // Check if it's a duplicate payment (same amount, method, and close time)
        const isDuplicatePayment = p.amount === payment.amount && 
                                 p.paymentMethod === payment.paymentMethod && 
                                 isTimeClose;
        
        // Also check if it's a split payment (same method, close time, but different amounts that sum up)
        const isSplitPayment = p.paymentMethod === payment.paymentMethod && 
                             isTimeClose && 
                             Math.abs((p.amount + payment.amount) - actualBillableAmount) < 1; // Allow 1 rupee tolerance
        
        return isDuplicatePayment || isSplitPayment;
      });
      
      if (!isDuplicate) {
        acc.push(payment);
      } else {
        console.log(`Skipping duplicate/split payment: ${payment.amount} ${payment.paymentMethod} on ${payment.paymentDate}`);
      }
      return acc;
    }, [] as typeof booking.payments);

    // Sort payments by date (most recent first) and limit to 3 most recent unique payments
    const sortedPayments = uniquePayments
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 3);

    return NextResponse.json({
      bookingId,
      guestName: booking.guestName,
      totalAmount: actualBillableAmount, // Use actual billable amount instead of booking total
      totalPaid,
      remainingAmount,
      paymentStatus: correctPaymentStatus, // Use corrected payment status
      revenueStatus,
      recentPayments: sortedPayments, // Last 3 unique payments
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      hasInvoices, // Add this flag to indicate if invoices exist
      actualBillableAmount, // Include for debugging
      originalTotalAmount: booking.totalAmount, // Include original for comparison
    });
  } catch (error) {
    console.error('Error fetching revenue status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue status' },
      { status: 500 }
    );
  }
}
