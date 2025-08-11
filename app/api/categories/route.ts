import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            price: true,
            available: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
        faqs: data.faqs || [],
        reviews: data.reviews || [],
        partners: data.partners || [],
        propertyFeatures: data.propertyFeatures || []
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
