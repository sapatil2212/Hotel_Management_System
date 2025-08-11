import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// GET - Fetch all promo codes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // 'active', 'inactive', 'expired', 'all'

    const skip = (page - 1) * limit

    // Build where clause
    let where: any = {}
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      const now = new Date()
      
      if (status === 'active') {
        where.AND = [
          { isActive: true },
          { validFrom: { lte: now } },
          { validUntil: { gte: now } }
        ]
      } else if (status === 'inactive') {
        where.isActive = false
      } else if (status === 'expired') {
        where.validUntil = { lt: now }
      }
    }

    const [promoCodes, total] = await Promise.all([
      prisma.promocode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      }),
      prisma.promocode.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: promoCodes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

// POST - Create a new promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      applicableRooms,
      isActive = true
    } = body

    // Validate required fields
    if (!code || !title || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCode = await prisma.promocode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code already exists' },
        { status: 400 }
      )
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Fixed discount must be greater than 0' },
        { status: 400 }
      )
    }

    // Validate dates
    const fromDate = new Date(validFrom)
    const untilDate = new Date(validUntil)

    if (fromDate >= untilDate) {
      return NextResponse.json(
        { success: false, error: 'Valid until date must be after valid from date' },
        { status: 400 }
      )
    }

    const promoCode = await prisma.promocode.create({
      data: {
        id: nanoid(),
        code: code.toUpperCase(),
        title,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        validFrom: fromDate,
        validUntil: untilDate,
        applicableRooms,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: promoCode,
      message: 'Promo code created successfully'
    })
  } catch (error) {
    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}
