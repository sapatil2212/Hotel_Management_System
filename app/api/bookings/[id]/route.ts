import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

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

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Free up the room and delete the booking atomically
    await prisma.$transaction([
      prisma.rooms.update({
        where: { id: booking.roomId },
        data: {
          status: 'available',
          availableForBooking: true,
          updatedAt: new Date(),
        },
      }),
      prisma.booking.delete({
        where: { id: params.id },
      }),
    ])

    return NextResponse.json({ success: true, message: 'Booking deleted successfully and room made available' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}