import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/rooms/available-for-booking - Get available rooms for booking changes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get('roomTypeId')
    const currentRoomId = searchParams.get('currentRoomId')

    if (!roomTypeId) {
      return NextResponse.json({ error: "Room type ID is required" }, { status: 400 })
    }

    // Build the where clause conditionally
    const whereCondition: any = {
      roomTypeId: roomTypeId,
      OR: [
        { status: 'available' }
      ]
    }

    // Only include current room if it's provided
    if (currentRoomId) {
      whereCondition.OR.push({ id: currentRoomId })
    }

    // Get available rooms of the same type, plus the currently allocated room
    const availableRooms = await prisma.rooms.findMany({
      where: whereCondition,
      select: {
        id: true,
        roomNumber: true,
        status: true,
        floorNumber: true,
        roomType: {
          select: {
            name: true
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
