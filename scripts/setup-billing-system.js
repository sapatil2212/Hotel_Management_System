const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up billing system...');

  try {
    // Create sample services
    const services = [
      // Food & Beverage
      {
        name: 'Room Service - Breakfast',
        description: 'Continental breakfast served in room',
        category: 'food_beverage',
        price: 500,
        taxable: true,
      },
      {
        name: 'Room Service - Lunch',
        description: 'À la carte lunch served in room',
        category: 'food_beverage',
        price: 800,
        taxable: true,
      },
      {
        name: 'Room Service - Dinner',
        description: 'Multi-course dinner served in room',
        category: 'food_beverage',
        price: 1200,
        taxable: true,
      },
      {
        name: 'Minibar Consumption',
        description: 'Beverages and snacks from minibar',
        category: 'minibar',
        price: 250,
        taxable: true,
      },
      
      // Spa Services
      {
        name: 'Full Body Massage',
        description: '60-minute therapeutic massage',
        category: 'spa',
        price: 2500,
        taxable: true,
      },
      {
        name: 'Facial Treatment',
        description: 'Rejuvenating facial therapy',
        category: 'spa',
        price: 1800,
        taxable: true,
      },
      {
        name: 'Ayurvedic Massage',
        description: 'Traditional Ayurvedic healing massage',
        category: 'spa',
        price: 3000,
        taxable: true,
      },
      
      // Laundry Services
      {
        name: 'Laundry Service - Regular',
        description: 'Standard washing and pressing',
        category: 'laundry',
        price: 150,
        taxable: true,
      },
      {
        name: 'Dry Cleaning',
        description: 'Professional dry cleaning service',
        category: 'laundry',
        price: 300,
        taxable: true,
      },
      {
        name: 'Express Laundry',
        description: 'Same-day laundry service',
        category: 'laundry',
        price: 250,
        taxable: true,
      },
      
      // Transport Services
      {
        name: 'Airport Transfer',
        description: 'One-way airport pickup/drop',
        category: 'transport',
        price: 1500,
        taxable: true,
      },
      {
        name: 'City Tour',
        description: 'Half-day city sightseeing tour',
        category: 'transport',
        price: 2500,
        taxable: true,
      },
      {
        name: 'Taxi Service',
        description: 'Local taxi service per hour',
        category: 'transport',
        price: 500,
        taxable: true,
      },
      
      // Conference Services
      {
        name: 'Conference Room Rental',
        description: 'Meeting room with AV equipment',
        category: 'conference',
        price: 2000,
        taxable: true,
      },
      {
        name: 'Catering - Coffee Break',
        description: 'Tea, coffee, and light snacks',
        category: 'conference',
        price: 300,
        taxable: true,
      },
      {
        name: 'Business Center Services',
        description: 'Printing, fax, and secretarial services',
        category: 'conference',
        price: 200,
        taxable: true,
      },
      
      // Other Services
      {
        name: 'WiFi Premium',
        description: 'High-speed internet upgrade',
        category: 'other',
        price: 500,
        taxable: false,
      },
      {
        name: 'Late Checkout',
        description: 'Extended checkout beyond standard time',
        category: 'other',
        price: 1000,
        taxable: true,
      },
      {
        name: 'Extra Bed',
        description: 'Additional bed setup in room',
        category: 'accommodation',
        price: 1500,
        taxable: true,
      },
      {
        name: 'Pet Service',
        description: 'Pet care and accommodation',
        category: 'other',
        price: 800,
        taxable: true,
      },
      {
        name: 'Valet Parking',
        description: 'Valet parking service per day',
        category: 'other',
        price: 300,
        taxable: true,
      },
    ];

    console.log('📦 Creating services...');
    
    for (const service of services) {
      // Check if service already exists
      const existingService = await prisma.service.findFirst({
        where: { name: service.name },
      });

      if (existingService) {
        // Update existing service
        await prisma.service.update({
          where: { id: existingService.id },
          data: service,
        });
      } else {
        // Create new service
        await prisma.service.create({
          data: service,
        });
      }
    }

    console.log(`✅ Created ${services.length} services`);

    // Update hotel info with GST settings if not already set
    const hotelInfo = await prisma.hotelinfo.findFirst();
    
    if (hotelInfo) {
      await prisma.hotelinfo.update({
        where: { id: hotelInfo.id },
        data: {
          gstPercentage: hotelInfo.gstPercentage || 18,
          serviceTaxPercentage: hotelInfo.serviceTaxPercentage || 0,
          taxEnabled: hotelInfo.taxEnabled !== undefined ? hotelInfo.taxEnabled : true,
          gstNumber: hotelInfo.gstNumber || 'GSTIN123456789',
          otherTaxes: hotelInfo.otherTaxes || [],
        },
      });
      console.log('✅ Updated hotel tax settings');
    } else {
      console.log('⚠️  No hotel info found. Please configure hotel information first.');
    }

    console.log('🎉 Billing system setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npx prisma migrate dev --name add_billing_system');
    console.log('2. Run: npx prisma generate');
    console.log('3. Restart your development server');
    console.log('4. Navigate to /dashboard/billing to test the system');
    console.log('\n💡 Features available:');
    console.log('- ✅ Add/remove bill items with automatic tax calculation');
    console.log('- ✅ Multiple payment methods (Cash, Card, UPI, Bank Transfer, etc.)');
    console.log('- ✅ Split payments support');
    console.log('- ✅ GST-compliant invoice generation with QR codes');
    console.log('- ✅ Revenue reporting with multiple breakdowns');
    console.log('- ✅ Guest billing view with secure access tokens');
    console.log('- ✅ Email and WhatsApp invoice delivery (requires configuration)');
    console.log('- ✅ Comprehensive dashboard with analytics');

  } catch (error) {
    console.error('❌ Error setting up billing system:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
