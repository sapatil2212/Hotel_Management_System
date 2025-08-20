import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: "Session cookies cleared successfully" 
    })
    
    // Focus on the main session cookies that cause the 431 error
    const mainSessionCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url"
    ]
    
    // Add numbered session tokens (0-99) that are causing the issue
    for (let i = 0; i < 100; i++) {
      mainSessionCookies.push(`next-auth.session-token.${i}`)
      mainSessionCookies.push(`__Secure-next-auth.session-token.${i}`)
    }
    
    // Clear each cookie with multiple variations
    mainSessionCookies.forEach(cookieName => {
      // Delete the cookie
      response.cookies.delete(cookieName)
      
      // Set to expire with different paths
      const paths = ["/", "/auth", "/dashboard", "/api"]
      paths.forEach(path => {
        response.cookies.set(cookieName, "", { 
          expires: new Date(0),
          path: path,
          httpOnly: true,
          secure: false,
          sameSite: "lax"
        })
      })
    })
    
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("Error clearing session:", error)
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}

