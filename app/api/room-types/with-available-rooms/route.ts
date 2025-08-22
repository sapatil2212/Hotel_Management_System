import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/room-types/with-available-rooms - Get all room types with their available rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentRoomId = searchParams.get('currentRoomId')

    const roomTypes = await prisma.room.findMany({
      include: {
        category: true,
        rooms: {
          where: {
            OR: [
              { status: 'available' },
              ...(currentRoomId ? [{ id: currentRoomId }] : []) // Include current room
            ]
          },
          select: {
            id: true,
            roomNumber: true,
            status: true,
            floorNumber: true
          },
          orderBy: [
            { floorNumber: 'asc' },
            { roomNumber: 'asc' }
          ]
        },
        _count: {
          select: { rooms: true }
        }
      },
      orderBy: {
        price: 'asc'
      }
    })

    // Transform data to include availability info
    const roomTypesWithAvailability = roomTypes.map(roomType => ({
      id: roomType.id,
      name: roomType.name,
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
      category: roomType.category,
      totalRooms: roomType.totalRooms,
      totalCreatedRooms: roomType._count.rooms,
      availableRooms: roomType.rooms,
      hasAvailableRooms: roomType.rooms.length > 0
    }))

    return NextResponse.json(roomTypesWithAvailability)
  } catch (error) {
    console.error('Error fetching room types with available rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types with available rooms' },
      { status: 500 }
    )
  }
}
