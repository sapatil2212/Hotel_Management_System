import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/room-types - Get all room types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')
    const categoryId = searchParams.get('categoryId')
    
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    if (available === 'true') {
      where.available = true
    }

    const roomTypes = await prisma.room.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        currency: true,
        description: true,
        shortDescription: true,
        size: true,
        bedType: true,
        maxGuests: true,
        totalRooms: true,
        available: true,
        amenities: true,
        features: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
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

    // Transform data to include availability info
    const roomTypesWithAvailability = roomTypes.map(roomType => ({
      id: roomType.id,
      name: roomType.name,
      slug: roomType.slug,
      price: roomType.price,
      currency: roomType.currency,
      description: roomType.description,
      shortDescription: roomType.shortDescription,
      size: roomType.size,
      bedType: roomType.bedType,
      maxGuests: roomType.maxGuests,
      totalRooms: roomType.totalRooms,
      available: roomType.available,
      amenities: roomType.amenities || [],
      features: roomType.features || [],
      images: roomType.images || [],
      category: roomType.category,
      currentRoomsCount: roomType._count.rooms,
      availableSlots: roomType.totalRooms - roomType._count.rooms,
      canAddMore: roomType._count.rooms < roomType.totalRooms
    }))

    return NextResponse.json({
      success: true,
      data: roomTypesWithAvailability,
      message: 'Room types fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch room types' 
      },
      { status: 500 }
    )
  }
}
