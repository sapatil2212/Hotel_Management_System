import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'No active session found'
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      authenticated: false,
      error: 'Session check failed'
    }, { status: 500 })
  }
}
