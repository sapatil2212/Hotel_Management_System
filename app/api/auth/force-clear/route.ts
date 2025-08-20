import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: "All session data cleared forcefully" 
    })
    
    // Clear ALL possible NextAuth cookies with different variations
    const cookiesToClear = [
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "__Secure-next-auth.csrf-token",
      "__Secure-next-auth.callback-url",
      "session",
      "token",
      "auth",
      "next-auth.pkce.code_verifier",
      "next-auth.pkce.code_challenge",
      "next-auth.state",
      "next-auth.nonce",
      "next-auth.provider",
      "next-auth.verification-token",
      "next-auth.verification-token-expires",
      "next-auth.verification-token-email",
      "next-auth.verification-token-provider",
      "next-auth.verification-token-type",
      "next-auth.verification-token-created",
      "next-auth.verification-token-used",
      "next-auth.verification-token-attempts",
      "next-auth.verification-token-max-attempts",
      "next-auth.verification-token-lockout",
      "next-auth.verification-token-lockout-expires",
      "next-auth.verification-token-lockout-attempts",
      "next-auth.verification-token-lockout-max-attempts",
      "next-auth.verification-token-lockout-duration",
      "next-auth.verification-token-lockout-multiplier",
      "next-auth.verification-token-lockout-max-duration",
      "next-auth.verification-token-lockout-reset",
      "next-auth.verification-token-lockout-reset-expires",
      "next-auth.verification-token-lockout-reset-attempts",
      "next-auth.verification-token-lockout-reset-max-attempts",
      "next-auth.verification-token-lockout-reset-duration",
      "next-auth.verification-token-lockout-reset-multiplier",
      "next-auth.verification-token-lockout-reset-max-duration"
    ]
    
    // Add numbered session tokens (0-99) that are causing the issue
    for (let i = 0; i < 100; i++) {
      cookiesToClear.push(`next-auth.session-token.${i}`)
      cookiesToClear.push(`__Secure-next-auth.session-token.${i}`)
    }
    
    // Clear each cookie with multiple path variations and domain settings
    cookiesToClear.forEach(cookieName => {
      // First delete the cookie
      response.cookies.delete(cookieName)
      
      // Then set it to expire with different configurations
      const paths = ["/", "/auth", "/dashboard", "/api"]
      const domains = ["", "localhost", ".localhost"]
      
      paths.forEach(path => {
        domains.forEach(domain => {
          response.cookies.set(cookieName, "", { 
            expires: new Date(0),
            path: path,
            domain: domain || undefined,
            httpOnly: true,
            secure: false,
            sameSite: "lax"
          })
        })
      })
    })
    
    // Set headers to prevent caching and ensure proper cleanup
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')
    
    return response
  } catch (error) {
    console.error("Error in force clear:", error)
    return NextResponse.json(
      { error: "Failed to clear session forcefully" },
      { status: 500 }
    )
  }
}

// Add GET method for direct browser access
export async function GET(request: NextRequest) {
  return POST(request)
}

