import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/rooms/available-for-booking - Get available rooms for booking changes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get('roomTypeId')
    const currentRoomId = searchParams.get('currentRoomId')

    if (!roomTypeId) {
      return NextResponse.json({ error: "Room type ID is required" }, { status: 400 })
    }

    // Get available rooms of the same type, plus the currently allocated room
    const availableRooms = await prisma.rooms.findMany({
      where: {
        roomTypeId: roomTypeId,
        OR: [
          { status: 'available' },
          { id: currentRoomId } // Include current room so user can keep the same room
        ]
      },
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
