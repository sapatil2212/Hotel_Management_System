import { NextResponse } from "next/server"
import crypto from "crypto"
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

  const timestamp = Math.floor(Date.now() / 1000)
  
  // Create the parameters object for signing
  const params = {
    folder: folder,
    timestamp: timestamp
  }
  
  // Sort parameters alphabetically and create the string to sign
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key as keyof typeof params]}`)
    .join('&')
  
  // Generate signature using SHA1
  const signature = crypto
    .createHash("sha1")
    .update(sortedParams + apiSecret)
    .digest("hex")

  return NextResponse.json({ 
    timestamp, 
    signature, 
    apiKey, 
    cloudName, 
    folder,
    paramsToSign: sortedParams // For debugging
  })
}


