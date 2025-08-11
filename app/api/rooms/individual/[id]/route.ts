import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/rooms/individual/[id] - Get a specific individual room
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.rooms.findUnique({
      where: {
        id: params.id
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            price: true,
            amenities: true,
            features: true,
            size: true,
            bedType: true,
            maxGuests: true,
            currency: true,
            description: true,
            images: true
          }
        },
        bookings: {
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

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching individual room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

// PUT /api/rooms/individual/[id] - Update an individual room
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { roomNumber, status, floorNumber, notes } = data
    
    // Check if room exists
    const existingRoom = await prisma.rooms.findUnique({
      where: { id: params.id }
    })
    
    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    // If updating room number, check for conflicts
    if (roomNumber && roomNumber !== existingRoom.roomNumber) {
      const conflictingRoom = await prisma.rooms.findUnique({
        where: { roomNumber }
      })
      
      if (conflictingRoom) {
        return NextResponse.json(
          { error: 'Room number already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (roomNumber) updateData.roomNumber = roomNumber
    if (status) updateData.status = status
    if (floorNumber !== undefined) updateData.floorNumber = floorNumber
    if (notes !== undefined) updateData.notes = notes

    const room = await prisma.rooms.update({
      where: {
        id: params.id
      },
      data: updateData,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            price: true,
            amenities: true,
            features: true,
            size: true,
            bedType: true,
            maxGuests: true,
            currency: true
          }
        }
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error updating individual room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms/individual/[id] - Delete an individual room
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

    await prisma.rooms.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting individual room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
