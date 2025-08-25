import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// POST /api/rooms/check-availability - Check room availability for specific dates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkIn, checkOut, guests } = body

    // Validate required fields
    if (!checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields: checkIn, checkOut, guests' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    // Get all room types with their available rooms
    const roomTypes = await prisma.room.findMany({
      include: {
        rooms: {
          where: {
            status: 'available',
            availableForBooking: true
          },
          select: {
            id: true,
            roomNumber: true,
            status: true,
            floorNumber: true
          }
        }
      },
      orderBy: {
        price: 'asc'
      }
    })

    // Check for conflicting bookings for each room
    const availableRoomTypes = []

    for (const roomType of roomTypes) {
      // Filter rooms that can accommodate the guest count
      const suitableRooms = roomType.rooms.filter(room => 
        roomType.maxGuests >= guests
      )

      if (suitableRooms.length === 0) {
        continue // Skip room types that can't accommodate the guest count
      }

      // Check for conflicting bookings in the date range
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          roomId: {
            in: suitableRooms.map(room => room.id)
          },
          OR: [
            // Check-in date falls within existing booking
            {
              checkIn: {
                lte: checkOutDate
              },
              checkOut: {
                gte: checkInDate
              }
            }
          ],
          status: {
            in: ['confirmed', 'checked_in', 'reserved']
          }
        },
        select: {
          roomId: true
        }
      })

      const conflictingRoomIds = new Set(conflictingBookings.map(booking => booking.roomId))
      const availableRooms = suitableRooms.filter(room => !conflictingRoomIds.has(room.id))

      if (availableRooms.length > 0) {
        availableRoomTypes.push({
          id: roomType.id,
          name: roomType.name,
          slug: roomType.slug,
          price: roomType.price,
          currency: roomType.currency,
          description: roomType.description,
          shortDescription: roomType.shortDescription,
          size: roomType.size,
          bedType: roomType.bedType,
          maxGuests: roomType.maxGuests,
          amenities: roomType.amenities,
          features: roomType.features,
          images: roomType.images,
          totalRooms: roomType.totalRooms,
          availableRooms: availableRooms,
          availableRoomsCount: availableRooms.length,
          isAvailable: true
        })
      }
    }

    return NextResponse.json({
      success: true,
      available: availableRoomTypes.length > 0,
      availableRoomTypes,
      totalAvailableTypes: availableRoomTypes.length
    })

  } catch (error) {
    console.error('Error checking room availability:', error)
    return NextResponse.json(
      { error: 'Failed to check room availability' },
      { status: 500 }
    )
  }
}
