"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Loader, Phone, Mail, MapPin, Calendar, Users, Bed, Eye, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BookingStatus = "confirmed" | "pending" | "cancelled" | "checked_in" | "checked_out"

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  totalAmount: number
  originalAmount?: number
  discountAmount?: number
  baseAmount?: number
  gstAmount?: number
  serviceTaxAmount?: number
  otherTaxAmount?: number
  totalTaxAmount?: number
  specialRequests?: string
  status: string
  source: string
  createdAt: string
  room: {
    roomNumber: string
    floorNumber?: number
    roomType: {
      name: string
      size: string
      bedType: string
      maxGuests: number
      amenities: any[]
      features: any[]
      currency: string
    }
  }
  promoCode?: {
    code: string
    title: string
  }
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  checked_in: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  checked_out: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

export default function BookingsTable() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editFormData, setEditFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    status: 'confirmed',
    roomId: '',
    roomTypeId: '',
    checkIn: '',
    checkOut: '',
    nights: 1,
    recalculatePricing: false
  })
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [allRoomTypes, setAllRoomTypes] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null)
  const [pricingPreview, setPricingPreview] = useState<any>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch bookings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesQuery = `${b.id} ${b.guestName} ${b.room.roomNumber}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === "all" || b.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailModalOpen(true)
  }

  const handleEditBooking = async (booking: Booking) => {
    setEditingBooking(booking)
    
    // Format dates for input fields (YYYY-MM-DD format)
    const checkInDate = new Date(booking.checkIn).toISOString().split('T')[0]
    const checkOutDate = new Date(booking.checkOut).toISOString().split('T')[0]
    
    setEditFormData({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      adults: booking.adults,
      children: booking.children,
      specialRequests: booking.specialRequests || '',
      status: booking.status,
      roomId: booking.room.id,
      roomTypeId: booking.room.roomType.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: booking.nights,
      recalculatePricing: false
    })
    setSelectedRoomType(null)
    setPricingPreview(null)
    setIsEditModalOpen(true)
    
    // Fetch all room types with available rooms
    await fetchAllRoomTypes(booking.room.id)
  }

  const fetchAllRoomTypes = async (currentRoomId: string) => {
    setLoadingRoomTypes(true)
    try {
      const response = await fetch(`/api/room-types/with-available-rooms?currentRoomId=${currentRoomId}`)
      if (response.ok) {
        const roomTypes = await response.json()
        setAllRoomTypes(roomTypes)
        
        // Set initial room type and available rooms
        if (editingBooking) {
          const currentRoomType = roomTypes.find((rt: any) => rt.id === editingBooking.room.roomType.id)
          if (currentRoomType) {
            setSelectedRoomType(currentRoomType)
            setAvailableRooms(currentRoomType.availableRooms)
          }
        }
      } else {
        console.error('Failed to fetch room types')
        setAllRoomTypes([])
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
      setAllRoomTypes([])
    } finally {
      setLoadingRoomTypes(false)
    }
  }

  const fetchAvailableRooms = async (roomTypeId: string, currentRoomId: string) => {
    setLoadingRooms(true)
    try {
      const response = await fetch(`/api/rooms/available-for-booking?roomTypeId=${roomTypeId}&currentRoomId=${currentRoomId}`)
      if (response.ok) {
        const rooms = await response.json()
        setAvailableRooms(rooms)
      } else {
        console.error('Failed to fetch available rooms')
        setAvailableRooms([])
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      setAvailableRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }

  const handleRoomTypeChange = async (roomTypeId: string) => {
    if (!editingBooking) return
    
    const newRoomType = allRoomTypes.find(rt => rt.id === roomTypeId)
    if (!newRoomType) return

    setSelectedRoomType(newRoomType)
    setEditFormData(prev => ({ 
      ...prev, 
      roomTypeId: roomTypeId,
      roomId: '', // Reset room selection when room type changes
      recalculatePricing: roomTypeId !== editingBooking.room.roomType.id
    }))
    
    // Update available rooms for the new room type
    setAvailableRooms(newRoomType.availableRooms)
    
    // Calculate pricing preview if room type changed
    if (roomTypeId !== editingBooking.room.roomType.id) {
      calculatePricingPreview(newRoomType.price, editingBooking.nights, editingBooking.originalAmount, editingBooking.discountAmount)
    } else {
      setPricingPreview(null)
    }
  }

  const calculatePricingPreview = async (newRoomTypePrice: number, nights: number, originalAmount: number | null, discountAmount: number | null) => {
    const newBaseAmount = newRoomTypePrice * nights
    
    if (discountAmount && originalAmount) {
      const discountPercentage = (discountAmount / originalAmount) * 100
      const newDiscountAmount = (newBaseAmount * discountPercentage) / 100
      
      // Calculate taxes on the new amount after discount
      try {
        const response = await fetch('/api/calculate-taxes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseAmount: newBaseAmount, discountAmount: newDiscountAmount })
        })
        
        if (response.ok) {
          const result = await response.json()
          const newTaxBreakdown = result.data
          
          setPricingPreview({
            originalAmount: newBaseAmount,
            discountAmount: newDiscountAmount,
            baseAmount: newTaxBreakdown.baseAmount,
            totalTaxAmount: newTaxBreakdown.totalTaxAmount,
            totalAmount: newTaxBreakdown.totalAmount,
            taxes: newTaxBreakdown.taxes,
            priceDifference: newTaxBreakdown.totalAmount - (editingBooking.totalAmount || 0)
          })
        } else {
          // Fallback without tax calculation
          setPricingPreview({
            originalAmount: newBaseAmount,
            discountAmount: newDiscountAmount,
            totalAmount: newBaseAmount - newDiscountAmount,
            priceDifference: (newBaseAmount - newDiscountAmount) - (originalAmount - discountAmount)
          })
        }
      } catch (error) {
        console.error('Error calculating taxes for pricing preview:', error)
        // Fallback without tax calculation
        setPricingPreview({
          originalAmount: newBaseAmount,
          discountAmount: newDiscountAmount,
          totalAmount: newBaseAmount - newDiscountAmount,
          priceDifference: (newBaseAmount - newDiscountAmount) - (originalAmount - discountAmount)
        })
      }
    } else {
      // Calculate taxes on the new amount without discount
      try {
        const response = await fetch('/api/calculate-taxes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseAmount: newBaseAmount, discountAmount: 0 })
        })
        
        if (response.ok) {
          const result = await response.json()
          const newTaxBreakdown = result.data
          
          setPricingPreview({
            originalAmount: newBaseAmount,
            discountAmount: 0,
            baseAmount: newTaxBreakdown.baseAmount,
            totalTaxAmount: newTaxBreakdown.totalTaxAmount,
            totalAmount: newTaxBreakdown.totalAmount,
            taxes: newTaxBreakdown.taxes,
            priceDifference: newTaxBreakdown.totalAmount - (editingBooking.totalAmount || 0)
          })
        } else {
          // Fallback without tax calculation
          setPricingPreview({
            originalAmount: newBaseAmount,
            discountAmount: 0,
            totalAmount: newBaseAmount,
            priceDifference: newBaseAmount - (originalAmount || 0)
          })
        }
      } catch (error) {
        console.error('Error calculating taxes for pricing preview:', error)
        // Fallback without tax calculation
        setPricingPreview({
          originalAmount: newBaseAmount,
          discountAmount: 0,
          totalAmount: newBaseAmount,
          priceDifference: newBaseAmount - (originalAmount || 0)
        })
      }
    }
  }

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 1
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime()
    const nights = Math.ceil(timeDifference / (1000 * 3600 * 24))
    
    return nights > 0 ? nights : 1
  }

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    if (!editingBooking) return
    
    const newFormData = { ...editFormData, [field]: value }
    
    // Recalculate nights when dates change
    if (field === 'checkIn' || field === 'checkOut') {
      const nights = calculateNights(
        field === 'checkIn' ? value : editFormData.checkIn,
        field === 'checkOut' ? value : editFormData.checkOut
      )
      newFormData.nights = nights
      newFormData.recalculatePricing = true // Always recalculate when dates change
    }
    
    setEditFormData(newFormData)
    
    // Update pricing preview if room type or dates changed
    if (selectedRoomType && (editFormData.roomTypeId !== editingBooking.room.roomType.id || newFormData.nights !== editingBooking.nights)) {
      calculatePricingPreview(
        selectedRoomType.price, 
        newFormData.nights, 
        editingBooking.originalAmount, 
        editingBooking.discountAmount
      )
    }
  }

  const validateDates = (checkIn: string, checkOut: string): string | null => {
    if (!checkIn || !checkOut) return "Both check-in and check-out dates are required"
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for comparison
    
    if (checkInDate < today) {
      return "Check-in date cannot be in the past"
    }
    
    if (checkOutDate <= checkInDate) {
      return "Check-out date must be after check-in date"
    }
    
    return null
  }

  const handleUpdateBooking = async () => {
    if (!editingBooking) return
    
    // Validate dates
    const dateError = validateDates(editFormData.checkIn, editFormData.checkOut)
    if (dateError) {
      toast({
        title: "Invalid Dates",
        description: dateError,
        variant: "destructive"
      })
      return
    }
    
    setUpdating(true)
    try {
      // Prepare update data with properly formatted dates
      const updateData = {
        ...editFormData,
        checkIn: editFormData.checkIn ? new Date(editFormData.checkIn).toISOString() : undefined,
        checkOut: editFormData.checkOut ? new Date(editFormData.checkOut).toISOString() : undefined,
        nights: editFormData.nights
      }
      
      const response = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedBooking = await response.json()
        toast({
          title: "Success",
          description: `Booking updated successfully${editFormData.roomTypeId !== editingBooking.room.roomType.id ? ' with room change' : ''}${editFormData.nights !== editingBooking.nights ? ' and new dates' : ''}`
        })
        setIsEditModalOpen(false)
        setEditingBooking(null)
        fetchBookings() // Refresh the list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update booking",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone and will free up the allocated room.')) {
      return
    }

    setDeleting(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully"
        })
        fetchBookings() // Refresh the list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to cancel booking",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Booking status updated successfully"
        })
        fetchBookings() // Refresh the list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update booking status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading bookings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search by guest, booking ID, or room number" 
            className="pl-10" 
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
          </select>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {bookings.length === 0 ? "No bookings found" : "No bookings match your search criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest Details</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Stay Period</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm font-medium">
                    {booking.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.guestName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {booking.guestEmail}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.guestPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">Room {booking.room.roomNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.room.roomType.name}
                      </div>
                      {booking.room.floorNumber && (
                        <div className="text-xs text-muted-foreground">
                          Floor {booking.room.floorNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.nights} night{booking.nights > 1 ? 's' : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{booking.adults} Adult{booking.adults > 1 ? 's' : ''}</div>
                      {booking.children > 0 && (
                        <div className="text-muted-foreground">
                          {booking.children} Child{booking.children > 1 ? 'ren' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(booking.totalAmount, booking.room.roomType.currency)}
                      </div>
                      {booking.discountAmount && booking.discountAmount > 0 && (
                        <div className="text-xs text-green-600">
                          -{formatCurrency(booking.discountAmount, booking.room.roomType.currency)} saved
                        </div>
                      )}
                      {booking.promoCode && (
                        <div className="text-xs text-blue-600">
                          Code: {booking.promoCode.code}
                        </div>
                      )}
                      {booking.totalTaxAmount && booking.totalTaxAmount > 0 && (
                        <div className="text-xs text-slate-500">
                          Incl. {formatCurrency(booking.totalTaxAmount, booking.room.roomType.currency)} tax
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={booking.status}
                      onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 focus:ring-2 focus:ring-amber-500 ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                        title="Edit Booking"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deleting === booking.id}
                        title="Cancel Booking"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === booking.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Booking Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details - {selectedBooking.id}</DialogTitle>
                <DialogDescription>
                  Complete booking information and guest details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-medium">{selectedBooking.guestName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedBooking.guestEmail}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedBooking.guestPhone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Guests</label>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {selectedBooking.adults} Adult{selectedBooking.adults > 1 ? 's' : ''}
                        {selectedBooking.children > 0 && `, ${selectedBooking.children} Child${selectedBooking.children > 1 ? 'ren' : ''}`}
                      </p>
                    </div>
                    {selectedBooking.specialRequests && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Special Requests</label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{selectedBooking.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Room Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Room Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Room Number</label>
                      <p className="font-medium">{selectedBooking.room.roomNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Room Type</label>
                      <p>{selectedBooking.room.roomType.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Floor</label>
                      <p>{selectedBooking.room.floorNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Size & Bed</label>
                      <p className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {selectedBooking.room.roomType.size} • {selectedBooking.room.roomType.bedType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amenities</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedBooking.room.roomType.amenities?.map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Check-in</label>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedBooking.checkIn)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Check-out</label>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedBooking.checkOut)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p>{selectedBooking.nights} night{selectedBooking.nights > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge className={statusColors[selectedBooking.status] || 'bg-gray-100 text-gray-800'}>
                        {selectedBooking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Source</label>
                      <p>{selectedBooking.source}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Booking Date</label>
                      <p>{formatDate(selectedBooking.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedBooking.originalAmount && selectedBooking.discountAmount && selectedBooking.discountAmount > 0 ? (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Original Amount</label>
                          <p>{formatCurrency(selectedBooking.originalAmount, selectedBooking.room.roomType.currency)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Discount</label>
                          <p className="text-green-600">
                            -{formatCurrency(selectedBooking.discountAmount, selectedBooking.room.roomType.currency)}
                            {selectedBooking.promoCode && ` (${selectedBooking.promoCode.code})`}
                          </p>
                        </div>
                      </>
                    ) : null}
                    
                    {/* Tax Breakdown */}
                    {selectedBooking.baseAmount && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Base Amount (after discounts)</label>
                        <p>{formatCurrency(selectedBooking.baseAmount, selectedBooking.room.roomType.currency)}</p>
                      </div>
                    )}
                    
                    {selectedBooking.totalTaxAmount && selectedBooking.totalTaxAmount > 0 && (
                      <>
                        {selectedBooking.gstAmount && selectedBooking.gstAmount > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">GST</label>
                            <p className="text-sm">{formatCurrency(selectedBooking.gstAmount, selectedBooking.room.roomType.currency)}</p>
                          </div>
                        )}
                        {selectedBooking.serviceTaxAmount && selectedBooking.serviceTaxAmount > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Service Tax</label>
                            <p className="text-sm">{formatCurrency(selectedBooking.serviceTaxAmount, selectedBooking.room.roomType.currency)}</p>
                          </div>
                        )}
                        {selectedBooking.otherTaxAmount && selectedBooking.otherTaxAmount > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Other Taxes</label>
                            <p className="text-sm">{formatCurrency(selectedBooking.otherTaxAmount, selectedBooking.room.roomType.currency)}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Tax Amount</label>
                          <p className="text-sm">{formatCurrency(selectedBooking.totalTaxAmount, selectedBooking.room.roomType.currency)}</p>
                        </div>
                      </>
                    )}
                    
                    <div className="border-t pt-3">
                      <label className="text-sm font-medium text-gray-500">Total Amount</label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(selectedBooking.totalAmount, selectedBooking.room.roomType.currency)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {editingBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Booking - {editingBooking.id}</DialogTitle>
                <DialogDescription>
                  Update guest information, room allocation, and booking details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Guest Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Guest Information</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-guestName" className="text-sm">Guest Name *</Label>
                      <Input
                        id="edit-guestName"
                        value={editFormData.guestName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, guestName: e.target.value }))}
                        placeholder="Enter guest name"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-guestPhone" className="text-sm">Phone Number *</Label>
                      <Input
                        id="edit-guestPhone"
                        value={editFormData.guestPhone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-guestEmail" className="text-sm">Email Address *</Label>
                    <Input
                      id="edit-guestEmail"
                      type="email"
                      value={editFormData.guestEmail}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                      placeholder="Enter email address"
                      className="h-9"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-adults" className="text-sm">Adults</Label>
                      <Input
                        id="edit-adults"
                        type="number"
                        min="1"
                        max="10"
                        value={editFormData.adults}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-children" className="text-sm">Children</Label>
                      <Input
                        id="edit-children"
                        type="number"
                        min="0"
                        max="10"
                        value={editFormData.children}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-status" className="text-sm">Booking Status</Label>
                    <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-specialRequests" className="text-sm">Special Requests</Label>
                    <Textarea
                      id="edit-specialRequests"
                      value={editFormData.specialRequests}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                      placeholder="Enter any special requests or notes..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Right Column - Room Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Room Information & Upgrade/Downgrade</h3>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Current Booking</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Room:</span> {editingBooking.room.roomNumber}</div>
                      <div><span className="font-medium">Type:</span> {editingBooking.room.roomType.name}</div>
                      <div><span className="font-medium">Floor:</span> {editingBooking.room.floorNumber || 'N/A'}</div>
                      <div><span className="font-medium">Nights:</span> {editingBooking.nights}</div>
                      <div><span className="font-medium">Current Rate:</span> {formatCurrency(editingBooking.room.roomType.price, editingBooking.room.roomType.currency)}/night</div>
                      <div><span className="font-medium">Total:</span> {formatCurrency(editingBooking.totalAmount, editingBooking.room.roomType.currency)}</div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-roomTypeId" className="text-sm">Select Room Type (Upgrade/Downgrade)</Label>
                    <Select 
                      value={editFormData.roomTypeId} 
                      onValueChange={handleRoomTypeChange}
                      disabled={loadingRoomTypes}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={loadingRoomTypes ? "Loading room types..." : "Select room type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {allRoomTypes.map((roomType) => (
                          <SelectItem key={roomType.id} value={roomType.id} disabled={!roomType.hasAvailableRooms}>
                            <div className="flex justify-between items-center w-full">
                              <span>
                                {roomType.name} 
                                {roomType.id === editingBooking.room.roomType.id && " (Current)"}
                              </span>
                              <span className="ml-2 text-xs">
                                {formatCurrency(roomType.price, roomType.currency)}/night
                                {!roomType.hasAvailableRooms && " (No rooms)"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose a different room type to upgrade or downgrade
                    </p>
                  </div>

                  {selectedRoomType && availableRooms.length > 0 && (
                    <div>
                      <Label htmlFor="edit-roomId" className="text-sm">Select Specific Room</Label>
                      <Select 
                        value={editFormData.roomId} 
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, roomId: value }))}
                        disabled={loadingRooms}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.roomNumber} 
                              {room.floorNumber && ` (Floor ${room.floorNumber})`}
                              {room.id === editingBooking.room.id && " (Current)"}
                              {room.status === 'available' && room.id !== editingBooking.room.id && " (Available)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {pricingPreview && (
                    <div className={`p-3 rounded-lg border-2 ${pricingPreview.priceDifference >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <h4 className="font-medium text-sm mb-2">
                        {pricingPreview.priceDifference >= 0 ? '📈 Upgrade Pricing' : '📉 Downgrade Pricing'}
                      </h4>
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        <div><span className="font-medium">New Rate:</span> {formatCurrency(selectedRoomType?.price || 0, editingBooking.room.roomType.currency)}/night</div>
                        
                        {/* Show base amount before taxes */}
                        {pricingPreview.baseAmount && (
                          <div><span className="font-medium">Base Amount:</span> {formatCurrency(pricingPreview.baseAmount, editingBooking.room.roomType.currency)}</div>
                        )}
                        
                        {/* Show tax breakdown if available */}
                        {pricingPreview.taxes && pricingPreview.taxes.length > 0 && (
                          <>
                            {pricingPreview.taxes
                              .filter((tax: any) => tax.percentage > 0 && tax.amount > 0)
                              .map((tax: any, index: number) => (
                                <div key={index} className="text-xs text-slate-600">
                                  <span className="font-medium">{tax.name} ({tax.percentage}%):</span> {formatCurrency(tax.amount, editingBooking.room.roomType.currency)}
                                </div>
                              ))}
                          </>
                        )}
                        
                        <div><span className="font-medium">New Total (incl. taxes):</span> {formatCurrency(pricingPreview.totalAmount, editingBooking.room.roomType.currency)}</div>
                        <div className={`font-semibold ${pricingPreview.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="font-medium">Price Change:</span> 
                          {pricingPreview.priceDifference >= 0 ? '+' : ''}{formatCurrency(pricingPreview.priceDifference, editingBooking.room.roomType.currency)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Stay Details (Editable)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-checkIn" className="text-xs">Check-in Date</Label>
                        <Input
                          id="edit-checkIn"
                          type="date"
                          value={editFormData.checkIn}
                          onChange={(e) => handleDateChange('checkIn', e.target.value)}
                          className="h-8 text-sm"
                          min={new Date().toISOString().split('T')[0]} // Prevent past dates
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-checkOut" className="text-xs">Check-out Date</Label>
                        <Input
                          id="edit-checkOut"
                          type="date"
                          value={editFormData.checkOut}
                          onChange={(e) => handleDateChange('checkOut', e.target.value)}
                          className="h-8 text-sm"
                          min={editFormData.checkIn || new Date().toISOString().split('T')[0]} // Must be after check-in
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm font-medium">
                        Nights: {editFormData.nights}
                        {editFormData.nights !== editingBooking.nights && (
                          <span className="text-blue-600 ml-1">
                            (Changed from {editingBooking.nights})
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Date changes will automatically recalculate pricing
                    </p>
                  </div>


                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updating}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateBooking}
                  disabled={updating || !editFormData.guestName || !editFormData.guestEmail || !editFormData.guestPhone || !editFormData.roomId || !editFormData.checkIn || !editFormData.checkOut}
                  size="sm"
                >
                  {updating ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {updating ? 'Updating...' : 'Update Booking'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


