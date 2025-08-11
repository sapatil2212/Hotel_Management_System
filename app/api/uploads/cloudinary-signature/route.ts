import { NextResponse } from "next/server"
import crypto from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as string | undefined
  if (!role || (role !== "ADMIN" && role !== "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { folder = "rooms" } = await req.json().catch(() => ({}))

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary env not configured" }, { status: 500 })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex")

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder })
}


