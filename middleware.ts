import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check for chunked session tokens that cause 431 errors
  const cookies = request.cookies
  const hasChunkedTokens = Array.from(cookies.getAll()).some(cookie => 
    cookie.name.includes('next-auth.session-token.') && 
    /^\d+$/.test(cookie.name.split('.').pop() || '')
  )

  // If chunked tokens are detected, redirect to emergency clear
  if (hasChunkedTokens) {
    console.log("🚨 Chunked session tokens detected, redirecting to emergency clear")
    return NextResponse.redirect(new URL('/emergency-clear', request.url))
  }

  // Check header size more conservatively (8KB instead of 2KB)
  const headerSize = JSON.stringify(request.headers).length
  if (headerSize > 8192) { // 8KB threshold
    console.log(`🚨 Large headers detected (${headerSize} bytes), redirecting to emergency clear`)
    return NextResponse.redirect(new URL('/emergency-clear', request.url))
  }

  // Continue with normal request processing
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}


