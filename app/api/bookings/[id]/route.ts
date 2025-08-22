import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NotificationService } from '@/lib/notification-service';
import { RevenueHooks } from '@/lib/revenue-hooks';

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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: {
          include: { roomType: true },
        },
        payments: true,
        billItems: {
          include: { service: true },
        },
        invoices: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
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
    const { id, room, roomId, payments, billItems, invoices, createdAt, recalculatePricing, roomTypeId, ...updateData } = body;

    // Get the original booking to compare changes
    const originalBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: {
          include: { roomType: true },
        },
      },
    });

    if (!originalBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Set actual checkout time if status is being changed to checked_out
    if (updateData.status === 'checked_out' && !originalBooking.actualCheckoutTime) {
      updateData.actualCheckoutTime = new Date();
    }

    // Check if pricing needs to be recalculated
    const needsPricingRecalculation = recalculatePricing || 
      updateData.nights !== originalBooking.nights ||
      (body.roomTypeId && body.roomTypeId !== originalBooking.room.roomType.id);

    let finalUpdateData = updateData;

    // Handle room type change if needed
    if (body.roomTypeId && body.roomTypeId !== originalBooking.room.roomType.id) {
      // Find an available room of the new type
      const newRoom = await prisma.rooms.findFirst({
        where: {
          roomTypeId: body.roomTypeId,
          status: 'available',
          availableForBooking: true,
        },
      });

      if (!newRoom) {
        return NextResponse.json(
          { error: 'No available rooms of the selected type' },
          { status: 400 }
        );
      }

      // Update the roomId to the new room
      finalUpdateData.roomId = newRoom.id;
    }

    // Recalculate pricing if needed
    if (needsPricingRecalculation) {
      // Get the room type for pricing calculation
      const roomTypeId = body.roomTypeId || originalBooking.room.roomType.id;
      const roomType = await prisma.room.findUnique({
        where: { id: roomTypeId },
      });

      if (roomType) {
        const nights = updateData.nights || originalBooking.nights;
        const baseAmount = roomType.price * nights;
        
        // Calculate taxes
        const hotelInfo = await prisma.hotelinfo.findFirst();
        const taxConfig = {
          gstPercentage: hotelInfo?.gstPercentage || 0,
          serviceTaxPercentage: hotelInfo?.serviceTaxPercentage || 0,
          otherTaxes: hotelInfo?.otherTaxes ? JSON.parse(JSON.stringify(hotelInfo.otherTaxes)) : [],
          taxEnabled: hotelInfo?.taxEnabled || false
        };

        // Import the tax calculator
        const { calculateTaxes } = await import('@/lib/tax-calculator');
        const taxBreakdown = calculateTaxes(baseAmount, taxConfig);

        // Update pricing fields
        finalUpdateData = {
          ...updateData,
          originalAmount: baseAmount,
          baseAmount: taxBreakdown.baseAmount,
          gstAmount: taxBreakdown.gstAmount,
          serviceTaxAmount: taxBreakdown.serviceTaxAmount,
          otherTaxAmount: taxBreakdown.otherTaxAmount,
          totalTaxAmount: taxBreakdown.totalTaxAmount,
          totalAmount: taxBreakdown.totalAmount,
          // Preserve discount if it exists
          discountAmount: originalBooking.discountAmount || 0
        };
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: finalUpdateData,
      include: {
        room: {
          include: { roomType: true },
        },
      },
    });

    // If booking was cancelled, immediately free up the room
    const newStatus = (updatedBooking.status || '').toLowerCase()
    if (newStatus === 'cancelled' || newStatus === 'canceled') {
      try {
        await prisma.rooms.update({
          where: { id: updatedBooking.roomId },
          data: {
            status: 'available',
            availableForBooking: true,
            updatedAt: new Date(),
          },
        })
      } catch (roomErr) {
        // Log but don't fail the booking update if room update has an issue
        console.error('Failed to free up room on booking cancel:', roomErr)
      }
    }

    // Create notification for booking status changes
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user?.email || '' }
      });

      if (user && originalBooking.status !== updatedBooking.status) {
        let notificationTitle = '';
        let notificationMessage = '';

        switch (newStatus) {
          case 'cancelled':
          case 'canceled':
            notificationTitle = 'Booking Cancelled';
            notificationMessage = `Booking for ${updatedBooking.guestName} has been cancelled`;
            break;
          case 'checked_in':
            notificationTitle = 'Guest Checked In';
            notificationMessage = `${updatedBooking.guestName} has checked in`;
            break;
          case 'checked_out':
            notificationTitle = 'Guest Checked Out';
            notificationMessage = `${updatedBooking.guestName} has checked out`;
            break;
          case 'confirmed':
            notificationTitle = 'Booking Confirmed';
            notificationMessage = `Booking for ${updatedBooking.guestName} has been confirmed`;
            break;
          default:
            notificationTitle = 'Booking Updated';
            notificationMessage = `Booking for ${updatedBooking.guestName} has been updated`;
        }

        await NotificationService.createNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: 'booking',
          userId: user.id,
          referenceId: updatedBooking.id,
          referenceType: 'booking'
        });
      }
    } catch (notificationError) {
      console.error('Error creating booking status notification:', notificationError);
      // Don't fail the booking update if notification fails
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
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

    // Get user ID for notifications
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    // Check if booking exists and get its details
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          include: {
            payments: true
          }
        },
        payments: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Store booking details before deletion for notification
    const bookingDetails = {
      id: booking.id,
      guestName: booking.guestName,
      roomId: booking.roomId
    };

    // Calculate total payments for this booking
    const totalPayments = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalInvoicePayments = booking.invoices.reduce((sum, invoice) => 
      sum + invoice.payments.reduce((invoiceSum, payment) => invoiceSum + payment.amount, 0), 0
    );

    // Free up the room, delete related transactions, and delete the booking atomically
    await prisma.$transaction(async (tx) => {
      // 1. Update room status
      await tx.rooms.update({
        where: { id: booking.roomId },
        data: {
          status: 'available',
          availableForBooking: true,
          updatedAt: new Date(),
        },
      });

      // 2. Delete all transactions related to this booking
      console.log(`🗑️ Deleting transactions for booking ${booking.id}`);
      const deletedTransactions = await tx.transaction.deleteMany({
        where: {
          referenceId: booking.id,
          referenceType: 'booking'
        }
      });
      console.log(`✅ Deleted ${deletedTransactions.count} transactions for booking ${booking.id}`);

      // 3. Delete all transactions related to invoices of this booking
      const invoiceIds = booking.invoices.map(invoice => invoice.id);
      if (invoiceIds.length > 0) {
        console.log(`🗑️ Deleting transactions for invoices: ${invoiceIds.join(', ')}`);
        const deletedInvoiceTransactions = await tx.transaction.deleteMany({
          where: {
            referenceId: {
              in: invoiceIds
            },
            referenceType: 'invoice'
          }
        });
        console.log(`✅ Deleted ${deletedInvoiceTransactions.count} invoice transactions`);
      }

      // 4. Delete all transactions related to payments of this booking
      const paymentIds = booking.payments.map(payment => payment.id);
      if (paymentIds.length > 0) {
        console.log(`🗑️ Deleting transactions for payments: ${paymentIds.join(', ')}`);
        const deletedPaymentTransactions = await tx.transaction.deleteMany({
          where: {
            referenceId: {
              in: paymentIds
            },
            referenceType: 'payment'
          }
        });
        console.log(`✅ Deleted ${deletedPaymentTransactions.count} payment transactions`);
      }

      // 5. Delete the booking (this will cascade delete related invoices, payments, etc.)
      await tx.booking.delete({
        where: { id: params.id },
      });

      console.log(`✅ Booking ${booking.id} deleted successfully`);
    });

    // If there were payments, reverse the revenue
    if (totalPayments > 0 || totalInvoicePayments > 0) {
      const totalAmount = totalPayments + totalInvoicePayments;
      console.log(`💰 Reversing revenue for deleted booking: ${totalAmount} for booking ${booking.id}`);
      try {
        await RevenueHooks.onPaymentReversed(booking.id, totalAmount);
        console.log(`✅ Revenue reversed successfully for deleted booking`);
      } catch (revenueError) {
        console.error(`❌ Error reversing revenue for deleted booking ${booking.id}:`, revenueError);
        // Continue with the deletion process even if revenue reversal fails
      }
    }

    // Create notification for booking deletion
    try {
      if (user) {
        await NotificationService.createNotification({
          title: 'Booking Deleted',
          message: `Booking for ${bookingDetails.guestName} has been deleted`,
          type: 'booking',
          userId: user.id,
          referenceId: bookingDetails.id,
          referenceType: 'booking'
        });
      }
    } catch (notificationError) {
      console.error('Error creating booking deletion notification:', notificationError);
      // Don't fail the deletion if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking deleted successfully and room made available',
      deletedTransactions: totalPayments + totalInvoicePayments > 0 ? 'Revenue transactions also deleted' : 'No revenue transactions to delete'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}