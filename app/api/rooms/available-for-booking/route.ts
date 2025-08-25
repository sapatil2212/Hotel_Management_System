import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/rooms/available-for-booking - Get all available rooms for booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get('roomTypeId')
    const currentRoomId = searchParams.get('currentRoomId')

    // Build the where clause conditionally
    const whereCondition: any = {
      OR: [
        { status: 'available' }
      ]
    }

    // Filter by room type if provided
    if (roomTypeId) {
      whereCondition.roomTypeId = roomTypeId
    }

    // Only include current room if it's provided
    if (currentRoomId) {
      whereCondition.OR.push({ id: currentRoomId })
    }

    // Get available rooms with full room type details
    const availableRooms = await prisma.rooms.findMany({
      where: whereCondition,
      select: {
        id: true,
        roomNumber: true,
        status: true,
        floorNumber: true,
        roomType: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            size: true,
            bedType: true,
            maxGuests: true,
            amenities: true,
            images: true
          }
        }
      },
      orderBy: [
        { floorNumber: 'asc' },
        { roomNumber: 'asc' }
      ]
    })

    return NextResponse.json(availableRooms)
  } catch (error) {
    console.error('Error fetching available rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available rooms' },
      { status: 500 }
    )
  }
}
