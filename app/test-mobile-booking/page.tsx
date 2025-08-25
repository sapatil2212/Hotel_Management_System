"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container } from "@/components/ui/container"

// Extend Navigator interface for connection property
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

interface DeviceInfo {
  userAgent: string;
  isMobile: boolean;
  connectionInfo: string;
  screenSize: string;
  viewportSize: string;
}

export default function TestMobileBookingPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    
    // Get device information only on client side
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      
      // Safe access to navigator.connection
      const nav = navigator as NavigatorWithConnection
      const connectionInfo = nav.connection ? 
        `${nav.connection.effectiveType || 'Unknown'} (${nav.connection.downlink || 'Unknown'}Mbps)` : 
        'Not supported'
      
      setDeviceInfo({
        userAgent: ua,
        isMobile: mobile,
        connectionInfo,
        screenSize: `${window.screen.width} x ${window.screen.height}`,
        viewportSize: `${window.innerWidth} x ${window.innerHeight}`
      })
    }
  }, [])

  const testAuthenticationStatus = async () => {
    if (!isClient) return
    
    setLoading(true)
    setTestResult("")
    
    try {
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      
      setTestResult(`
🔐 AUTHENTICATION STATUS:
Response Status: ${response.status}
Session Data: ${JSON.stringify(sessionData, null, 2)}

📋 ANALYSIS:
${sessionData.user ? 
  `✅ User is authenticated
   Email: ${sessionData.user.email}
   Name: ${sessionData.user.name || 'Not provided'}
   Booking API calls should work properly.` :
  `❌ User is NOT authenticated
   This explains the 401 Unauthorized error from the booking API.
   You need to log in before making bookings.`
}

💡 SOLUTION:
${sessionData.user ? 
  'You are logged in. Try the booking test again or proceed with actual booking.' :
  'Please log in to the application before testing the booking API.'
}
      `)
      
    } catch (error) {
      setTestResult(`Authentication Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testBookingAPI = async () => {
    if (!isClient) return
    
    setLoading(true)
    setTestResult("")
    
    try {
      // Get user agent info
      const ua = navigator.userAgent
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      
      const testData = {
        roomTypeId: "test-room-id",
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nights: 1,
        adults: 1,
        children: 0,
        numberOfRooms: 1,
        totalAmount: 1000,
        originalAmount: 1000,
        discountAmount: 0,
        promoCodeId: null,
        guestName: "Test User",
        guestEmail: "test@example.com",
        guestPhone: "+1234567890",
        specialRequests: "Test booking"
      }
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-User-Agent': ua
        },
        body: JSON.stringify(testData)
      })
      
      const result = await response.text()
      
      let resultMessage = `
User Agent: ${ua}
Is Mobile: ${mobile}
Response Status: ${response.status}
Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}
Response Body: ${result}
      `
      
      // Add specific guidance for 401 error
      if (response.status === 401) {
        resultMessage += `

🔍 ANALYSIS:
The 401 Unauthorized error indicates that the user is not authenticated.
This is expected behavior for the booking API which requires user login.

📋 NEXT STEPS:
1. Make sure you are logged in to the application
2. Try booking through the actual booking form instead of this test
3. Check if your session is still valid
4. If the issue persists, try logging out and logging back in

💡 NOTE:
This test page is for debugging purposes only. Real bookings should be made through the proper booking flow with user authentication.
       `
       } else if (response.status === 201) {
         resultMessage += `

✅ SUCCESS:
Booking created successfully! Guest bookings are now allowed without authentication.

📋 BOOKING DETAILS:
- Booking ID: ${JSON.parse(result).id}
- Room: ${JSON.parse(result).room?.roomNumber || 'N/A'}
- Guest: ${JSON.parse(result).guestName}
- Status: ${JSON.parse(result).status}

💡 NOTE:
The booking API now supports guest bookings without requiring user authentication.
       `
       }
      
      setTestResult(resultMessage)
      
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testNetworkConnectivity = async () => {
    if (!isClient) return
    
    setLoading(true)
    setTestResult("")
    
    try {
      const startTime = Date.now()
      const response = await fetch('/api/health')
      const endTime = Date.now()
      
      const result = await response.text()
      
      // Safe access to navigator.connection
      const nav = navigator as NavigatorWithConnection
      const connectionInfo = nav.connection ? {
        effectiveType: nav.connection.effectiveType || 'Unknown',
        downlink: nav.connection.downlink || 'Unknown',
        rtt: nav.connection.rtt || 'Unknown'
      } : null
      
      setTestResult(`
Network Test Results:
Response Time: ${endTime - startTime}ms
Status: ${response.status}
Response: ${result}
User Agent: ${navigator.userAgent}
Connection: ${connectionInfo ? `${connectionInfo.effectiveType} (${connectionInfo.downlink}Mbps, ${connectionInfo.rtt}ms RTT)` : 'Not supported'}
      `)
      
    } catch (error) {
      setTestResult(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while client-side code initializes
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p>Loading device information...</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Mobile Booking Test</h1>
            <p className="text-gray-600">Test mobile booking functionality and debug issues</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>User Agent</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                    {deviceInfo?.userAgent || 'Loading...'}
                  </div>
                </div>
                
                <div>
                  <Label>Is Mobile</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {deviceInfo ? (deviceInfo.isMobile ? 'Yes' : 'No') : 'Loading...'}
                  </div>
                </div>
                
                <div>
                  <Label>Connection Type</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {deviceInfo?.connectionInfo || 'Loading...'}
                  </div>
                </div>
                
                <div>
                  <Label>Screen Size</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {deviceInfo?.screenSize || 'Loading...'}
                  </div>
                </div>
                
                <div>
                  <Label>Viewport Size</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {deviceInfo?.viewportSize || 'Loading...'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={testNetworkConnectivity}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Testing...' : 'Test Network Connectivity'}
                </Button>
                
                <Button 
                  onClick={testAuthenticationStatus}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Testing...' : 'Test Authentication Status'}
                </Button>
                
                <Button 
                  onClick={testBookingAPI}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Testing...' : 'Test Booking API'}
                </Button>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-3">
                    💡 <strong>Note:</strong> The booking API now supports guest bookings without authentication. 
                    Both authenticated users and guest users can make bookings.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/auth/sign-in'}
                    className="w-full"
                    variant="secondary"
                  >
                    🔐 Go to Login Page (Optional)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {testResult}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </div>
  )
}
