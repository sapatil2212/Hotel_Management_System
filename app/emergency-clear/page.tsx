"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Loader } from "lucide-react"

export default function EmergencyClearPage() {
  const [isClearing, setIsClearing] = useState(true)
  const [status, setStatus] = useState<string>("Clearing session data...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const emergencyClear = async () => {
      try {
        setStatus("Clearing client-side storage...")
        
        // Clear all client-side storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear all cookies aggressively including numbered ones
        const cookies = document.cookie.split(";")
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          
          // Clear with multiple path variations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`
        })
        
        // Clear numbered session tokens specifically
        for (let i = 0; i < 100; i++) {
          const sessionTokenName = `next-auth.session-token.${i}`
          const secureSessionTokenName = `__Secure-next-auth.session-token.${i}`
          
          document.cookie = `${sessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          document.cookie = `${sessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth`
          document.cookie = `${sessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`
          document.cookie = `${sessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`
          
          document.cookie = `${secureSessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          document.cookie = `${secureSessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth`
          document.cookie = `${secureSessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`
          document.cookie = `${secureSessionTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`
        }
        
        setStatus("Calling numbered token clear API...")
        
        // First try the numbered token clear API
        try {
          const numberedResponse = await fetch('/api/auth/clear-numbered-tokens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (numberedResponse.ok) {
            setStatus("Numbered tokens cleared, calling session clear...")
          }
        } catch (err) {
          console.warn("Numbered token clear failed, trying session clear:", err)
        }
        
        // Then try the simple session clear
        try {
          const sessionResponse = await fetch('/api/auth/clear-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (sessionResponse.ok) {
            setStatus("Session cleared, calling force clear...")
          }
        } catch (err) {
          console.warn("Session clear failed, trying force clear:", err)
        }
        
        // Then call the force clear API as backup
        const response = await fetch('/api/auth/force-clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Server clear failed')
        }
        
        setStatus("Session cleared successfully!")
        
        // Wait a moment then redirect
        setTimeout(() => {
          window.location.href = '/auth/sign-in'
        }, 2000)
        
      } catch (err) {
        console.error('Emergency clear error:', err)
        setError('Failed to clear session data. Please try manual browser clear.')
        setIsClearing(false)
      }
    }

    emergencyClear()
  }, [])

  const handleManualRedirect = () => {
    window.location.href = '/auth/sign-in'
  }

  const handleForceReload = () => {
    window.location.reload()
  }

  const handleManualClear = async () => {
    try {
      setStatus("Attempting manual clear...")
      await fetch('/api/auth/clear-numbered-tokens', { method: 'POST' })
      setStatus("Manual clear completed!")
      setTimeout(() => {
        window.location.href = '/auth/sign-in'
      }, 1000)
    } catch (err) {
      setError('Manual clear also failed. Please clear browser data manually.')
    }
  }

  const handleConsoleClear = () => {
    // Copy the console script to clipboard
    const script = `
// Emergency clear for numbered tokens
for (let i = 0; i < 100; i++) {
  const tokenName = \`next-auth.session-token.\${i}\`;
  const secureTokenName = \`__Secure-next-auth.session-token.\${i}\`;
  
  document.cookie = \`\${tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
  document.cookie = \`\${secureTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
}

// Clear main tokens
['next-auth.session-token', '__Secure-next-auth.session-token', 'next-auth.csrf-token', '__Secure-next-auth.csrf-token'].forEach(name => {
  document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
});

localStorage.clear();
sessionStorage.clear();
console.log('Numbered tokens cleared!');
location.reload();
`
    
    navigator.clipboard.writeText(script).then(() => {
      alert('Console script copied to clipboard! Open browser console (F12) and paste it.')
    }).catch(() => {
      alert('Please copy this script manually and run it in browser console:\n\n' + script)
    })
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            {isClearing ? (
              <Loader className="h-6 w-6 animate-spin text-red-600" />
            ) : error ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
          <CardTitle className="text-xl text-gray-900">
            {isClearing ? "Emergency Session Clear" : error ? "Clear Failed" : "Clear Successful"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{status}</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {!isClearing && !error && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-600 text-sm">
                  All session data has been cleared. Redirecting to login...
                </p>
              </div>
            )}
          </div>
          
          {!isClearing && (
            <div className="space-y-3">
              <Button onClick={handleManualClear} className="w-full">
                Try Manual Clear
              </Button>
              <Button onClick={handleConsoleClear} className="w-full" variant="outline">
                Copy Console Script
              </Button>
              <Button onClick={handleManualRedirect} className="w-full">
                Go to Login Page
              </Button>
              <Button onClick={handleForceReload} variant="outline" className="w-full">
                Force Reload Page
              </Button>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <p>This page will automatically redirect you to the login page.</p>
            <p>If you continue to have issues, please clear your browser data manually.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

