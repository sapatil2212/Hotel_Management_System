"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container } from "@/components/ui/container"

export default function TestMobileBookingPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [userAgent, setUserAgent] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  const testBookingAPI = async () => {
    setLoading(true)
    setTestResult("")
    
    try {
      // Get user agent info
      const ua = navigator.userAgent
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      
      setUserAgent(ua)
      setIsMobile(mobile)
      
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
      
      setTestResult(`
User Agent: ${ua}
Is Mobile: ${mobile}
Response Status: ${response.status}
Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}
Response Body: ${result}
      `)
      
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testNetworkConnectivity = async () => {
    setLoading(true)
    setTestResult("")
    
    try {
      const startTime = Date.now()
      const response = await fetch('/api/health')
      const endTime = Date.now()
      
      const result = await response.text()
      
      setTestResult(`
Network Test Results:
Response Time: ${endTime - startTime}ms
Status: ${response.status}
Response: ${result}
User Agent: ${navigator.userAgent}
Connection: ${navigator.connection ? navigator.connection.effectiveType : 'Unknown'}
      `)
      
    } catch (error) {
      setTestResult(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
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
                    {navigator.userAgent}
                  </div>
                </div>
                
                <div>
                  <Label>Is Mobile</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}
                  </div>
                </div>
                
                <div>
                  <Label>Connection Type</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {navigator.connection ? navigator.connection.effectiveType : 'Unknown'}
                  </div>
                </div>
                
                <div>
                  <Label>Screen Size</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {window.screen.width} x {window.screen.height}
                  </div>
                </div>
                
                <div>
                  <Label>Viewport Size</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {window.innerWidth} x {window.innerHeight}
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
                  onClick={testBookingAPI}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Testing...' : 'Test Booking API'}
                </Button>
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
