import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id
      },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        promoCode: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { status, roomId, recalculatePricing, checkIn, checkOut, nights, roomTypeId, ...updateData } = data
    
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true }
    })
    
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    let newRoomData = null
    let pricingData = {}

    // If room is being changed, validate the new room is available
    if (roomId && roomId !== existingBooking.roomId) {
      newRoomData = await prisma.rooms.findUnique({
        where: { id: roomId },
        include: {
          roomType: true
        }
      })

      if (!newRoomData) {
        return NextResponse.json({ error: 'New room not found' }, { status: 404 })
      }

      if (newRoomData.status !== 'available') {
        return NextResponse.json({ error: 'Selected room is not available' }, { status: 400 })
      }

      // If recalculatePricing is true, calculate new pricing (room type or dates changed)
      if (recalculatePricing) {
        const roomPrice = newRoomData.roomType.price
        const bookingNights = nights || existingBooking.nights
        const newTotalAmount = roomPrice * bookingNights

        // Apply any existing discount if there was one
        if (existingBooking.discountAmount && existingBooking.originalAmount) {
          const discountPercentage = (existingBooking.discountAmount / existingBooking.originalAmount) * 100
          const newDiscountAmount = (newTotalAmount * discountPercentage) / 100
          
          pricingData = {
            originalAmount: newTotalAmount,
            discountAmount: newDiscountAmount,
            totalAmount: newTotalAmount - newDiscountAmount
          }
        } else {
          pricingData = {
            originalAmount: newTotalAmount,
            totalAmount: newTotalAmount,
            discountAmount: 0
          }
        }
      }
    } else if (recalculatePricing && (nights && nights !== existingBooking.nights)) {
      // Handle date changes without room change
      const roomPrice = existingBooking.room.roomType?.price || 0
      const bookingNights = nights
      const newTotalAmount = roomPrice * bookingNights

      // Apply any existing discount if there was one
      if (existingBooking.discountAmount && existingBooking.originalAmount) {
        const discountPercentage = (existingBooking.discountAmount / existingBooking.originalAmount) * 100
        const newDiscountAmount = (newTotalAmount * discountPercentage) / 100
        
        pricingData = {
          originalAmount: newTotalAmount,
          discountAmount: newDiscountAmount,
          totalAmount: newTotalAmount - newDiscountAmount
        }
      } else {
        pricingData = {
          originalAmount: newTotalAmount,
          totalAmount: newTotalAmount,
          discountAmount: 0
        }
      }
    }

    // Update booking in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Handle room change if requested
      if (roomId && roomId !== existingBooking.roomId) {
        // Free up the old room (unless it's already cancelled)
        if (existingBooking.status !== 'cancelled') {
          await tx.rooms.update({
            where: { id: existingBooking.roomId },
            data: { status: 'available', updatedAt: new Date() }
          })
        }

        // Occupy the new room
        await tx.rooms.update({
          where: { id: roomId },
          data: { status: 'occupied', updatedAt: new Date() }
        })
      }

      // Update the booking
      const booking = await tx.booking.update({
        where: { id: params.id },
        data: {
          ...updateData,
          ...pricingData, // Include new pricing if calculated
          status: status || existingBooking.status,
          roomId: roomId || existingBooking.roomId,
          checkIn: checkIn ? new Date(checkIn) : existingBooking.checkIn,
          checkOut: checkOut ? new Date(checkOut) : existingBooking.checkOut,
          nights: nights || existingBooking.nights,
          updatedAt: new Date()
        },
        include: {
          room: {
            include: {
              roomType: true
            }
          },
          promoCode: true
        }
      })

      // Update current room status based on booking status (if room wasn't changed)
      if (status && (!roomId || roomId === existingBooking.roomId)) {
        let roomStatus = existingBooking.room.status
        
        switch (status) {
          case 'confirmed':
            roomStatus = 'occupied'
            break
          case 'cancelled':
            roomStatus = 'available'
            break
          case 'checked_out':
            roomStatus = 'cleaning'
            break
        }

        if (roomStatus !== existingBooking.room.status) {
          await tx.rooms.update({
            where: { id: booking.roomId },
            data: {
              status: roomStatus as any,
              updatedAt: new Date()
            }
          })
        }
      }

      return booking
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true }
    })
    
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Cancel booking in a transaction
    await prisma.$transaction(async (tx) => {
      // Update booking status to cancelled
      await tx.booking.update({
        where: { id: params.id },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      })

      // Free up the room
      await tx.rooms.update({
        where: { id: existingBooking.roomId },
        data: {
          status: 'available',
          updatedAt: new Date()
        }
      })
    })

    return NextResponse.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
