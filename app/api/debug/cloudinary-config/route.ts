import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as string | undefined
  if (!role || (role !== "ADMIN" && role !== "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  // Test signature generation
  let testSignature = null
  let testError = null
  
  if (cloudName && apiKey && apiSecret) {
    try {
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      })
      
      const timestamp = Math.floor(Date.now() / 1000)
      testSignature = cloudinary.utils.api_sign_request(
        {
          folder: 'uploads',
          timestamp: timestamp
        },
        apiSecret
      )
    } catch (error) {
      testError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return NextResponse.json({
    cloudName: cloudName ? `${cloudName.substring(0, 4)}...${cloudName.substring(cloudName.length - 4)}` : null,
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : null,
    apiSecret: apiSecret ? `${apiSecret.substring(0, 8)}...` : null,
    cloudNameLength: cloudName?.length || 0,
    apiKeyLength: apiKey?.length || 0,
    apiSecretLength: apiSecret?.length || 0,
    allSet: !!(cloudName && apiKey && apiSecret),
    testSignature: testSignature ? `${testSignature.substring(0, 8)}...` : null,
    testError: testError
  })
}
