const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create sample hotel info
  const hotelInfo = await prisma.hotelInfo.upsert({
    where: { id: 'hotel-1' },
    update: {},
    create: {
      id: 'hotel-1',
      name: 'Grand Luxe Hotel',
      tagline: 'Luxury Redefined',
      description: 'Experience unparalleled luxury and comfort at Grand Luxe Hotel, where every detail is crafted to perfection.',
      starRating: 5,
      overallRating: 4.8,
      reviewCount: 1247,
      primaryPhone: '+91 98765 43210',
      whatsappPhone: '+91 98765 43210',
      primaryEmail: 'info@grandluxe.com',
      reservationEmail: 'reservations@grandluxe.com',
      address: '123 Luxury Street, Premium City, State 12345, India',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      propertyAmenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge', 'Valet Parking'],
      services: ['Room Service', 'Laundry', 'Airport Transfer', 'Car Rental', 'Tour Booking']
    }
  })

  // Create sample room categories
  const deluxeCategory = await prisma.category.upsert({
    where: { slug: 'deluxe-rooms' },
    update: {},
    create: {
      name: 'Deluxe Rooms',
      slug: 'deluxe-rooms',
      aboutTitle: 'Luxurious Comfort',
      aboutShort: 'Experience premium comfort in our beautifully designed deluxe rooms.',
      aboutMore: 'Our deluxe rooms offer the perfect blend of luxury and comfort, featuring modern amenities and elegant décor.'
    }
  })

  // Create sample rooms
  const rooms = [
    {
      name: 'Super Deluxe Room',
      slug: 'super-deluxe-room',
      price: 4500,
      originalPrice: 5000,
      size: '180 sq.ft (17 sq.mt)',
      bedType: '2 Single Beds',
      bathroomCount: 1,
      maxGuests: 3,
      totalRooms: 5,
      description: 'Experience the perfect blend of comfort and luxury in our Super Deluxe Room. This elegantly appointed accommodation features modern amenities, sophisticated décor, and stunning city views.',
      shortDescription: 'Elegant room with modern amenities and city view',
      highlights: '• Panoramic city views from floor-to-ceiling windows\n• Premium Egyptian cotton bedding\n• Marble bathroom with rainfall shower\n• Complimentary high-speed WiFi',
      images: ['https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg'],
      amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'TV', 'Safe'],
      features: ['City View', 'Non-Smoking', 'Soundproof'],
      available: true,
      isPromoted: true,
      discountPercent: 10,
      cancellationFree: true,
      instantBooking: true,
      categoryId: deluxeCategory.id
    },
    {
      name: 'Presidential Suite',
      slug: 'presidential-suite',
      price: 12000,
      originalPrice: 15000,
      size: '500 sq.ft (46 sq.mt)',
      bedType: '1 King Bed',
      bathroomCount: 2,
      maxGuests: 4,
      totalRooms: 2,
      description: 'Luxurious suite with separate living area and premium amenities, perfect for discerning guests seeking the ultimate in comfort and sophistication.',
      shortDescription: 'Luxurious suite with separate living area and premium amenities',
      highlights: '• Separate living and dining area\n• Premium amenities and butler service\n• Panoramic views\n• Marble bathroom with jacuzzi',
      images: ['https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg'],
      amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'TV', 'Safe', 'Jacuzzi', 'Butler Service'],
      features: ['Ocean View', 'Non-Smoking', 'Soundproof', 'Balcony'],
      available: true,
      isPromoted: false,
      discountPercent: 20,
      cancellationFree: true,
      instantBooking: true,
      categoryId: deluxeCategory.id
    }
  ]

  for (const roomData of rooms) {
    await prisma.room.upsert({
      where: { slug: roomData.slug },
      update: roomData,
      create: roomData
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
