"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react"
import Link from "next/link"

export default function ErrorPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [isCleared, setIsCleared] = useState(false)

  const clearSession = async () => {
    setIsClearing(true)
    try {
      // Clear client-side storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cookies
      document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "__Secure-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "__Secure-next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      
      // Call server-side clear endpoint
      await fetch('/api/auth/clear-session', { method: 'POST' })
      
      setIsCleared(true)
      setTimeout(() => {
        window.location.href = '/auth/sign-in'
      }, 2000)
    } catch (error) {
      console.error('Error clearing session:', error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            {isCleared ? "Session Cleared!" : "Authentication Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCleared ? (
            <>
              <p className="text-gray-600 text-center">
                It looks like there's an issue with your session. This can happen when:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your session has expired</li>
                <li>• There are too many cookies stored</li>
                <li>• The authentication token is corrupted</li>
              </ul>
              <div className="space-y-3">
                <Button 
                  onClick={clearSession} 
                  disabled={isClearing}
                  className="w-full"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Clearing Session...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Session & Login Again
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/sign-in">
                    <LogIn className="h-4 w-4 mr-2" />
                    Go to Login
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-600">
                Your session has been cleared successfully! Redirecting to login...
              </p>
              <div className="flex justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

