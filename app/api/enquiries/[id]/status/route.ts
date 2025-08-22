import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"

const statusSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved", "closed"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = statusSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.issues,
        },
        { status: 422 }
      )
    }

    const { status } = parsed.data

    // Check if enquiry exists
    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id: params.id },
    })

    if (!existingEnquiry) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      )
    }

    // Update enquiry status
    const updatedEnquiry = await prisma.enquiry.update({
      where: { id: params.id },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      enquiry: updatedEnquiry,
    })
  } catch (error) {
    console.error("Error updating enquiry status:", error)
    return NextResponse.json(
      { error: "Failed to update enquiry status" },
      { status: 500 }
    )
  }
}
