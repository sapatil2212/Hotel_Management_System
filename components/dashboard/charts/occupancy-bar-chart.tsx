"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Loader } from "lucide-react"

interface RoomData {
  roomType: string
  total: number
  occupied: number
  available: number
  maintenance: number
  occupancyRate: number
}

export default function OccupancyBarChart() {
  const [data, setData] = useState<RoomData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOccupancyData()
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchOccupancyData, 120000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchOccupancyData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/rooms').catch(() => ({ ok: false, json: () => [] }))
      const rooms = response.ok ? await response.json() : []

      console.log('Raw Room Data for Occupancy Chart:', rooms)

      // Extract individual rooms from room types (the API returns room types with nested rooms)
      const individualRooms: any[] = []
      rooms.forEach((roomType: any) => {
        if (roomType.rooms && Array.isArray(roomType.rooms)) {
          individualRooms.push(...roomType.rooms.map((room: any) => ({
            ...room,
            roomTypeName: roomType.name || 'Unknown'
          })))
        }
      })

      console.log('Individual Rooms for Occupancy Chart:', individualRooms)

      // Group rooms by room type and calculate occupancy
      const roomTypeMap = new Map<string, RoomData>()

      individualRooms.forEach((room: any) => {
        const roomTypeName = room.roomTypeName || 'Unknown'
        
        if (!roomTypeMap.has(roomTypeName)) {
          roomTypeMap.set(roomTypeName, {
            roomType: roomTypeName,
            total: 0,
            occupied: 0,
            available: 0,
            maintenance: 0,
            occupancyRate: 0
          })
        }

        const roomTypeData = roomTypeMap.get(roomTypeName)!
        roomTypeData.total++

        // More comprehensive status detection
        const status = room.status?.toLowerCase() || ''
        console.log(`Room ${room.id || room.roomNumber}: status="${room.status}" (lowercase: "${status}")`)

        if (status === 'occupied' || status === 'booked' || status === 'in-use') {
          roomTypeData.occupied++
        } else if (status === 'maintenance' || status === 'repair' || status === 'out-of-service') {
          roomTypeData.maintenance++
        } else if (status === 'available' || status === 'free' || status === 'vacant' || status === 'ready') {
          roomTypeData.available++
        } else {
          // Default to available for unknown statuses
          console.log(`Unknown status "${room.status}" for room ${room.id || room.roomNumber}, defaulting to available`)
          roomTypeData.available++
        }
      })

      // Calculate occupancy rates and convert to array
      const chartData: RoomData[] = Array.from(roomTypeMap.values()).map(roomType => ({
        ...roomType,
        occupancyRate: roomType.total > 0 ? (roomType.occupied / roomType.total) * 100 : 0
      }))

      // Sort by occupancy rate (highest first)
      chartData.sort((a, b) => b.occupancyRate - a.occupancyRate)

      console.log('Processed Chart Data:', chartData)

      // If no data, provide sample data for testing
      if (chartData.length === 0) {
        const sampleData: RoomData[] = [
          { roomType: "Deluxe Room", total: 10, occupied: 8, available: 2, maintenance: 0, occupancyRate: 80 },
          { roomType: "Suite", total: 5, occupied: 4, available: 1, maintenance: 0, occupancyRate: 80 },
          { roomType: "Standard Room", total: 15, occupied: 10, available: 4, maintenance: 1, occupancyRate: 66.7 },
          { roomType: "Family Room", total: 8, occupied: 5, available: 3, maintenance: 0, occupancyRate: 62.5 },
        ]
        setData(sampleData)
      } else {
        setData(chartData)
      }
    } catch (err) {
      console.error('Error fetching occupancy data:', err)
      setError('Failed to load occupancy data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Room Occupancy by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Room Occupancy by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <div className="text-center">
              <p className="mb-2 text-xs sm:text-sm">{error}</p>
              <button 
                onClick={fetchOccupancyData}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate summary statistics
  const totalRooms = data.reduce((sum, item) => sum + item.total, 0)
  const totalOccupied = data.reduce((sum, item) => sum + item.occupied, 0)
  const totalAvailable = data.reduce((sum, item) => sum + item.available, 0)
  const totalMaintenance = data.reduce((sum, item) => sum + item.maintenance, 0)
  const overallOccupancyRate = totalRooms > 0 ? (totalOccupied / totalRooms) * 100 : 0

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base">Room Occupancy by Type</CardTitle>
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600 text-xs sm:text-sm">{totalAvailable}</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs">Available</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600 text-xs sm:text-sm">{totalOccupied}</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs">Occupied</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600 text-xs sm:text-sm">{overallOccupancyRate.toFixed(1)}%</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs">Occupancy</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4 text-[9px] sm:text-xs text-muted-foreground">
          <div>Total Rooms: {totalRooms}</div>
          <div>Maintenance: {totalMaintenance}</div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          available: { label: "Available", theme: { light: "#10b981", dark: "#10b981" } },
          occupied: { label: "Occupied", theme: { light: "#ef4444", dark: "#ef4444" } },
          maintenance: { label: "Maintenance", theme: { light: "#f59e0b", dark: "#f59e0b" } }
        }} className="aspect-[16/6]">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="roomType" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 8 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 8 }}
              width={30}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
            <Bar 
              dataKey="available" 
              stackId="a" 
              fill="var(--color-available)" 
              name="Available"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="occupied" 
              stackId="a" 
              fill="var(--color-occupied)" 
              name="Occupied"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="maintenance" 
              stackId="a" 
              fill="var(--color-maintenance)" 
              name="Maintenance"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        
        {/* Occupancy Rate Chart */}
        <div className="mt-4">
          <h4 className="text-[10px] sm:text-xs font-medium mb-2 text-gray-700">Occupancy Rates</h4>
          <div className="space-y-1.5">
            {data.map((roomType, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-[9px] sm:text-xs text-gray-600">{roomType.roomType}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 sm:w-20 bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(roomType.occupancyRate, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] sm:text-xs font-medium text-gray-900 w-8 sm:w-10 text-right">
                    {roomType.occupancyRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


