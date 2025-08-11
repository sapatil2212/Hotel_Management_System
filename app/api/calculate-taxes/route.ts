import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { calculateTaxes } from "@/lib/tax-calculator"

const prisma = new PrismaClient()

// POST /api/calculate-taxes - Calculate tax breakdown for a given amount
export async function POST(request: NextRequest) {
  try {
    const { baseAmount, discountAmount = 0 } = await request.json()
    
    if (!baseAmount || baseAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid base amount' },
        { status: 400 }
      )
    }

    // Get hotel tax configuration
    const hotelInfo = await prisma.hotelinfo.findFirst()
    
    // Calculate final base amount after discount
    const finalBaseAmount = baseAmount - discountAmount
    
    // Calculate taxes
    const taxBreakdown = calculateTaxes(finalBaseAmount, {
      gstPercentage: hotelInfo?.gstPercentage || 0,
      serviceTaxPercentage: hotelInfo?.serviceTaxPercentage || 0,
      otherTaxes: hotelInfo?.otherTaxes ? JSON.parse(JSON.stringify(hotelInfo.otherTaxes)) : [],
      taxEnabled: hotelInfo?.taxEnabled || false
    })

    return NextResponse.json({
      success: true,
      data: {
        originalAmount: baseAmount,
        discountAmount,
        ...taxBreakdown
      }
    })
  } catch (error) {
    console.error('Error calculating taxes:', error)
    return NextResponse.json(
      { error: 'Failed to calculate taxes' },
      { status: 500 }
    )
  }
}
