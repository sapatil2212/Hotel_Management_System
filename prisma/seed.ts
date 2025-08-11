import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create basic hotel info
  const hotelInfo = await prisma.hotelInfo.upsert({
    where: { id: "default-hotel" },
    update: {},
    create: {
      id: "default-hotel",
      name: "Grand Hotel & Resort",
      tagline: "Your Perfect Stay Awaits",
      description: "Experience luxury and comfort at our premier hotel. We offer world-class amenities and exceptional service to make your stay memorable.",
      starRating: 5,
      overallRating: 4.5,
      reviewCount: 150,
      primaryPhone: "+91-9876543210",
      whatsappPhone: "+91-9876543210",
      primaryEmail: "info@grandhotel.com",
      reservationEmail: "reservations@grandhotel.com",
      address: "123 Luxury Street, Downtown, City - 123456",
      emergencyContact: "+91-9876543211",
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      cancellationPolicy: "Free cancellation up to 24 hours before check-in",
      petPolicy: "Pets are welcome with prior approval",
      smokingPolicy: "Designated smoking areas available",
      faqs: [
        {
          question: "What time is check-in and check-out?",
          answer: "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability."
        },
        {
          question: "Is WiFi included?",
          answer: "Yes, complimentary high-speed WiFi is available throughout the room and all public areas of the hotel."
        },
        {
          question: "Can I cancel my reservation?",
          answer: "Yes, this room offers free cancellation up to 24 hours before your arrival date. Please check our cancellation policy for full details."
        },
        {
          question: "Is breakfast included?",
          answer: "Breakfast is not included in the room rate but can be added to your reservation. We offer both continental and à la carte breakfast options."
        },
        {
          question: "Are pets allowed?",
          answer: "We welcome well-behaved pets with prior notification. Additional pet fees may apply. Please contact us in advance to arrange pet-friendly accommodations."
        },
        {
          question: "Is parking available?",
          answer: "Yes, we offer both valet parking and self-parking options. Charges apply for parking services."
        }
      ],
      propertyAmenities: ["Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking"],
      businessFacilities: ["Conference Room", "Business Center", "Meeting Rooms"],
      safetyFeatures: ["24/7 Security", "CCTV", "Fire Safety", "First Aid"],
      services: ["Room Service", "Laundry", "Airport Transfer", "Concierge"]
    }
  })

  // Create basic categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "deluxe-rooms" },
      update: {},
      create: {
        name: "Deluxe Rooms",
        slug: "deluxe-rooms",
        aboutTitle: "Luxury Deluxe Rooms",
        aboutShort: "Spacious and elegant rooms with premium amenities",
        aboutMore: "Our deluxe rooms offer the perfect blend of comfort and luxury. Each room is thoughtfully designed with premium furnishings and modern amenities to ensure a memorable stay.",
        contactPhone: "+91-9876543210",
        contactEmail: "deluxe@grandhotel.com",
        contactAddress: "Grand Hotel & Resort, 123 Luxury Street, Downtown",
        propertyFeatures: ["King Bed", "City View", "Balcony", "Premium Amenities"]
      }
    }),
    prisma.category.upsert({
      where: { slug: "suite-rooms" },
      update: {},
      create: {
        name: "Suite Rooms",
        slug: "suite-rooms",
        aboutTitle: "Executive Suites",
        aboutShort: "Ultimate luxury with separate living areas",
        aboutMore: "Experience the epitome of luxury in our executive suites. These spacious accommodations feature separate living areas, premium furnishings, and exclusive amenities for the discerning traveler.",
        contactPhone: "+91-9876543210",
        contactEmail: "suites@grandhotel.com",
        contactAddress: "Grand Hotel & Resort, 123 Luxury Street, Downtown",
        propertyFeatures: ["Separate Living Room", "Premium View", "Butler Service", "Exclusive Amenities"]
      }
    })
  ])

  // Create sample rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { slug: "deluxe-king" },
      update: {},
      create: {
        name: "Deluxe King Room",
        slug: "deluxe-king",
        price: 5000,
        originalPrice: 6000,
        description: "Spacious deluxe room with a king-size bed, city view, and premium amenities. Perfect for business travelers and couples seeking comfort and luxury.",
        shortDescription: "Luxury king room with city view",
        images: ["/uploads/room1.jpg", "/uploads/room2.jpg"],
        amenities: ["King Bed", "City View", "Balcony", "Free WiFi", "Mini Bar", "Room Service"],
        maxGuests: 2,
        size: "45 sq m",
        bedType: "King",
        bathroomCount: 1,
        available: true,
        features: ["Air Conditioning", "TV", "Safe", "Work Desk"],
        totalRooms: 10,
        categoryId: categories[0].id
      }
    }),
    prisma.room.upsert({
      where: { slug: "executive-suite" },
      update: {},
      create: {
        name: "Executive Suite",
        slug: "executive-suite",
        price: 12000,
        originalPrice: 15000,
        description: "Ultimate luxury with separate living room, premium furnishings, and exclusive amenities. Perfect for executives and families seeking the finest accommodations.",
        shortDescription: "Luxury suite with separate living area",
        images: ["/uploads/suite1.jpg", "/uploads/suite2.jpg"],
        amenities: ["Separate Living Room", "King Bed", "Premium View", "Butler Service", "Free WiFi", "Mini Bar"],
        maxGuests: 4,
        size: "80 sq m",
        bedType: "King + Sofa Bed",
        bathroomCount: 2,
        available: true,
        features: ["Air Conditioning", "TV", "Safe", "Work Desk", "Dining Area"],
        totalRooms: 5,
        categoryId: categories[1].id
      }
    })
  ])

  console.log("Seeding completed successfully!")
  console.log(`Created hotel info: ${hotelInfo.name}`)
  console.log(`Created ${categories.length} categories`)
  console.log(`Created ${rooms.length} rooms`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


