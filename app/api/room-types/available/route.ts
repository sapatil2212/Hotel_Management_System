import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/room-types/available - Get room types with available slots
export async function GET() {
  try {
    console.log('Fetching room types with available slots...')
    
    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      )
    }
    
    // Check if room types exist
    const roomTypesCount = await prisma.room.count()
    console.log('Total room types in database:', roomTypesCount)
    
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

    console.log('Raw room types from database:', roomTypes)

    // Calculate available slots for each room type
    const roomTypesWithAvailability = roomTypes.map(roomType => ({
      ...roomType,
      currentRoomsCount: roomType._count.rooms,
      availableSlots: roomType.totalRooms - roomType._count.rooms,
      canAddMore: roomType._count.rooms < roomType.totalRooms
    }))

    console.log('Processed room types with availability:', roomTypesWithAvailability)

    return NextResponse.json({
      success: true,
      data: roomTypesWithAvailability,
      message: 'Room types with availability fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching available room types:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch room types', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
