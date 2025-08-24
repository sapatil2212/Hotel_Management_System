"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function PostLoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

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
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if we have a valid session
        if (status === "loading") {
          // Still loading, wait a bit more
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        if (status === "authenticated" && session?.user) {
          // Successfully authenticated, redirect to dashboard immediately
          router.push("/dashboard")
        } else if (status === "unauthenticated") {
          // Not authenticated, redirect to login
          router.push("/auth/sign-in")
        } else {
          // Something went wrong, redirect to login
          router.push("/auth/sign-in")
        }
      } catch (err) {
        console.error("Post-login error:", err)
        // On any error, redirect to login
        router.push("/auth/sign-in")
      }
    }

    processLogin()
  }, [session, status, router])

  // Show minimal loading while processing
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Processing...</p>
      </div>
    </div>
  )
}


