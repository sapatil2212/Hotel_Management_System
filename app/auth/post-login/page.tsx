"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader, CheckCircle, AlertTriangle } from "lucide-react"

export default function PostLoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processLogin = async () => {
      try {
        // Clear any existing corrupted cookies first
        document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "__Secure-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "__Secure-next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

        // Clear localStorage and sessionStorage
        localStorage.clear()
        sessionStorage.clear()

        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if we have a valid session
        if (status === "loading") {
          // Still loading, wait a bit more
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

        if (status === "authenticated" && session?.user) {
          // Successfully authenticated, redirect to dashboard
          router.push("/dashboard")
        } else if (status === "unauthenticated") {
          // Not authenticated, redirect to login
          router.push("/auth/sign-in")
        } else {
          // Something went wrong, show error
          setError("Authentication failed. Please try logging in again.")
        }
      } catch (err) {
        console.error("Post-login error:", err)
        setError("An error occurred during login processing.")
      } finally {
        setIsProcessing(false)
      }
    }

    processLogin()
  }, [session, status, router])

  const handleRetry = () => {
    setIsProcessing(true)
    setError(null)
    window.location.href = "/auth/sign-in"
  }

  const handleClearAndRetry = async () => {
    try {
      // Clear everything
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear all cookies
      const cookies = document.cookie.split(";")
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      }

      // Call server-side clear endpoint
      await fetch('/api/auth/clear-session', { method: 'POST' })
      
      // Redirect to login
      window.location.href = "/auth/sign-in"
    } catch (err) {
      console.error("Error clearing session:", err)
      window.location.href = "/auth/sign-in"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
            ) : error ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
          <CardTitle className="text-xl text-gray-900">
            {isProcessing ? "Processing Login..." : error ? "Login Error" : "Login Successful"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Please wait while we process your login...
              </p>
              <div className="flex justify-center">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-red-600 text-center">{error}</p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button onClick={handleClearAndRetry} variant="outline" className="w-full">
                  Clear Session & Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-600">
                Login successful! Redirecting to dashboard...
              </p>
              <div className="flex justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


