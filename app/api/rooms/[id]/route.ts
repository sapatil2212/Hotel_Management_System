import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
        booking: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
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
    // Check if room has any bookings
    const bookingCount = await prisma.booking.count({
      where: {
        roomId: params.id
      }
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with existing bookings' },
        { status: 400 }
      )
    }

    await prisma.room.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
