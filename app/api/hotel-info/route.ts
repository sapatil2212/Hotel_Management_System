import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/hotel-info - Get hotel information
export async function GET() {
  try {
    // Get the first (and should be only) hotel info record
    const hotelInfo = await prisma.hotelinfo.findFirst()
    
    if (!hotelInfo) {
      // Return default hotel info structure if none exists
      return NextResponse.json({
        id: null,
        name: "",
        tagline: "",
        description: "",
        starRating: 5,
        overallRating: 4.5,
        reviewCount: 0,
        primaryPhone: "",
        whatsappPhone: "",
        primaryEmail: "",
        reservationEmail: "",
        address: "",
        emergencyContact: "",
        googleMapsEmbedCode: "",
        latitude: null,
        longitude: null,
        directionsUrl: "",
        nearbyAttractions: [],
        distanceFromKeyPlaces: [],
        checkInTime: "3:00 PM",
        checkOutTime: "11:00 AM",
        cancellationPolicy: "",
        petPolicy: "",
        smokingPolicy: "",
        guestPolicies: "",
        faqs: [],
        bookingPartners: [],
        partnerLogos: [],
        propertyAmenities: [],
        businessFacilities: [],
        safetyFeatures: [],
        services: [],
        gstNumber: "",
        gstPercentage: 18.0,
        serviceTaxPercentage: 0.0,
        otherTaxes: [],
        taxEnabled: true
      })
    }

    return NextResponse.json(hotelInfo)
  } catch (error) {
    console.error('Error fetching hotel info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotel information' },
      { status: 500 }
    )
  }
}

// POST /api/hotel-info - Create or update hotel information
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      name,
      tagline,
      description,
      starRating,
      overallRating,
      reviewCount,
      primaryPhone,
      whatsappPhone,
      primaryEmail,
      reservationEmail,
      address,
      emergencyContact,
      googleMapsEmbedCode,
      latitude,
      longitude,
      directionsUrl,
      nearbyAttractions,
      distanceFromKeyPlaces,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petPolicy,
      smokingPolicy,
      guestPolicies,
      faqs,
      bookingPartners,
      partnerLogos,
      propertyAmenities,
      businessFacilities,
      safetyFeatures,
      services,
      gstNumber,
      gstPercentage,
      serviceTaxPercentage,
      otherTaxes,
      taxEnabled,
    } = data

    const updateData = {
      name,
      tagline,
      description,
      starRating,
      overallRating,
      reviewCount,
      primaryPhone,
      whatsappPhone,
      primaryEmail,
      reservationEmail,
      address,
      emergencyContact,
      googleMapsEmbedCode,
      latitude,
      longitude,
      directionsUrl,
      nearbyAttractions,
      distanceFromKeyPlaces,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petPolicy,
      smokingPolicy,
      guestPolicies,
      faqs,
      bookingPartners,
      partnerLogos,
      propertyAmenities,
      businessFacilities,
      safetyFeatures,
      services,
      gstNumber,
      gstPercentage,
      serviceTaxPercentage,
      otherTaxes,
      taxEnabled,
      updatedAt: new Date(),
    } as any
    
    // Check if hotel info already exists
    const existingHotelInfo = await prisma.hotelinfo.findFirst()
    
    let hotelInfo
    
    if (existingHotelInfo) {
      // Update existing hotel info
      hotelInfo = await prisma.hotelinfo.update({
        where: {
          id: existingHotelInfo.id
        },
        data: {
          ...updateData
        }
      })
    } else {
      // Create new hotel info
      hotelInfo = await prisma.hotelinfo.create({
        data: updateData
      })
    }

    return NextResponse.json(hotelInfo)
  } catch (error) {
    console.error('Error saving hotel info:', error)
    return NextResponse.json(
      { error: 'Failed to save hotel information' },
      { status: 500 }
    )
  }
}

// PUT /api/hotel-info - Update hotel information (alias for POST)
export async function PUT(request: NextRequest) {
  return POST(request)
}
