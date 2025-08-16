"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CalendarCheck2, Percent, Clock, Users, Bed, Building, CreditCard, AlertTriangle, CheckCircle, Eye, Calendar, Home, Receipt } from "lucide-react"
import { Loader } from "@/components/ui/loader"

type Stat = {
  title: string
  value: string
  delta: string
  up?: boolean
  icon: React.ReactNode
  color: string
  description?: string
}

interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  occupancyRate: number
  averageStay: number
  totalGuests: number
  totalRooms: number
  availableRooms: number
  totalExpenses: number
  pendingCheckouts: number
  overdueCheckouts: number
  confirmedBookings: number
  checkedInBookings: number
  revenueChange: number
  bookingsChange: number
  occupancyChange: number
  expensesChange: number
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
    
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all required data in parallel with better error handling
      const promises = [
        fetch('/api/bookings').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/rooms').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/expenses').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/revenue/status').catch(() => ({ ok: false, json: () => ({ totalRevenue: 0, revenueChange: 0 }) }))
      ]

      const [bookingsResponse, roomsResponse, expensesResponse, revenueResponse] = await Promise.all(promises)

      // Handle responses with fallbacks
      const bookings = bookingsResponse.ok ? await bookingsResponse.json() : []
      const rooms = roomsResponse.ok ? await roomsResponse.json() : []
      const expenses = expensesResponse.ok ? await expensesResponse.json() : []
      const revenueData = revenueResponse.ok ? await revenueResponse.json() : { totalRevenue: 0, revenueChange: 0 }

      // Ensure expenses is always an array
      const expensesArray = Array.isArray(expenses) ? expenses : []

      // Calculate statistics with safe fallbacks
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      // Current period stats (last 30 days)
      const currentBookings = bookings.filter((b: any) => 
        new Date(b.createdAt) >= thirtyDaysAgo
      )
      const currentRevenue = currentBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)

      // Previous period stats (30-60 days ago)
      const previousBookings = bookings.filter((b: any) => {
        const createdAt = new Date(b.createdAt)
        return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo
      })
      const previousRevenue = previousBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)

      // Calculate changes with safe division
      const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
      const bookingsChange = previousBookings.length > 0 ? ((currentBookings.length - previousBookings.length) / previousBookings.length) * 100 : 0

      // Room statistics with safe fallbacks
      const totalRooms = rooms.length || 0
      
      // Debug: Log the actual room data structure
      console.log('Raw Room Data:', rooms)
      
      // Extract individual rooms from room types (the API returns room types with nested rooms)
      const individualRooms: any[] = []
      rooms.forEach((roomType: any) => {
        if (roomType.rooms && Array.isArray(roomType.rooms)) {
          individualRooms.push(...roomType.rooms)
        }
      })
      
      console.log('Individual Rooms:', individualRooms)
      
      // More comprehensive room status detection with detailed logging
      const availableRooms = individualRooms.filter((r: any) => {
        const status = r.status?.toLowerCase() || ''
        const isAvailable = status === 'available' || status === 'free' || status === 'vacant' || status === 'ready'
        console.log(`Room ${r.id || r.roomNumber}: status="${r.status}" (lowercase: "${status}") - Available: ${isAvailable}`)
        return isAvailable
      }).length || 0
      
      const occupiedRooms = individualRooms.filter((r: any) => {
        const status = r.status?.toLowerCase() || ''
        const isOccupied = status === 'occupied' || status === 'booked' || status === 'in-use'
        console.log(`Room ${r.id || r.roomNumber}: status="${r.status}" (lowercase: "${status}") - Occupied: ${isOccupied}`)
        return isOccupied
      }).length || 0
      
      const maintenanceRooms = individualRooms.filter((r: any) => {
        const status = r.status?.toLowerCase() || ''
        const isMaintenance = status === 'maintenance' || status === 'repair' || status === 'out-of-service'
        console.log(`Room ${r.id || r.roomNumber}: status="${r.status}" (lowercase: "${status}") - Maintenance: ${isMaintenance}`)
        return isMaintenance
      }).length || 0
      
      // If no rooms match our expected statuses, assume all rooms are available by default
      const totalMatchedRooms = availableRooms + occupiedRooms + maintenanceRooms
      const fallbackAvailableRooms = totalMatchedRooms === 0 ? individualRooms.length : availableRooms
      
      // Calculate occupancy rate based on occupied rooms
      const occupancyRate = individualRooms.length > 0 ? (occupiedRooms / individualRooms.length) * 100 : 0
      
      // Debug logging
      console.log('Room Statistics:', {
        totalRoomTypes: totalRooms,
        totalIndividualRooms: individualRooms.length,
        availableRooms: fallbackAvailableRooms,
        occupiedRooms,
        maintenanceRooms,
        occupancyRate,
        totalMatchedRooms,
        fallbackApplied: totalMatchedRooms === 0,
        roomStatuses: individualRooms.map((r: any) => ({ 
          id: r.id, 
          roomNumber: r.roomNumber,
          status: r.status,
          statusLower: r.status?.toLowerCase() || ''
        }))
      })

      // Booking status counts with safe fallbacks
      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed').length || 0
      const checkedInBookings = bookings.filter((b: any) => b.status === 'checked_in').length || 0
      const pendingCheckouts = bookings.filter((b: any) => {
        if (b.status !== 'checked_in') return false
        const checkoutDate = new Date(b.checkOut)
        const today = new Date()
        return checkoutDate.toDateString() === today.toDateString()
      }).length || 0

      const overdueCheckouts = bookings.filter((b: any) => {
        if (b.status !== 'checked_in') return false
        const checkoutDate = new Date(b.checkOut)
        const today = new Date()
        return checkoutDate < today
      }).length || 0

      // Guest statistics with safe fallbacks
      const totalGuests = bookings.reduce((sum: number, b: any) => sum + (b.adults || 0) + (b.children || 0), 0)

      // Average stay calculation with safe fallbacks
      const totalNights = bookings.reduce((sum: number, b: any) => sum + (b.nights || 0), 0)
      const averageStay = bookings.length > 0 ? totalNights / bookings.length : 0

      // Expense statistics with safe fallbacks
      const totalExpenses = expensesArray.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      const currentExpenses = expensesArray.filter((e: any) => 
        new Date(e.createdAt) >= thirtyDaysAgo
      ).reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      const previousExpenses = expensesArray.filter((e: any) => {
        const createdAt = new Date(e.createdAt)
        return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo
      }).reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      const expensesChange = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0

      // Occupancy change calculation with safe fallbacks
      const currentOccupancy = currentBookings.length > 0 && individualRooms.length > 0 ? 
        currentBookings.reduce((sum: number, b: any) => sum + (b.nights || 0), 0) / (individualRooms.length * 30) * 100 : 0
      const previousOccupancy = previousBookings.length > 0 && individualRooms.length > 0 ? 
        previousBookings.reduce((sum: number, b: any) => sum + (b.nights || 0), 0) / (individualRooms.length * 30) * 100 : 0
      const occupancyChange = previousOccupancy > 0 ? ((currentOccupancy - previousOccupancy) / previousOccupancy) * 100 : 0

      // Format currency
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)
      }

      // Create stats array with safe fallbacks
      const newStats: Stat[] = [
        {
          title: "Total Revenue (30d)",
          value: formatCurrency(currentRevenue),
          delta: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
          up: revenueChange >= 0,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600",
          description: `${currentBookings.length} bookings this month`
        },
        {
          title: "Total Bookings",
          value: bookings.length.toString(),
          delta: `${bookingsChange >= 0 ? '+' : ''}${bookingsChange.toFixed(1)}%`,
          up: bookingsChange >= 0,
          icon: <CalendarCheck2 className="h-4 w-4" />,
          color: "text-blue-600",
          description: `${confirmedBookings} confirmed, ${checkedInBookings} checked in`
        },
        {
          title: "Occupancy Rate",
          value: `${occupancyRate.toFixed(1)}%`,
          delta: `${occupancyChange >= 0 ? '+' : ''}${occupancyChange.toFixed(1)}%`,
          up: occupancyChange >= 0,
          icon: <Percent className="h-4 w-4" />,
          color: "text-purple-600",
          description: `${occupiedRooms}/${individualRooms.length} rooms occupied`
        },
        {
          title: "Available Rooms",
          value: fallbackAvailableRooms.toString(),
          delta: `${individualRooms.length} total`,
          up: true,
          icon: <Bed className="h-4 w-4" />,
          color: "text-teal-600",
          description: `${occupiedRooms} currently occupied, ${maintenanceRooms} in maintenance`
        },
        {
          title: "Total Expenses",
          value: formatCurrency(totalExpenses),
          delta: `${expensesChange >= 0 ? '+' : ''}${expensesChange.toFixed(1)}%`,
          up: expensesChange <= 0, // Lower expenses is better
          icon: <CreditCard className="h-4 w-4" />,
          color: "text-red-600",
          description: `${expensesArray.length} expense entries`
        }
      ]

      setStats(newStats)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      // Don't set error if we have some data, just log it
      if (stats.length === 0) {
        setError('Failed to load dashboard statistics')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-1 px-3 pt-3">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-3">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-full">
          <CardContent className="text-center py-4">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-500" />
            <p className="text-red-600 text-xs">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              {stat.icon}
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <div className="flex items-end justify-between">
              <div className="text-base font-bold">{stat.value}</div>
              <div className={stat.up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                <div className="flex items-center gap-1 text-xs">
                  {stat.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {stat.delta}
                </div>
              </div>
            </div>
            {stat.description && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {stat.description}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}



