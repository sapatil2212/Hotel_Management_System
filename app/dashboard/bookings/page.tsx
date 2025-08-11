"use client"

import { useEffect, useState } from "react"
import BookingsTable from "@/components/dashboard/bookings-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Users, DollarSign, TrendingUp } from "lucide-react"

interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  totalRevenue: number
  todayCheckIns: number
  todayCheckOuts: number
}

export default function DashboardBookingsPage() {
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookingStats()
  }, [])

  const fetchBookingStats = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const bookings = await response.json()
        
        const today = new Date().toDateString()
        
        const stats: BookingStats = {
          totalBookings: bookings.length,
          confirmedBookings: bookings.filter((b: any) => b.status === 'confirmed').length,
          pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
          totalRevenue: bookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0),
          todayCheckIns: bookings.filter((b: any) => new Date(b.checkIn).toDateString() === today).length,
          todayCheckOuts: bookings.filter((b: any) => new Date(b.checkOut).toDateString() === today).length
        }
        
        setStats(stats)
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings Management</h1>
          <p className="text-muted-foreground">
            Manage hotel bookings, view guest information, and track reservations
          </p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedBookings} confirmed, {stats.pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.todayCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              Guests arriving today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.todayCheckOuts}</div>
            <p className="text-xs text-muted-foreground">
              Guests departing today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <BookingsTable />
    </div>
  )
}


