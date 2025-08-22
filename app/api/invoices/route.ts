import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generateUniqueInvoiceNumber, generateQRCode } from '@/lib/qr-generator';
import { EnhancedAccountService } from '@/lib/enhanced-account-service';
import { NotificationService } from '@/lib/notification-service';

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
    
    // Extract payment info from notes if they exist
    let paymentInfo: {method: string; collectedBy: string; referenceId: string | null} | null = null;
    
    if (body.notes) {
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
    
    // Create invoice with transaction to ensure data consistency (increased timeout)
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the main invoice (excluding invoiceItems from body to avoid Prisma error)
      const { invoiceItems, ...invoiceData } = body;
      const createdInvoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          invoiceNumber,
          qrCode,
          dueDate: new Date(body.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      // Calculate room-specific amounts (body.baseAmount now contains only room base amount)
      const roomBaseAmount = body.baseAmount;
      const roomUnitPrice = roomBaseAmount / body.nights;
      const roomGSTAmount = (roomBaseAmount - (body.discountAmount || 0)) * 0.18;
      const roomFinalAmount = roomBaseAmount - (body.discountAmount || 0) + roomGSTAmount;

      // Create invoice items for room stay
      await tx.invoice_item.create({
        data: {
          invoiceId: createdInvoice.id,
          itemName: `Room Stay - ${body.roomTypeName}`,
          description: `${new Date(body.checkIn).toLocaleDateString()} to ${new Date(body.checkOut).toLocaleDateString()} (${body.nights} nights)`,
          quantity: body.nights,
          unitPrice: roomUnitPrice,
          totalPrice: roomBaseAmount,
          discount: body.discountAmount || 0,
          taxRate: 18, // 18% GST
          taxAmount: roomGSTAmount,
          finalAmount: roomFinalAmount
        }
      });

      // Create invoice items for extra charges from the request body
      if (invoiceItems && Array.isArray(invoiceItems)) {
        for (const item of invoiceItems) {
          await tx.invoice_item.create({
            data: {
              invoiceId: createdInvoice.id,
              itemName: item.itemName,
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              discount: item.discount || 0,
              taxRate: item.taxRate || 0,
              taxAmount: item.taxAmount || 0,
              finalAmount: item.finalAmount
            }
          });
        }
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
  }, {
    timeout: 15000, // Increase timeout to 15 seconds
  });
    
    // If invoice is paid, automatically add revenue to Hotel account
    if (body.status === 'paid') {
      try {
        // Get or create main hotel account
        const mainAccount = await EnhancedAccountService.getOrCreateMainAccount();
        
        // Calculate revenue breakdown
        const extraChargesTotal = body.invoiceItems && Array.isArray(body.invoiceItems) 
          ? body.invoiceItems.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
          : 0;
        
        const revenueBreakdown = {
          accommodation: body.baseAmount,
          extraCharges: extraChargesTotal,
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

    // Create notification for invoice generated
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user?.email || '' }
      })
      
      if (user) {
        const action = body.status === 'paid' ? 'paid' : 'generated'
        await NotificationService.createNotification({
          title: `Bill ${action}`,
          message: action === 'paid' 
            ? `Bill paid for ${completeInvoice!.guestName} - ₹${completeInvoice!.totalAmount}`
            : `Bill generated for ${completeInvoice!.guestName} - ₹${completeInvoice!.totalAmount}`,
          type: action === 'paid' ? 'payment' : 'info',
          userId: user.id,
          referenceId: completeInvoice!.id,
          referenceType: 'invoice'
        })
      }
    } catch (notificationError) {
      console.error('Error creating invoice notification:', notificationError)
      // Don't fail the invoice creation if notification fails
    }

    return NextResponse.json(completeInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
