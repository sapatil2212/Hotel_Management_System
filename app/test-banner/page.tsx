"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickBanner } from "@/components/layout/quick-banner"
import { Navigation } from "@/components/layout/navigation"

export default function TestBannerPage() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Quick Banner Test</h1>
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowBanner(!showBanner)}
              variant="outline"
            >
              {showBanner ? "Hide Banner" : "Show Banner"}
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This page demonstrates the quick banner with contact details and promo offers from the backend.
          </p>
        </div>
      </div>

      {/* Banner and Navigation */}
      {showBanner && <QuickBanner />}
      <Navigation />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                The banner displays contact details from the hotel info section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Primary phone number</li>
                <li>• Reservation email</li>
                <li>• Hotel address</li>
                <li>• Responsive design for mobile</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Promo Offers</CardTitle>
              <CardDescription>
                The banner shows active promo codes from the backend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Auto-rotating offers</li>
                <li>• Manual navigation controls</li>
                <li>• Shows discount amount and title</li>
                <li>• Filters for active and valid codes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Key features of the quick banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Real-time data from backend APIs</li>
                <li>• Dismissible banner</li>
                <li>• Dark mode support</li>
                <li>• Loading states</li>
                <li>• Error handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Backend endpoints used by the banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• <code>/api/hotel-info</code> - Contact details</li>
                <li>• <code>/api/promo-codes/featured</code> - Active offers</li>
                <li>• Hotel context for global state</li>
                <li>• Automatic data refresh</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Instructions for implementing the banner in your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Import the Component</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm">
{`import { QuickBanner } from "@/components/layout/quick-banner"`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Add to Your Layout</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm">
{`<QuickBanner />
<Navigation />`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Ensure Hotel Context</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm">
{`import { HotelProvider } from "@/contexts/hotel-context"

<HotelProvider>
  {/* Your app content */}
</HotelProvider>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
