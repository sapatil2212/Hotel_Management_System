import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as string | undefined
  if (!role || (role !== "ADMIN" && role !== "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { folder = "uploads" } = await req.json().catch(() => ({}))

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary env not configured" }, { status: 500 })
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  const timestamp = Math.floor(Date.now() / 1000)
  
  // Use Cloudinary's built-in signature generation
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: folder,
      timestamp: timestamp
    },
    apiSecret
  )

  console.log('Cloudinary signature generation v3:', {
    cloudName,
    apiKey: apiKey.substring(0, 8) + '...',
    timestamp,
    signature: signature.substring(0, 8) + '...',
    apiSecretLength: apiSecret.length
  })

  return NextResponse.json({ 
    timestamp, 
    signature, 
    apiKey, 
    cloudName, 
    folder
  })
}
