import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

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
        logo: null,
        logoDisplayType: "image",
        brandText: "",
        brandTextStyle: "default",
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
        privacyPolicy: "",
        termsOfService: "",
        guestPolicies: "",
        faqs: [],
        bookingPartners: [],
        partnerLogos: [],
        propertyAmenities: [],
        businessFacilities: [],
        safetyFeatures: [],
        services: [],
        gstPercentage: 18.0,
        serviceTaxPercentage: 0.0,
        otherTaxes: [],
        taxEnabled: true,
        socialMediaLinks: [
          { platform: "facebook", url: "", enabled: false },
          { platform: "instagram", url: "", enabled: false },
          { platform: "twitter", url: "", enabled: false },
          { platform: "linkedin", url: "", enabled: false },
          { platform: "youtube", url: "", enabled: false }
        ]
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
      logo,
      logoDisplayType,
      brandText,
      brandTextStyle,
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
      privacyPolicy,
      termsOfService,
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
      socialMediaLinks,
    } = data

    const updateData = {
      name,
      tagline,
      description,
      logo,
      logoDisplayType,
      brandText,
      brandTextStyle,
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
      privacyPolicy,
      termsOfService,
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
      socialMediaLinks,
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
      // Create new hotel info with generated ID
      hotelInfo = await prisma.hotelinfo.create({
        data: {
          id: `hotel_${nanoid()}`, // Generate unique ID
          ...updateData
        }
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
