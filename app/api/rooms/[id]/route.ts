import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/rooms/[id] - Get a specific room
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: params.id
      },
      include: {
        category: true,
        rooms: {
          include: {
            bookings: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Ensure amenities and features are arrays
    const roomWithDefaults = {
      ...room,
      amenities: room.amenities || [],
      features: room.features || [],
      highlights: room.highlights || ""
    }

    return NextResponse.json(roomWithDefaults)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

// PUT /api/rooms/[id] - Update a room
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    // Generate slug from name if name is being updated
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    const room = await prisma.room.update({
      where: {
        id: params.id
      },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    })

    // Ensure amenities and features are arrays
    const roomWithDefaults = {
      ...room,
      amenities: room.amenities || [],
      features: room.features || [],
      highlights: room.highlights || ""
    }

    return NextResponse.json(roomWithDefaults)
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms/[id] - Delete a room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure the room type exists
    const roomType = await prisma.room.findUnique({ where: { id: params.id } })
    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if there are individual rooms under this room type
    const childRoomsCount = await prisma.rooms.count({
      where: { roomTypeId: params.id }
    })
    if (childRoomsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room type with existing individual rooms. Please delete all individual rooms first.' },
        { status: 400 }
      )
    }

    // Delete room type
    await prisma.room.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Room type deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
