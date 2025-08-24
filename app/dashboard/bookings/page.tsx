"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import BookingsTable from "@/components/dashboard/bookings-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Users, DollarSign, TrendingUp, Loader } from "lucide-react"
import NewBookingModal from "@/components/dashboard/new-booking-modal"

interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  totalRevenue: number
  todayCheckIns: number
  todayCheckOuts: number
}

export default function DashboardBookingsPage() {
  const searchParams = useSearchParams()
  const editBookingId = searchParams.get('edit')
  
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0
  })
  const [loading, setLoading] = useState(true)
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Booking Management</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">
            Manage hotel bookings, view guest information, and track reservations
          </p>
        </div>
        <Button 
  variant="outline" 
  className="h-10 w-10 sm:h-auto sm:w-auto sm:px-3 flex items-center justify-center rounded-md sm:rounded-md"
  onClick={() => setIsNewBookingModalOpen(true)}
>
  
  <Plus className="h-7 w-7 sm:h-5 sm:w-5 text-black sm:mr-2" />
  <span className="hidden sm:inline">New Booking</span>

</Button>

      </div>

      {/* Booking Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-[8px] sm:text-xs font-medium">Total Bookings</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0 px-2 sm:px-3 pb-2 sm:pb-3">
            <div className="text-xs sm:text-base font-bold">{loading ? '...' : stats.totalBookings}</div>
            <p className="text-[7px] sm:text-xs text-muted-foreground hidden sm:block">
              {stats.confirmedBookings} confirmed, {stats.pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-[8px] sm:text-xs font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0 px-2 sm:px-3 pb-2 sm:pb-3">
            <div className="text-xs sm:text-base font-bold">{loading ? '...' : formatCurrency(stats.totalRevenue)}</div>
            <p className="text-[7px] sm:text-xs text-muted-foreground hidden sm:block">
              From all confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-[8px] sm:text-xs font-medium">Today&apos;s Check-ins</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0 px-2 sm:px-3 pb-2 sm:pb-3">
            <div className="text-xs sm:text-base font-bold">{loading ? '...' : stats.todayCheckIns}</div>
            <p className="text-[7px] sm:text-xs text-muted-foreground hidden sm:block">
              Guests arriving today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-[8px] sm:text-xs font-medium">Today&apos;s Check-outs</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0 px-2 sm:px-3 pb-2 sm:pb-3">
            <div className="text-xs sm:text-base font-bold">{loading ? '...' : stats.todayCheckOuts}</div>
            <p className="text-[7px] sm:text-xs text-muted-foreground hidden sm:block">
              Guests departing today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <BookingsTable editBookingId={editBookingId} />

      {/* New Booking Modal */}
      <NewBookingModal 
        open={isNewBookingModalOpen} 
        onOpenChange={setIsNewBookingModalOpen}
        onBookingCreated={() => {
          fetchBookingStats()
          // Refresh the bookings table
          window.location.reload()
        }}
      />
    </div>
  )
}


