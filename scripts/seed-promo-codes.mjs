import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function seedPromoCodes() {
  try {
    console.log('🌱 Seeding promo codes...')
    
    const promoCodes = [
      {
        id: nanoid(),
        code: 'WELCOME10',
        title: 'Welcome 10% Off',
        description: 'Get 10% off on your first booking with us!',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        maxDiscountAmount: 500,
        usageLimit: 100,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        applicableRooms: ['all'],
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        code: 'SUMMER20',
        title: 'Summer Special 20% Off',
        description: 'Beat the heat with 20% off on all room bookings!',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 2000,
        maxDiscountAmount: 1000,
        usageLimit: 50,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        applicableRooms: ['all'],
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        code: 'FLASH500',
        title: 'Flash Sale ₹500 Off',
        description: 'Limited time offer - Get flat ₹500 off!',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 3000,
        usageLimit: 25,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        applicableRooms: ['all'],
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        code: 'WEEKEND15',
        title: 'Weekend Getaway 15% Off',
        description: 'Perfect for weekend stays - 15% discount!',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 1500,
        maxDiscountAmount: 750,
        usageLimit: 75,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        applicableRooms: ['all'],
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        code: 'EXPIRED10',
        title: 'Expired Promo',
        description: 'This promo code has expired (for testing)',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        isActive: true,
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        applicableRooms: ['all'],
        updatedAt: new Date()
      }
    ]

    for (const promoCode of promoCodes) {
      await prisma.promocode.upsert({
        where: { code: promoCode.code },
        update: promoCode,
        create: promoCode
      })
      console.log(`✅ Created/updated promo code: ${promoCode.code}`)
    }

    console.log('🎉 Promo codes seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding promo codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPromoCodes()
