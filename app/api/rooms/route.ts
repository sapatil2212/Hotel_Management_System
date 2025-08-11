import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/rooms - Get all rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')
    const categoryId = searchParams.get('categoryId')
    
    const where: any = {}
    
    if (available === 'true') {
      where.available = true
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        category: true,
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

    // Ensure amenities and features are arrays
    const roomsWithDefaults = rooms.map(room => ({
      ...room,
      amenities: room.amenities || [],
      features: room.features || [],
      highlights: room.highlights || ""
    }))

    return NextResponse.json(roomsWithDefaults)
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
