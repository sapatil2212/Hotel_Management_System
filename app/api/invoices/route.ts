import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generateUniqueInvoiceNumber, generateQRCode } from '@/lib/qr-generator';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        booking: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        payments: true,
        invoiceItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Generate unique invoice number and QR code
    const invoiceNumber = generateUniqueInvoiceNumber();
    const qrCode = generateQRCode(invoiceNumber);
    
    // Extract extra charges and payment info from notes if they exist
    let extraCharges: Array<{itemName: string; description: string; amount: number} | null> = [];
    let paymentInfo: {method: string; collectedBy: string; referenceId: string | null} | null = null;
    
    if (body.notes) {
      // Parse extra charges from notes
      const extraChargesMatch = body.notes.match(/Extra Charge Details:\n([\s\S]*?)(?=\n\n|$)/);
      if (extraChargesMatch) {
        const extraChargesText = extraChargesMatch[1];
        extraCharges = extraChargesText.split('\n').map((line: string) => {
          const match = line.match(/^(.+): (.+) - (.+)$/);
          if (match) {
            return {
              itemName: match[1].trim(),
              description: match[3].trim(),
              amount: parseFloat(match[2].replace(/[^\d.]/g, '')) || 0
            };
          }
          return null;
        }).filter(Boolean);
      }
      
      // Parse payment info from notes
      const paymentMethodMatch = body.notes.match(/Payment Mode: (.+)/);
      const collectedByMatch = body.notes.match(/Collected By: (.+)/);
      const referenceIdMatch = body.notes.match(/Reference ID: (.+)/);
      
      if (paymentMethodMatch && collectedByMatch) {
        paymentInfo = {
          method: paymentMethodMatch[1].trim(),
          collectedBy: collectedByMatch[1].trim(),
          referenceId: referenceIdMatch ? referenceIdMatch[1].trim() : null
        };
      }
    }
    
    // Create invoice with transaction to ensure data consistency
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the main invoice
      const createdInvoice = await tx.invoice.create({
        data: {
          ...body,
          invoiceNumber,
          qrCode,
          dueDate: new Date(body.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      // Create invoice items for room stay
      await tx.invoice_item.create({
        data: {
          invoiceId: createdInvoice.id,
          itemName: `Room Stay - ${body.roomTypeName}`,
          description: `${new Date(body.checkIn).toLocaleDateString()} to ${new Date(body.checkOut).toLocaleDateString()} (${body.nights} nights)`,
          quantity: body.nights,
          unitPrice: body.baseAmount / body.nights, // Calculate per night price
          totalPrice: body.baseAmount,
          discount: body.discountAmount || 0,
          taxRate: 18, // 18% GST
          taxAmount: (body.baseAmount - (body.discountAmount || 0)) * 0.18,
          finalAmount: body.baseAmount - (body.discountAmount || 0) + ((body.baseAmount - (body.discountAmount || 0)) * 0.18)
        }
      });

      // Create invoice items for extra charges
      for (const charge of extraCharges.filter((c): c is {itemName: string; description: string; amount: number} => c !== null)) {
        await tx.invoice_item.create({
          data: {
            invoiceId: createdInvoice.id,
            itemName: charge.itemName,
            description: charge.description,
            quantity: 1,
            unitPrice: charge.amount,
            totalPrice: charge.amount,
            discount: 0,
            taxRate: 18, // 18% GST
            taxAmount: charge.amount * 0.18,
            finalAmount: charge.amount * 1.18
          }
        });
      }

      // Create payment record if this is a bill (paid invoice) and no payment exists yet
      if (body.status === 'paid' && paymentInfo) {
        // Check if a payment already exists for this booking to avoid duplicates
        const existingPayment = await tx.payment.findFirst({
          where: {
            bookingId: body.bookingId,
            amount: body.totalAmount,
            paymentMethod: paymentInfo.method as any,
          },
        });

        // Only create payment if one doesn't already exist
        if (!existingPayment) {
          await tx.payment.create({
            data: {
              bookingId: body.bookingId,
              invoiceId: createdInvoice.id,
              amount: body.totalAmount,
              paymentMethod: paymentInfo.method as any,
              paymentReference: paymentInfo.referenceId,
              receivedBy: paymentInfo.collectedBy,
              status: 'completed'
            }
          });
        }
      }

          return createdInvoice;
  });
    
    // If invoice is paid, automatically add revenue to Hotel account
    if (body.status === 'paid') {
      try {
        // Get or create main hotel account
        const mainAccount = await EnhancedAccountService.getOrCreateMainAccount();
        
        // Calculate revenue breakdown
        const revenueBreakdown = {
          accommodation: body.baseAmount,
          extraCharges: extraCharges.filter(c => c !== null).reduce((sum, charge) => sum + charge!.amount, 0),
          taxes: body.totalTaxAmount || 0
        };
        
        // Add revenue to main hotel account
        await EnhancedAccountService.addRevenueToMainAccount(
          body.bookingId,
          body.totalAmount,
          revenueBreakdown,
          paymentInfo?.method || 'cash',
          paymentInfo?.collectedBy || session.user?.name || 'System',
          `Invoice ${invoiceNumber} - ${body.guestName}`
        );
        
        // Revenue added silently - no console spam
      } catch (accountError) {
        console.error('❌ Error adding revenue to Hotel account:', accountError);
        // Don't fail the invoice creation if account update fails, but log it
      }
    }
    // Fetch the complete invoice with all relations
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        booking: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        payments: true,
        invoiceItems: true,
      },
    });

    return NextResponse.json(completeInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
