import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/room-types/available - Get room types with available slots
export async function GET() {
  try {
    const roomTypes = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        totalRooms: true,
        price: true,
        currency: true,
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Calculate available slots for each room type
    const roomTypesWithAvailability = roomTypes.map(roomType => ({
      ...roomType,
      currentRoomsCount: roomType._count.rooms,
      availableSlots: roomType.totalRooms - roomType._count.rooms,
      canAddMore: roomType._count.rooms < roomType.totalRooms
    }))

    return NextResponse.json(roomTypesWithAvailability)
  } catch (error) {
    console.error('Error fetching available room types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}
