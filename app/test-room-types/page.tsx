"use client"

import { useState, useEffect } from "react"

export default function TestRoomTypesPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testAPIs()
  }, [])

  const testAPIs = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test health endpoint
      console.log('Testing health endpoint...')
      const healthResponse = await fetch('/api/health')
      const healthData = await healthResponse.json()
      console.log('Health response:', healthData)

      // Test room types available endpoint
      console.log('Testing room types available endpoint...')
      const roomTypesResponse = await fetch('/api/room-types/available')
      const roomTypesData = await roomTypesResponse.json()
      console.log('Room types response:', roomTypesData)

      // Test main room types endpoint
      console.log('Testing main room types endpoint...')
      const mainRoomTypesResponse = await fetch('/api/room-types')
      const mainRoomTypesData = await mainRoomTypesResponse.json()
      console.log('Main room types response:', mainRoomTypesData)

      setData({
        health: healthData,
        roomTypesAvailable: roomTypesData,
        mainRoomTypes: mainRoomTypesData
      })
    } catch (err) {
      console.error('Test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Room Types API</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Room Types API</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={testAPIs}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Testing Room Types API</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Health Check</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.health, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Room Types Available</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.roomTypesAvailable, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Main Room Types</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.mainRoomTypes, null, 2)}
          </pre>
        </div>

        <button 
          onClick={testAPIs}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
