import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if room types already exist
    const existingRoomTypes = await prisma.room.count()
    
    if (existingRoomTypes > 0) {
      return NextResponse.json({
        success: false,
        message: `Room types already exist (${existingRoomTypes} found)`,
        existingCount: existingRoomTypes
      })
    }

    // Create sample room types
    const roomTypes = await Promise.all([
      prisma.room.create({
        data: {
          id: "deluxe-room",
          name: "Deluxe",
          slug: "deluxe",
          price: 2000,
          originalPrice: 2500,
          description: "Comfortable deluxe room with modern amenities",
          shortDescription: "Comfortable room with modern amenities",
          images: ["/uploads/deluxe-room.jpg"],
          amenities: ["Queen Bed", "Free WiFi", "Air Conditioning", "TV"],
          maxGuests: 2,
          size: "35 sq m",
          bedType: "Queen",
          bathroomCount: 1,
          available: true,
          features: ["Air Conditioning", "TV", "Safe", "Work Desk"],
          totalRooms: 1,
          currency: "INR",
          updatedAt: new Date()
        }
      }),
      prisma.room.create({
        data: {
          id: "super-deluxe-room",
          name: "Super Deluxe Room",
          slug: "super-deluxe-room",
          price: 5000,
          originalPrice: 6000,
          description: "Spacious super deluxe room with premium amenities",
          shortDescription: "Spacious room with premium amenities",
          images: ["/uploads/super-deluxe-room.jpg"],
          amenities: ["King Bed", "City View", "Balcony", "Free WiFi", "Mini Bar"],
          maxGuests: 3,
          size: "45 sq m",
          bedType: "King",
          bathroomCount: 1,
          available: true,
          features: ["Air Conditioning", "TV", "Safe", "Work Desk", "Mini Bar"],
          totalRooms: 5,
          currency: "INR",
          updatedAt: new Date()
        }
      })
    ])

    // Create some individual rooms
    const individualRooms = []
    
    // Create 1 deluxe room
    const deluxeRoom = await prisma.rooms.create({
      data: {
        id: "deluxe-room-101",
        roomNumber: "101",
        roomTypeId: roomTypes[0].id,
        status: 'available',
        floorNumber: 1,
        availableForBooking: true,
        updatedAt: new Date()
      }
    })
    individualRooms.push(deluxeRoom)

    // Create 3 super deluxe rooms
    for (let i = 1; i <= 3; i++) {
      const room = await prisma.rooms.create({
        data: {
          id: `super-deluxe-room-${100 + i}`,
          roomNumber: `${100 + i}`,
          roomTypeId: roomTypes[1].id,
          status: i === 1 ? 'reserved' : 'available',
          floorNumber: i === 1 ? 1 : 2,
          availableForBooking: i !== 1, // First room is reserved
          updatedAt: new Date()
        }
      })
      individualRooms.push(room)
    }

    return NextResponse.json({
      success: true,
      message: "Room types and sample rooms created successfully",
      roomTypes: roomTypes.length,
      individualRooms: individualRooms.length,
      data: {
        roomTypes: roomTypes.map(rt => ({ id: rt.id, name: rt.name, totalRooms: rt.totalRooms })),
        rooms: individualRooms.map(r => ({ id: r.id, roomNumber: r.roomNumber, status: r.status }))
      }
    })

  } catch (error) {
    console.error('Error seeding room types:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed room types', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
