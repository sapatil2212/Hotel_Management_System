import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/rooms - Get all rooms with real availability calculation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')
    const categoryId = searchParams.get('categoryId')
    
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        category: true,
        rooms: {
          select: {
            id: true,
            status: true
          }
        },
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate real availability for each room type
    const roomsWithRealAvailability = rooms.map(room => {
      const availableRooms = room.rooms.filter(r => r.status === 'available').length
      const totalRooms = room.totalRooms
      const isAvailable = availableRooms > 0
      
      return {
        ...room,
        amenities: room.amenities || [],
        features: room.features || [],
        highlights: room.highlights || "",
        available: isAvailable,
        availableRoomsCount: availableRooms,
        totalRooms: totalRooms,
        isSoldOut: availableRooms === 0
      }
    })

    // Filter by availability if requested
    const filteredRooms = available === 'true' 
      ? roomsWithRealAvailability.filter(room => room.available)
      : roomsWithRealAvailability

    return NextResponse.json(filteredRooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate unique ID
    const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const room = await prisma.room.create({
      data: {
        id,
        ...data,
        slug,
        updatedAt: new Date(),
        images: data.images || [],
        amenities: data.amenities || [],
        features: data.features || [],
        keywords: data.keywords || [],
        highlights: data.highlights || '',
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        viewType: data.viewType || null,
        floorNumber: data.floorNumber || null,
        roomNumber: data.roomNumber || null
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

    return NextResponse.json(roomWithDefaults, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
