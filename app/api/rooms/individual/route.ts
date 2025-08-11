import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/rooms/individual - Get all individual rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomTypeId = searchParams.get('roomTypeId')
    
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (roomTypeId) {
      where.roomTypeId = roomTypeId
    }

    const rooms = await prisma.rooms.findMany({
      where,
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
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching individual rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST /api/rooms/individual - Create a new individual room
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { roomNumber, roomTypeId, floorNumber, notes } = data
    
    // Check if room number already exists
    const existingRoom = await prisma.rooms.findUnique({
      where: { roomNumber }
    })
    
    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room number already exists' },
        { status: 400 }
      )
    }
    
    // Verify room type exists
    const roomType = await prisma.room.findUnique({
      where: { id: roomTypeId }
    })
    
    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }
    
    // Check if we've reached the maximum number of rooms for this type
    const existingRoomsCount = await prisma.rooms.count({
      where: { roomTypeId }
    })
    
    if (existingRoomsCount >= roomType.totalRooms) {
      return NextResponse.json(
        { error: `Cannot add more rooms. Maximum of ${roomType.totalRooms} rooms allowed for this room type.` },
        { status: 400 }
      )
    }
    
    // Generate unique ID
    const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const room = await prisma.rooms.create({
      data: {
        id,
        roomNumber,
        roomTypeId,
        floorNumber: floorNumber || null,
        notes: notes || null,
        updatedAt: new Date()
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
            currency: true
          }
        }
      }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Error creating individual room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
