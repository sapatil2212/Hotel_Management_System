"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, Database, RefreshCw, Plus } from "lucide-react"

export default function DebugRoomTypesPage() {
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState<any>(null)
  const [roomTypesData, setRoomTypesData] = useState<any>(null)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSystem()
  }, [])

  const checkSystem = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check health
      const healthResponse = await fetch('/api/health')
      const health = await healthResponse.json()
      setHealthData(health)

      // Check room types
      const roomTypesResponse = await fetch('/api/room-types/available')
      const roomTypes = await roomTypesResponse.json()
      setRoomTypesData(roomTypes)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const seedRoomTypes = async () => {
    setSeeding(true)
    try {
      const response = await fetch('/api/debug/seed-room-types', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        alert('Room types seeded successfully!')
        checkSystem() // Refresh data
      } else {
        alert(`Seeding failed: ${result.message}`)
      }
    } catch (err) {
      alert(`Error seeding: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking system status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Types Debug</h1>
          <p className="text-muted-foreground">Diagnose and fix room types issues</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkSystem} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={seedRoomTypes} disabled={seeding}>
            {seeding ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {seeding ? 'Seeding...' : 'Seed Room Types'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Health
            </CardTitle>
            <CardDescription>System connectivity and status</CardDescription>
          </CardHeader>
          <CardContent>
            {healthData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={healthData.success ? 'text-green-600' : 'text-red-600'}>
                    {healthData.success ? 'Healthy' : 'Unhealthy'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Types Count:</span>
                  <span>{healthData.roomTypesCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sample Room Types:</span>
                  <span>{healthData.sampleRoomTypes?.length || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-600">Failed to get health data</p>
            )}
          </CardContent>
        </Card>

        {/* Room Types Status */}
        <Card>
          <CardHeader>
            <CardTitle>Room Types Available</CardTitle>
            <CardDescription>Current room types in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {roomTypesData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Success:</span>
                  <span className={roomTypesData.success ? 'text-green-600' : 'text-red-600'}>
                    {roomTypesData.success ? 'Yes' : 'No'}
                  </span>
                </div>
                {roomTypesData.success && roomTypesData.data ? (
                  <>
                    <div className="flex justify-between">
                      <span>Room Types Found:</span>
                      <span>{roomTypesData.data.length}</span>
                    </div>
                    {roomTypesData.data.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Available Room Types:</p>
                        <ul className="space-y-1 text-sm">
                          {roomTypesData.data.map((rt: any) => (
                            <li key={rt.id} className="flex justify-between">
                              <span>{rt.name}</span>
                              <span className="text-muted-foreground">
                                {rt.currentRoomsCount}/{rt.totalRooms} rooms
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-red-600">
                    <p>Error: {roomTypesData.error || 'Unknown error'}</p>
                    {roomTypesData.details && (
                      <p className="text-sm mt-1">Details: {roomTypesData.details}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-600">Failed to get room types data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Steps to resolve issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(!healthData?.success || healthData?.roomTypesCount === 0) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">No Room Types Found</h4>
                <p className="text-yellow-700 mb-3">
                  The database appears to be empty or room types haven't been created yet.
                </p>
                <div className="space-y-2 text-sm text-yellow-600">
                  <p>• Click "Seed Room Types" to create sample room types</p>
                  <p>• Or manually create room types through the Rooms page</p>
                  <p>• Check if the database migrations have been run</p>
                </div>
              </div>
            )}

            {healthData?.success && healthData?.roomTypesCount > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">System Healthy</h4>
                <p className="text-green-700">
                  Room types are available in the database. The issue might be with the API endpoint or frontend.
                </p>
              </div>
            )}

            {roomTypesData && !roomTypesData.success && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">API Error</h4>
                <p className="text-red-700 mb-3">
                  The room types API is returning an error.
                </p>
                <div className="space-y-2 text-sm text-red-600">
                  <p>• Check the API endpoint logs</p>
                  <p>• Verify database connection</p>
                  <p>• Check for any recent code changes</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
