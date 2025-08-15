import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, roomId, totalAmount, checkIn, checkOut } = body

    if (!code || !roomId || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the promo code
    const promoCode = await prisma.promocode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code' },
        { status: 404 }
      )
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { success: false, error: 'Promo code is not active' },
        { status: 400 }
      )
    }

    // Check date validity
    const now = new Date()
    const checkInDate = checkIn ? new Date(checkIn) : now

    if (promoCode.validFrom > checkInDate) {
      return NextResponse.json(
        { success: false, error: 'Promo code is not yet valid' },
        { status: 400 }
      )
    }

    if (promoCode.validUntil < checkInDate) {
      return NextResponse.json(
        { success: false, error: 'Promo code has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Promo code usage limit reached' },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && totalAmount < promoCode.minOrderAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum order amount of ₹${promoCode.minOrderAmount} required` 
        },
        { status: 400 }
      )
    }

    // Check room applicability
    if (promoCode.applicableRooms && Array.isArray(promoCode.applicableRooms)) {
      if (!promoCode.applicableRooms.includes(roomId) && !promoCode.applicableRooms.includes('all')) {
        return NextResponse.json(
          { success: false, error: 'Promo code not applicable for this room' },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (promoCode.discountType === 'percentage') {
      discountAmount = (totalAmount * promoCode.discountValue) / 100
    } else if (promoCode.discountType === 'fixed') {
      discountAmount = promoCode.discountValue
    }

    // Apply maximum discount limit
    if (promoCode.maxDiscountAmount && discountAmount > promoCode.maxDiscountAmount) {
      discountAmount = promoCode.maxDiscountAmount
    }

    // Ensure discount doesn't exceed total amount
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount
    }

    const finalAmount = totalAmount - discountAmount

    return NextResponse.json({
      success: true,
      data: {
        promoCode: {
          id: promoCode.id,
          code: promoCode.code,
          title: promoCode.title,
          description: promoCode.description,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue
        },
        originalAmount: totalAmount,
        discountAmount,
        finalAmount,
        savings: discountAmount
      },
      message: 'Promo code applied successfully'
    })
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}
