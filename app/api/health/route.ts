import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test room types query
    const roomTypesCount = await prisma.room.count()
    const sampleRoomTypes = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        totalRooms: true
      },
      take: 5
    })
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      roomTypesCount,
      sampleRoomTypes,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

