import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: "Numbered session tokens cleared successfully" 
    })
    
    // Clear numbered session tokens (0-99) that are causing the issue
    for (let i = 0; i < 100; i++) {
      const sessionTokenName = `next-auth.session-token.${i}`
      const secureSessionTokenName = `__Secure-next-auth.session-token.${i}`
      
      // Delete the cookies
      response.cookies.delete(sessionTokenName)
      response.cookies.delete(secureSessionTokenName)
      
      // Set to expire with multiple path variations
      const paths = ["/", "/auth", "/dashboard", "/api"]
      const domains = ["", "localhost", ".localhost"]
      
      paths.forEach(path => {
        domains.forEach(domain => {
          // Clear regular session token
          response.cookies.set(sessionTokenName, "", { 
            expires: new Date(0),
            path: path,
            domain: domain || undefined,
            httpOnly: true,
            secure: false,
            sameSite: "lax"
          })
          
          // Clear secure session token
          response.cookies.set(secureSessionTokenName, "", { 
            expires: new Date(0),
            path: path,
            domain: domain || undefined,
            httpOnly: true,
            secure: false,
            sameSite: "lax"
          })
        })
      })
    }
    
    // Also clear the main session tokens
    const mainTokens = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url"
    ]
    
    mainTokens.forEach(tokenName => {
      response.cookies.delete(tokenName)
      
      const paths = ["/", "/auth", "/dashboard", "/api"]
      const domains = ["", "localhost", ".localhost"]
      
      paths.forEach(path => {
        domains.forEach(domain => {
          response.cookies.set(tokenName, "", { 
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
    
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')
    
    return response
  } catch (error) {
    console.error("Error clearing numbered tokens:", error)
    return NextResponse.json(
      { error: "Failed to clear numbered tokens" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
