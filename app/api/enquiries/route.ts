import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (priority && priority !== "all") {
      where.priority = priority
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ]
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      enquiries,
      total: enquiries.length,
    })
  } catch (error) {
    console.error("Error fetching enquiries:", error)
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    )
  }
}
