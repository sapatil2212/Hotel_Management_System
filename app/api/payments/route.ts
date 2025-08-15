import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/payments - Get payment history for a booking
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const paymentSummary = await BillingService.getPaymentSummary(bookingId);
    return NextResponse.json(paymentSummary);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Record a payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      bookingId,
      amount,
      paymentMethod,
      paymentReference,
      receivedBy,
      notes,
      gatewayResponse,
      transactionId,
      skipComplexProcessing
    } = data;

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Booking ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    let payment;
    if (skipComplexProcessing) {
      // Simple payment record with main account crediting
      payment = await prisma.$transaction(async (tx) => {
<<<<<<< HEAD
        // Check for duplicate payment before creating
        const existingPayment = await tx.payment.findFirst({
          where: {
            bookingId,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod as any,
            paymentDate: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
            },
          },
        });

        if (existingPayment) {
          console.log(`Duplicate payment detected for booking ${bookingId}, amount ${amount}, method ${paymentMethod}`);
          return existingPayment; // Return existing payment instead of creating duplicate
        }

=======
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
        // Create payment record
        const paymentRecord = await tx.payment.create({
          data: {
            bookingId,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod as any,
            paymentReference,
            receivedBy: receivedBy || session.user?.name || 'System',
            notes: notes || 'Bill payment',
            status: 'completed',
            transactionId,
            gatewayResponse: gatewayResponse ? JSON.stringify(gatewayResponse) : null,
          },
        });

        // Get or create main hotel account
        let mainAccount = await tx.bank_account.findFirst({
          where: {
            isMainAccount: true,
            isActive: true,
          },
        });

        if (!mainAccount) {
          mainAccount = await tx.bank_account.create({
            data: {
              accountName: 'Main Hotel Account',
              accountType: 'main',
              balance: 0,
              isMainAccount: true,
              isActive: true,
            },
          });
        }

        // Credit the main account
        await tx.bank_account.update({
          where: { id: mainAccount.id },
          data: {
            balance: {
              increment: parseFloat(amount),
            },
          },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: 'credit',
            category: 'accommodation_revenue',
            amount: parseFloat(amount),
            description: `Payment for booking ${bookingId}`,
            referenceId: bookingId,
            referenceType: 'booking',
            paymentMethod: paymentMethod as any,
            processedBy: receivedBy || session.user?.name || 'System',
            notes: notes || 'Bill payment',
            transactionDate: new Date(),
          },
        });

        return paymentRecord;
      });
    } else {
      payment = await BillingService.processPayment(
        bookingId,
        parseFloat(amount),
        paymentMethod,
        paymentReference,
        receivedBy || session.user?.name,
        notes,
        gatewayResponse,
        transactionId
      );
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}
