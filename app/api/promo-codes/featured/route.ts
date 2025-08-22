import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Fetch featured/recent active promo codes for banner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : undefined

    const now = new Date()

    // Get active promo codes that are currently valid
    const query: any = {
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now }
      },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        discountType: true,
        discountValue: true,
        validUntil: true,
        isActive: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: [
        { validUntil: 'asc' }, // Show expiring soon first
        { createdAt: 'desc' }  // Then by creation date
      ]
    }

    if (typeof limit === 'number' && !Number.isNaN(limit)) {
      query.take = limit
    }

    const featuredPromoCodes = await prisma.promocode.findMany(query)

    return NextResponse.json({
      success: true,
      data: featuredPromoCodes,
      message: 'Featured promo codes fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching featured promo codes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured promo codes' },
      { status: 500 }
    )
  }
}
