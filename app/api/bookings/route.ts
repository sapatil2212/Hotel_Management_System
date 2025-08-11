import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateTaxes } from "@/lib/tax-calculator"

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        promoCode: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking with automatic room allocation
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      roomTypeId, 
      checkIn, 
      checkOut, 
      nights, 
      adults, 
      children, 
      numberOfRooms,
      totalAmount,
      originalAmount,
      discountAmount,
      promoCodeId,
      guestName, 
      guestEmail, 
      guestPhone, 
      specialRequests 
    } = data
    
    // Validate required fields
    if (!roomTypeId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if room type exists
    const roomType = await prisma.room.findUnique({
      where: { id: roomTypeId }
    })
    
    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }

    // Find available rooms for this room type
    const availableRooms = await prisma.rooms.findMany({
      where: {
        roomTypeId: roomTypeId,
        status: 'available'
      },
      orderBy: {
        roomNumber: 'asc'
      }
    })

    if (availableRooms.length === 0) {
      return NextResponse.json(
        { error: 'No available rooms of this type' },
        { status: 400 }
      )
    }

    // Select the first available room
    const selectedRoom = availableRooms[0]

    // Get hotel tax configuration
    const hotelInfo = await prisma.hotelinfo.findFirst()
    const baseAmount = roomType.price * nights

    // Calculate taxes
    const taxBreakdown = calculateTaxes(baseAmount, {
      gstPercentage: hotelInfo?.gstPercentage || 0,
      serviceTaxPercentage: hotelInfo?.serviceTaxPercentage || 0,
      otherTaxes: hotelInfo?.otherTaxes ? JSON.parse(JSON.stringify(hotelInfo.otherTaxes)) : [],
      taxEnabled: hotelInfo?.taxEnabled || false
    })

    // Recalculate total with taxes (after discount if any)
    let finalBaseAmount = baseAmount
    let finalDiscountAmount = discountAmount || 0

    // If there's a discount, apply it to the base amount first
    if (finalDiscountAmount > 0) {
      finalBaseAmount = baseAmount - finalDiscountAmount
    }

    // Calculate taxes on the discounted amount
    const finalTaxBreakdown = calculateTaxes(finalBaseAmount, {
      gstPercentage: hotelInfo?.gstPercentage || 0,
      serviceTaxPercentage: hotelInfo?.serviceTaxPercentage || 0,
      otherTaxes: hotelInfo?.otherTaxes ? JSON.parse(JSON.stringify(hotelInfo.otherTaxes)) : [],
      taxEnabled: hotelInfo?.taxEnabled || false
    })

    // Generate unique booking ID
    const bookingId = `BL-${Date.now()}`
    
    // Create booking in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the booking
      const booking = await tx.booking.create({
        data: {
          id: bookingId,
          guestName,
          guestEmail,
          guestPhone,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          nights,
          adults,
          children,
          totalAmount: finalTaxBreakdown.totalAmount,
          originalAmount: originalAmount || baseAmount,
          discountAmount: finalDiscountAmount,
          baseAmount: finalBaseAmount,
          gstAmount: finalTaxBreakdown.gstAmount,
          serviceTaxAmount: finalTaxBreakdown.serviceTaxAmount,
          otherTaxAmount: finalTaxBreakdown.otherTaxAmount,
          totalTaxAmount: finalTaxBreakdown.totalTaxAmount,
          specialRequests,
          roomId: selectedRoom.id,
          promoCodeId: promoCodeId || null,
          status: 'confirmed',
          paymentMethod: 'pay_at_hotel', // Default payment method
          paymentStatus: 'pending',
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

      // Update room status to occupied
      await tx.rooms.update({
        where: { id: selectedRoom.id },
        data: {
          status: 'occupied',
          updatedAt: new Date()
        }
      })

      return booking
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
