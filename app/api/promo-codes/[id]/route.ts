import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch a single promo code by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promoCode = await prisma.promocode.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: promoCode
    })
  } catch (error) {
    console.error('Error fetching promo code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo code' },
      { status: 500 }
    )
  }
}

// PUT - Update a promo code
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive
    } = body

    // Check if promo code exists
    const existingPromo = await prisma.promocode.findUnique({
      where: { id: params.id }
    })

    if (!existingPromo) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check if new code already exists
    if (code && code.toUpperCase() !== existingPromo.code) {
      const codeExists = await prisma.promocode.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Promo code already exists' },
          { status: 400 }
        )
      }
    }

    // Validate discount value if provided
    if (discountType && discountValue !== undefined) {
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
    }

    // Validate dates if provided
    if (validFrom && validUntil) {
      const fromDate = new Date(validFrom)
      const untilDate = new Date(validUntil)

      if (fromDate >= untilDate) {
        return NextResponse.json(
          { success: false, error: 'Valid until date must be after valid from date' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (discountType !== undefined) updateData.discountType = discountType
    if (discountValue !== undefined) updateData.discountValue = discountValue
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom)
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil)
    if (applicableRooms !== undefined) updateData.applicableRooms = applicableRooms
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedPromoCode = await prisma.promocode.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedPromoCode,
      message: 'Promo code updated successfully'
    })
  } catch (error) {
    console.error('Error updating promo code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promo code' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if promo code exists
    const existingPromo = await prisma.promocode.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!existingPromo) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      )
    }

    // Check if promo code has been used in bookings
    if (existingPromo._count.bookings > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete promo code that has been used in bookings. Consider deactivating it instead.' },
        { status: 400 }
      )
    }

    await prisma.promocode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting promo code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete promo code' },
      { status: 500 }
    )
  }
}
