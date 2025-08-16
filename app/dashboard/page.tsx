"use client"

import { useState, useEffect } from "react"
import { Loader, RefreshCw, TrendingUp, Users, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign, Bed, Activity } from "lucide-react"
import StatsCards from "@/components/dashboard/stats-cards"
import RevenueAreaChart from "@/components/dashboard/charts/revenue-area-chart"
import OccupancyBarChart from "@/components/dashboard/charts/occupancy-bar-chart"
import SourcePieChart from "@/components/dashboard/charts/source-pie-chart"
import BookingsTable from "@/components/dashboard/bookings-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHotel } from "@/contexts/hotel-context"
import { useSession } from "next-auth/react"

interface RecentActivity {
  id: string
  type: 'booking' | 'checkin' | 'checkout' | 'payment' | 'alert'
  message: string
  timestamp: string
  status?: string
}

interface QuickStats {
  todayBookings: number
  todayRevenue: number
  pendingCheckouts: number
  overdueCheckouts: number
  lowOccupancyRooms: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todayBookings: 0,
    todayRevenue: 0,
    pendingCheckouts: 0,
    overdueCheckouts: 0,
    lowOccupancyRooms: 0
  })
  const { hotelInfo } = useHotel()
  const { data: session } = useSession()

  useEffect(() => {
    initializeDashboard()
    
    // Refresh dashboard every 2 minutes
    const interval = setInterval(initializeDashboard, 120000)
    
    return () => clearInterval(interval)
  }, [])

  const initializeDashboard = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchRecentActivity(),
        fetchQuickStats()
      ])
    } catch (error) {
      console.error('Error initializing dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await initializeDashboard()
    } finally {
      setRefreshing(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const [bookingsResponse, roomsResponse] = await Promise.all([
        fetch('/api/bookings').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/rooms').catch(() => ({ ok: false, json: () => [] }))
      ])

      const bookings = bookingsResponse.ok ? await bookingsResponse.json() : []
      const rooms = roomsResponse.ok ? await roomsResponse.json() : []

      const activities: RecentActivity[] = []

      // Process recent bookings
      const recentBookings = bookings
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      recentBookings.forEach((booking: any) => {
        activities.push({
          id: booking.id,
          type: 'booking',
          message: `New booking from ${booking.guestName} for ${booking.room?.roomNumber || 'Unknown Room'}`,
          timestamp: booking.createdAt,
          status: booking.status
        })
      })

      // Add checkout alerts
      const today = new Date()
      const checkoutAlerts = bookings.filter((booking: any) => {
        if (booking.status !== 'checked_in') return false
        const checkoutDate = new Date(booking.checkOut)
        return checkoutDate.toDateString() === today.toDateString()
      })

      checkoutAlerts.forEach((booking: any) => {
        activities.push({
          id: `checkout-${booking.id}`,
          type: 'alert',
          message: `${booking.guestName} due for checkout from ${booking.room?.roomNumber || 'Unknown Room'}`,
          timestamp: new Date().toISOString(),
          status: 'pending'
        })
      })

      // Sort by timestamp and take top 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 10))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      setRecentActivity([])
    }
  }

  const fetchQuickStats = async () => {
    try {
      const [bookingsResponse, roomsResponse] = await Promise.all([
        fetch('/api/bookings').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/rooms').catch(() => ({ ok: false, json: () => [] }))
      ])

      const bookings = bookingsResponse.ok ? await bookingsResponse.json() : []
      const rooms = roomsResponse.ok ? await roomsResponse.json() : []

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      // Today's bookings
      const todayBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0]
        return bookingDate === todayStr
      })

      const todayRevenue = todayBookings.reduce((sum: number, booking: any) => sum + (booking.totalAmount || 0), 0)

      // Checkout alerts
      const pendingCheckouts = bookings.filter((booking: any) => {
        if (booking.status !== 'checked_in') return false
        const checkoutDate = new Date(booking.checkOut)
        return checkoutDate.toDateString() === today.toDateString()
      }).length

      const overdueCheckouts = bookings.filter((booking: any) => {
        if (booking.status !== 'checked_in') return false
        const checkoutDate = new Date(booking.checkOut)
        return checkoutDate < today
      }).length

      // Low occupancy rooms (less than 30% occupancy)
      const totalRooms = rooms.length || 0
      const occupiedRooms = rooms.filter((room: any) => room.status === 'occupied').length || 0
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
      const lowOccupancyRooms = occupancyRate < 30 ? 1 : 0

      setQuickStats({
        todayBookings: todayBookings.length,
        todayRevenue,
        pendingCheckouts,
        overdueCheckouts,
        lowOccupancyRooms
      })
    } catch (error) {
      console.error('Error fetching quick stats:', error)
      setQuickStats({
        todayBookings: 0,
        todayRevenue: 0,
        pendingCheckouts: 0,
        overdueCheckouts: 0,
        lowOccupancyRooms: 0
      })
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'checkin':
        return <Users className="h-4 w-4 text-green-600" />
      case 'checkout':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'checked_in':
        return 'bg-blue-100 text-blue-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi 👋{session?.user?.name || 'User'}!</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Welcome back! Here's what's happening at {hotelInfo.name || 'Check-Mate'} today.
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Today's Bookings</p>
                <p className="text-lg font-bold text-blue-900">{quickStats.todayBookings}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Today's Revenue</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(quickStats.todayRevenue)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Pending Checkouts</p>
                <p className="text-lg font-bold text-orange-900">{quickStats.pendingCheckouts}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">Overdue Checkouts</p>
                <p className="text-lg font-bold text-red-900">{quickStats.overdueCheckouts}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Cards */}
      <StatsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 space-y-3">
          <RevenueAreaChart />
          <OccupancyBarChart />
        </div>
        <div className="xl:col-span-1 space-y-3">
          <SourcePieChart />
          
          {/* Recent Activity */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 font-medium">{activity.message}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                          {activity.status && (
                            <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                              {activity.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/bookings">View All Bookings</a>
          </Button>
        </div>
        <BookingsTable />
      </div>
    </div>
  )
}


