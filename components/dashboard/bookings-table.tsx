"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Loader, Phone, Mail, MapPin, Calendar, Users, Bed, Eye, Edit, Trash2, Save, X, Clock, AlertTriangle, CheckCircle, Plus, FileText, Minus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { checkCheckoutStatus, getCheckoutNotificationMessage, formatCheckoutTime } from "@/lib/checkout-utils"
import { useHotel } from "@/contexts/hotel-context"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"

type BookingStatus = "confirmed" | "pending" | "cancelled" | "checked_in" | "checked_out"

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  actualCheckoutTime?: string
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
    id: string
    roomNumber: string
    floorNumber?: number
    roomType: {
      id: string
      name: string
      size: string
      bedType: string
      maxGuests: number
      amenities: any[]
      features: any[]
      currency: string
      price: number
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
  "early_checked_out": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

// Function to check if booking was checked out early
const isEarlyCheckout = (booking: Booking): boolean => {
  if (booking.status !== 'checked_out' || !booking.actualCheckoutTime) {
    return false;
  }
  
  const actualCheckout = new Date(booking.actualCheckoutTime);
  const scheduledCheckout = new Date(booking.checkOut);
  
  // Check if actual checkout is before scheduled checkout
  return actualCheckout < scheduledCheckout;
};

// Function to get display status
const getDisplayStatus = (booking: Booking): string => {
  if (booking.status === 'checked_out' && isEarlyCheckout(booking)) {
    return 'early_checked_out';
  }
  return booking.status;
};

export default function BookingsTable() {
  const { hotelInfo } = useHotel()
  const deleteConfirmation = useDeleteConfirmation()
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
  
  // Extra Charges Modal State
  const [isExtraChargesModalOpen, setIsExtraChargesModalOpen] = useState(false)
  const [selectedBookingForCharges, setSelectedBookingForCharges] = useState<Booking | null>(null)
  const [extraChargesForm, setExtraChargesForm] = useState({
    itemName: '',
    price: '',
    units: 1,
    description: '',
    gstApplicable: false,
    gstPercentage: 18,
    additionalTaxes: 0
  })
  const [addingCharge, setAddingCharge] = useState(false)
  const [billItems, setBillItems] = useState<any[]>([])
  const [loadingBillItems, setLoadingBillItems] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  // Real-time checkout status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update checkout status
      setBookings(prev => [...prev])
    }, 60000) // Update every minute

    return () => clearInterval(interval)
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

  // Checkout notification component
  const CheckoutNotification = ({ booking }: { booking: Booking }) => {
    const checkoutStatus = checkCheckoutStatus(booking.checkOut, hotelInfo.checkOutTime)
    const notification = getCheckoutNotificationMessage(booking.checkOut, hotelInfo.checkOutTime)
    
    if (checkoutStatus.hasPassed || checkoutStatus.isToday) {
      const bgColor = checkoutStatus.hasPassed ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      const textColor = checkoutStatus.hasPassed ? 'text-red-700' : 'text-yellow-700'
      const iconColor = checkoutStatus.hasPassed ? 'text-red-500' : 'text-yellow-500'
      
      return (
        <div className={`p-1.5 rounded border ${bgColor} mb-1`}>
          <div className="flex items-start gap-1.5">
            <div className={`mt-0.5 ${iconColor}`}>
              {checkoutStatus.hasPassed ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <div className={`text-xs ${textColor}`}>
                {notification.message}
              </div>
              {checkoutStatus.timeRemaining && (
                <div className="text-xs text-gray-600 mt-0.5">
                  {checkoutStatus.timeRemaining}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    
    return null
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
      calculatePricingPreview(newRoomType.price, editingBooking.nights, editingBooking.originalAmount || null, editingBooking.discountAmount || null)
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
            priceDifference: newTaxBreakdown.totalAmount - (editingBooking?.totalAmount || 0)
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
            priceDifference: newTaxBreakdown.totalAmount - (editingBooking?.totalAmount || 0)
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
    
    // Always calculate pricing preview when dates change, regardless of room type
    const currentRoomType = selectedRoomType || editingBooking.room.roomType
    const newNights = calculateNights(
      field === 'checkIn' ? value : editFormData.checkIn,
      field === 'checkOut' ? value : editFormData.checkOut
    )
    
    // Always calculate pricing preview for date changes
    calculatePricingPreview(
      currentRoomType.price, 
      newNights, 
      editingBooking?.originalAmount || null,
      editingBooking?.discountAmount || null
    )
  }

  const validateDates = (checkIn: string, checkOut: string): string | null => {
    if (!checkIn || !checkOut) return "Both check-in and check-out dates are required"
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    // Allow extending stays - don't restrict check-in date to today
    // Only validate that check-out is after check-in
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
        
        // Create a more detailed success message
        let description = "Booking updated successfully"
        const changes = []
        
        if (editFormData.roomTypeId !== editingBooking.room.roomType.id) {
          changes.push("room change")
        }
        if (editFormData.nights !== editingBooking.nights) {
          changes.push("date change")
        }
        if (updatedBooking.totalAmount !== editingBooking.totalAmount) {
          changes.push("pricing update")
        }
        
        if (changes.length > 0) {
          description += ` with ${changes.join(", ")}`
        }
        
        // Add pricing information if it changed
        if (updatedBooking.totalAmount !== editingBooking.totalAmount) {
          const priceDiff = updatedBooking.totalAmount - editingBooking.totalAmount
          const priceChangeText = priceDiff >= 0 ? `+${formatCurrency(priceDiff, editingBooking.room.roomType.currency)}` : formatCurrency(priceDiff, editingBooking.room.roomType.currency)
          description += `. New total: ${formatCurrency(updatedBooking.totalAmount, editingBooking.room.roomType.currency)} (${priceChangeText})`
        }
        
        toast({
          title: "Success",
          description: description
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
    const booking = bookings.find(b => b.id === bookingId)
    deleteConfirmation.showDeleteConfirmation(
      async () => {
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
      },
      {
        title: 'Cancel Booking',
        description: 'Are you sure you want to cancel this booking? This action cannot be undone and will free up the allocated room.',
        itemName: booking ? `${booking.guestName} - ${booking.room.roomNumber}` : undefined,
        variant: 'danger'
      }
    )
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

  // Extra Charges Functions
  const handleExtraCharges = async (booking: Booking) => {
    setSelectedBookingForCharges(booking)
    setIsExtraChargesModalOpen(true)
    await fetchBillItems(booking.id)
  }

  const handleGSTCheckboxChange = async (checked: boolean) => {
    if (checked) {
      // Fetch GST percentage from hotel info
      try {
        const response = await fetch('/api/hotel-info')
        if (response.ok) {
          const hotelData = await response.json()
          const gstPercentage = hotelData.gstPercentage || 18
          setExtraChargesForm(prev => ({ 
            ...prev, 
            gstApplicable: checked,
            gstPercentage: gstPercentage
          }))
        } else {
          // Fallback to default 18%
          setExtraChargesForm(prev => ({ 
            ...prev, 
            gstApplicable: checked,
            gstPercentage: 18
          }))
        }
      } catch (error) {
        console.error('Error fetching hotel info:', error)
        // Fallback to default 18%
        setExtraChargesForm(prev => ({ 
          ...prev, 
          gstApplicable: checked,
          gstPercentage: 18
        }))
      }
    } else {
      setExtraChargesForm(prev => ({ 
        ...prev, 
        gstApplicable: checked,
        gstPercentage: 18
      }))
    }
  }

  const fetchBillItems = async (bookingId: string) => {
    setLoadingBillItems(true)
    try {
      const response = await fetch(`/api/billing/bill-items?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBillItems(data)
      } else {
        console.error('Failed to fetch bill items')
      }
    } catch (error) {
      console.error('Error fetching bill items:', error)
    } finally {
      setLoadingBillItems(false)
    }
  }

  const handleAddExtraCharge = async () => {
    if (!selectedBookingForCharges) return

    if (!extraChargesForm.itemName || !extraChargesForm.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setAddingCharge(true)
    try {
      const response = await fetch('/api/billing/bill-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingForCharges.id,
          itemName: extraChargesForm.itemName,
          unitPrice: parseFloat(extraChargesForm.price),
          quantity: extraChargesForm.units,
          description: extraChargesForm.description,
          gstApplicable: extraChargesForm.gstApplicable,
          gstPercentage: extraChargesForm.gstApplicable ? extraChargesForm.gstPercentage : 0,
          addedBy: 'Admin'
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Extra charge added successfully",
        })
        setExtraChargesForm({
          itemName: '',
          price: '',
          units: 1,
          description: '',
          gstApplicable: false,
          gstPercentage: 18
        })
        await fetchBillItems(selectedBookingForCharges.id)
        fetchBookings() // Refresh booking data to show updated total
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add extra charge",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding extra charge:', error)
      toast({
        title: "Error",
        description: "Failed to add extra charge",
        variant: "destructive"
      })
    } finally {
      setAddingCharge(false)
    }
  }

  const handleDeleteBillItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/billing/bill-items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item removed successfully",
        })
        if (selectedBookingForCharges) {
          await fetchBillItems(selectedBookingForCharges.id)
          fetchBookings() // Refresh booking data to show updated total
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to remove item",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error removing bill item:', error)
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      })
    }
  }

  const handleUpdateBillItem = async (itemId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/billing/bill-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item updated successfully",
        })
        if (selectedBookingForCharges) {
          await fetchBillItems(selectedBookingForCharges.id)
          fetchBookings() // Refresh booking data to show updated total
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update item",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating bill item:', error)
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      })
    }
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

      {/* Checkout Alerts Summary */}
      {(() => {
        const todayCheckouts = bookings.filter(booking => {
          const checkoutStatus = checkCheckoutStatus(booking.checkOut, hotelInfo.checkOutTime)
          return checkoutStatus.isToday && booking.status === 'checked_in'
        })
        
        const overdueCheckouts = bookings.filter(booking => {
          const checkoutStatus = checkCheckoutStatus(booking.checkOut, hotelInfo.checkOutTime)
          return checkoutStatus.hasPassed && booking.status === 'checked_in'
        })
        
        if (todayCheckouts.length > 0 || overdueCheckouts.length > 0) {
          return (
            <div className="mb-4 space-y-2">
              {overdueCheckouts.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">
                      {overdueCheckouts.length} guest{overdueCheckouts.length > 1 ? 's' : ''} overdue for checkout
                    </span>
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Checkout time ({hotelInfo.checkOutTime}) has passed for these bookings
                  </div>
                </div>
              )}
              
              {todayCheckouts.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                      {todayCheckouts.length} guest{todayCheckouts.length > 1 ? 's' : ''} due for checkout today
                    </span>
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    Checkout time: {hotelInfo.checkOutTime}
                  </div>
                </div>
              )}
            </div>
          )
        }
        return null
      })()}

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
              <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Booking ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Guest Details
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Room
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Stay Period
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Guests
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3 border-r border-gray-200">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wide py-4 px-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="font-mono text-sm font-medium border-r border-gray-200 px-3 py-4">
                    {booking.id}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 px-3 py-4">
                    <div>
                      <div className="font-medium">{booking.guestName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.guestPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-200 px-3 py-4">
                    <div>
                      <div className="font-medium">{booking.room.roomNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-200 px-3 py-4">
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.nights} night{booking.nights > 1 ? 's' : ''}
                      </div>
                      <CheckoutNotification booking={booking} />
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-200 px-3 py-4">
                    <div className="text-sm">
                      <div>{booking.adults} Adult{booking.adults > 1 ? 's' : ''}</div>
                      {booking.children > 0 && (
                        <div className="text-muted-foreground">
                          {booking.children} Child{booking.children > 1 ? 'ren' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-200 px-3 py-4">
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
                      {/* Show if pricing was recently updated */}
                      {booking.createdAt && new Date(booking.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                        <div className="text-xs text-blue-600 font-medium">
                          ⚡ Recently updated
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-200 px-3 py-4">
                    <div className="space-y-1">
                      <select
                        value={booking.status}
                        onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 focus:ring-2 focus:ring-amber-500 ${statusColors[getDisplayStatus(booking)] || 'bg-gray-100 text-gray-800'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      
                      {/* Checkout status indicator */}
                      {booking.status === 'checked_in' && (
                        <div className="text-xs">
                          {(() => {
                            const checkoutStatus = checkCheckoutStatus(booking.checkOut, hotelInfo.checkOutTime)
                            if (checkoutStatus.hasPassed) {
                              return (
                                <div className="flex items-center gap-1 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Overdue</span>
                                </div>
                              )
                            } else if (checkoutStatus.isToday) {
                              return (
                                <div className="flex items-center gap-1 text-yellow-600">
                                  <Clock className="h-3 w-3" />
                                  <span>Due today</span>
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      )}
                      
                      {/* Early checkout indicator */}
                      {getDisplayStatus(booking) === 'early_checked_out' && (
                        <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
                          <Clock className="h-3 w-3" />
                          <span>Early Checked-out</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4">
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
                        onClick={() => handleExtraCharges(booking)}
                        title="Extra Charges"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4 text-red-600" />
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader className="pb-6">
                <DialogTitle className="text-xl font-semibold text-gray-900">Booking Details - {selectedBooking.id}</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Complete booking information and guest details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Guest Information */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      Guest Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedBooking.guestName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                      <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {selectedBooking.guestEmail}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                      <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {selectedBooking.guestPhone}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Guests</label>
                      <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        {selectedBooking.adults} Adult{selectedBooking.adults > 1 ? 's' : ''}
                        {selectedBooking.children > 0 && `, ${selectedBooking.children} Child${selectedBooking.children > 1 ? 'ren' : ''}`}
                      </p>
                    </div>
                    {selectedBooking.specialRequests && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Special Requests</label>
                        <p className="text-sm bg-gray-50 p-3 rounded-md border border-gray-200 mt-1 text-gray-700">{selectedBooking.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Room Information */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Bed className="h-4 w-4 text-gray-600" />
                      Room Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Room</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedBooking.room.roomNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                      <p className="text-sm text-gray-700 mt-1">{selectedBooking.room.roomType.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Floor</label>
                      <p className="text-sm text-gray-700 mt-1">{selectedBooking.room.floorNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Size & Bed</label>
                      <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Bed className="h-3 w-3 text-gray-500" />
                        {selectedBooking.room.roomType.size} • {selectedBooking.room.roomType.bedType}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amenities</label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedBooking.room.roomType.amenities?.map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-gray-50 border-gray-200 text-gray-700">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Details */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in</label>
                      <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        {formatDate(selectedBooking.checkIn)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-out</label>
                      <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        {formatDate(selectedBooking.checkOut)}
                      </p>
                      <p className="text-xs text-gray-500 ml-5 mt-1">
                        Checkout time: {hotelInfo.checkOutTime}
                      </p>
                      <div className="mt-2">
                        <CheckoutNotification booking={selectedBooking} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                      <p className="text-sm text-gray-700 mt-1">{selectedBooking.nights} night{selectedBooking.nights > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                      <div className="mt-1">
                                        <Badge className={`${statusColors[getDisplayStatus(selectedBooking)] || 'bg-gray-100 text-gray-800'} text-xs px-2 py-1`}>
                  {getDisplayStatus(selectedBooking).replace('_', ' ').toUpperCase()}
                </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</label>
                      <p className="text-sm text-gray-700 mt-1">{selectedBooking.source}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Booking Date</label>
                      <p className="text-sm text-gray-700 mt-1">{formatDate(selectedBooking.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedBooking.originalAmount && selectedBooking.discountAmount && selectedBooking.discountAmount > 0 ? (
                      <>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original Amount</label>
                          <p className="text-sm text-gray-700 mt-1">{formatCurrency(selectedBooking.originalAmount, selectedBooking.room.roomType.currency)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Discount</label>
                          <p className="text-sm text-green-600 mt-1">
                            -{formatCurrency(selectedBooking.discountAmount, selectedBooking.room.roomType.currency)}
                            {selectedBooking.promoCode && ` (${selectedBooking.promoCode.code})`}
                          </p>
                        </div>
                      </>
                    ) : null}
                    
                    {/* Tax Breakdown */}
                    {selectedBooking.baseAmount && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Base Amount (after discounts)</label>
                        <p className="text-sm text-gray-700 mt-1">{formatCurrency(selectedBooking.baseAmount, selectedBooking.room.roomType.currency)}</p>
                      </div>
                    )}
                    
                    {selectedBooking.totalTaxAmount && selectedBooking.totalTaxAmount > 0 && (
                      <>
                        {selectedBooking.gstAmount && selectedBooking.gstAmount > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST</label>
                            <p className="text-sm text-gray-700 mt-1">{formatCurrency(selectedBooking.gstAmount, selectedBooking.room.roomType.currency)}</p>
                          </div>
                        )}
                        {selectedBooking.serviceTaxAmount && selectedBooking.serviceTaxAmount > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Service Tax</label>
                            <p className="text-sm text-gray-700 mt-1">{formatCurrency(selectedBooking.serviceTaxAmount, selectedBooking.room.roomType.currency)}</p>
                          </div>
                        )}
                        {selectedBooking.otherTaxAmount && selectedBooking.otherTaxAmount > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Other Taxes</label>
                            <p className="text-sm text-gray-700 mt-1">{formatCurrency(selectedBooking.otherTaxAmount, selectedBooking.room.roomType.currency)}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Tax Amount</label>
                          <p className="text-sm text-gray-700 mt-1">{formatCurrency(selectedBooking.totalTaxAmount, selectedBooking.room.roomType.currency)}</p>
                        </div>
                      </>
                    )}
                    
                    <div className="border-t pt-4 mt-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Amount</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
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
                <DialogTitle className="text-xl font-semibold text-gray-900">Edit Booking - {editingBooking.id}</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Update guest information, room allocation, and booking details. You can extend your stay by selecting a later check-out date.
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
                        {editFormData.nights !== editingBooking.nights ? '📅 Date Change Pricing' : 
                         pricingPreview.priceDifference >= 0 ? '📈 Upgrade Pricing' : '📉 Downgrade Pricing'}
                      </h4>
                      
                      {/* Current vs New Comparison */}
                      <div className="mb-3 p-2 bg-gray-50 rounded border">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium text-gray-600">Current:</span>
                            <div className="font-medium">{formatCurrency(editingBooking.totalAmount, editingBooking.room.roomType.currency)}</div>
                            <div className="text-gray-500">{editingBooking.nights} nights</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">New:</span>
                            <div className="font-medium">{formatCurrency(pricingPreview.totalAmount, editingBooking.room.roomType.currency)}</div>
                            <div className="text-gray-500">{editFormData.nights} nights</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        {/* Show date change info if nights changed */}
                        {editFormData.nights !== editingBooking.nights && (
                          <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs text-blue-700">
                              <span className="font-medium">Stay Duration Changed:</span> {editingBooking.nights} → {editFormData.nights} nights
                            </div>
                          </div>
                        )}
                        
                        <div><span className="font-medium">Rate per Night:</span> {formatCurrency(selectedRoomType?.price || editingBooking.room.roomType.price, editingBooking.room.roomType.currency)}</div>
                        
                        {/* Show base amount before taxes */}
                        {pricingPreview.baseAmount && (
                          <div><span className="font-medium">Base Amount ({editFormData.nights} nights):</span> {formatCurrency(pricingPreview.baseAmount, editingBooking.room.roomType.currency)}</div>
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
                        
                        <div className="border-t pt-1 mt-1">
                          <div><span className="font-medium">New Total (incl. taxes):</span> {formatCurrency(pricingPreview.totalAmount, editingBooking.room.roomType.currency)}</div>
                          <div className={`font-semibold ${pricingPreview.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="font-medium">Price Change:</span> 
                            {pricingPreview.priceDifference >= 0 ? '+' : ''}{formatCurrency(pricingPreview.priceDifference, editingBooking.room.roomType.currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm mb-3 text-blue-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Stay Details (Editable)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-checkIn" className="text-xs font-medium text-blue-800">Check-in Date</Label>
                        <Input
                          id="edit-checkIn"
                          type="date"
                          value={editFormData.checkIn}
                          onChange={(e) => handleDateChange('checkIn', e.target.value)}
                          className="h-8 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-checkOut" className="text-xs font-medium text-blue-800">Check-out Date</Label>
                        <Input
                          id="edit-checkOut"
                          type="date"
                          value={editFormData.checkOut}
                          onChange={(e) => handleDateChange('checkOut', e.target.value)}
                          className="h-8 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                          min={editFormData.checkIn} // Must be after check-in
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-center p-2 bg-white rounded border border-blue-200">
                      <span className="text-sm font-semibold text-blue-900">
                        Duration: {editFormData.nights} night{editFormData.nights > 1 ? 's' : ''}
                        {editFormData.nights !== editingBooking.nights && (
                          <span className="text-blue-600 ml-2 font-bold">
                            (Extended from {editingBooking.nights})
                          </span>
                        )}
                      </span>
                    </div>
                    {editFormData.nights !== editingBooking.nights && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-300">
                        <div className="flex items-start gap-2">
                          <div className="text-blue-600 mt-0.5">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-blue-800 mb-1">
                              Stay Extension Detected
                            </p>
                            <p className="text-xs text-blue-700">
                              Your stay has been extended by {editFormData.nights - editingBooking.nights} night{editFormData.nights - editingBooking.nights > 1 ? 's' : ''}. 
                              Pricing will be automatically recalculated to reflect the new duration.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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

      {/* Extra Charges Modal */}
      <Dialog open={isExtraChargesModalOpen} onOpenChange={setIsExtraChargesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBookingForCharges && (
            <>
              <DialogHeader className="pb-3">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Extra Charges - {selectedBookingForCharges.guestName}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add New Charge Form */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-gray-600" />
                      Add New Charge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="itemName" className="text-xs font-medium text-gray-700">
                        Item Name *
                      </Label>
                      <Input
                        id="itemName"
                        value={extraChargesForm.itemName}
                        onChange={(e) => setExtraChargesForm(prev => ({ ...prev, itemName: e.target.value }))}
                        placeholder="e.g., Room Service, Laundry, Mini Bar"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-xs font-medium text-gray-700">
                          Price (₹) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={extraChargesForm.price}
                          onChange={(e) => setExtraChargesForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="units" className="text-xs font-medium text-gray-700">
                          Units
                        </Label>
                        <div className="flex items-center mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setExtraChargesForm(prev => ({ 
                              ...prev, 
                              units: Math.max(1, prev.units - 1) 
                            }))}
                            className="h-8 w-8 p-0 border-r-0 rounded-r-none"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            id="units"
                            type="number"
                            min="1"
                            value={extraChargesForm.units}
                            onChange={(e) => setExtraChargesForm(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                            className="h-8 text-center border-x-0 rounded-none"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setExtraChargesForm(prev => ({ 
                              ...prev, 
                              units: prev.units + 1 
                            }))}
                            className="h-8 w-8 p-0 border-l-0 rounded-l-none"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-xs font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={extraChargesForm.description}
                        onChange={(e) => setExtraChargesForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description for this charge"
                        className="mt-1 text-xs"
                        rows={2}
                      />
                    </div>
                    
                    {/* GST Controls */}
                    <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="gstApplicable"
                          checked={extraChargesForm.gstApplicable}
                          onChange={(e) => handleGSTCheckboxChange(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="gstApplicable" className="text-sm font-medium text-gray-700">
                          GST Applicable
                        </Label>
                      </div>
                      
                      {extraChargesForm.gstApplicable && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="gstPercentage" className="text-xs font-medium text-gray-700">
                              GST Percentage (%)
                            </Label>
                            <Input
                              id="gstPercentage"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={extraChargesForm.gstPercentage}
                              onChange={(e) => setExtraChargesForm(prev => ({ 
                                ...prev, 
                                gstPercentage: parseFloat(e.target.value) || 0 
                              }))}
                              className="mt-1 h-8 text-xs"
                              placeholder="18"
                            />
                          </div>
                          <div>
                            <Label htmlFor="additionalTaxes" className="text-xs font-medium text-gray-700">
                              Additional Taxes (₹)
                            </Label>
                            <Input
                              id="additionalTaxes"
                              type="number"
                              min="0"
                              step="0.01"
                              value={extraChargesForm.additionalTaxes}
                              onChange={(e) => setExtraChargesForm(prev => ({ 
                                ...prev, 
                                additionalTaxes: parseFloat(e.target.value) || 0 
                              }))}
                              className="mt-1 h-8 text-xs"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}
                      
                      {!extraChargesForm.gstApplicable && (
                        <div>
                          <Label htmlFor="additionalTaxes" className="text-xs font-medium text-gray-700">
                            Additional Taxes (₹)
                          </Label>
                          <Input
                            id="additionalTaxes"
                            type="number"
                            min="0"
                            step="0.01"
                            value={extraChargesForm.additionalTaxes}
                            onChange={(e) => setExtraChargesForm(prev => ({ 
                              ...prev, 
                              additionalTaxes: parseFloat(e.target.value) || 0 
                            }))}
                            className="mt-1 h-8 text-xs"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Any additional taxes or charges (fixed amount)
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Price Preview */}
                    {extraChargesForm.itemName && extraChargesForm.price && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Price Preview</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Amount:</span>
                            <span>₹{(parseFloat(extraChargesForm.price) * extraChargesForm.units).toFixed(2)}</span>
                          </div>
                          {extraChargesForm.gstApplicable && extraChargesForm.gstPercentage > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">GST ({extraChargesForm.gstPercentage}%):</span>
                              <span>₹{((parseFloat(extraChargesForm.price) * extraChargesForm.units * extraChargesForm.gstPercentage) / 100).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-green-800 border-t pt-1">
                            <span>Total:</span>
                            <span>
                              ₹{(() => {
                                const baseAmount = parseFloat(extraChargesForm.price) * extraChargesForm.units;
                                const gstAmount = extraChargesForm.gstApplicable && extraChargesForm.gstPercentage > 0 
                                  ? (baseAmount * extraChargesForm.gstPercentage) / 100 
                                  : 0;
                                return (baseAmount + gstAmount).toFixed(2);
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleAddExtraCharge}
                      disabled={addingCharge || !extraChargesForm.itemName || !extraChargesForm.price}
                      className="w-full"
                    >
                      {addingCharge ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {addingCharge ? 'Adding...' : 'Add Charge'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Current Charges List */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      Current Charges
                      {loadingBillItems && <Loader className="h-4 w-4 animate-spin" />}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      All extra charges with tax breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {billItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No extra charges added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {billItems.map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900">{item.itemName}</h4>
                                {item.description && (
                                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                  <span>Qty: {item.quantity}</span>
                                  <span>₹{item.unitPrice}/unit</span>
                                  <span className="font-medium text-gray-900">Total: ₹{item.finalAmount}</span>
                                </div>
                                {item.taxAmount > 0 && (
                                  <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                    <div className="flex justify-between mb-1">
                                      <span>Subtotal:</span>
                                      <span>₹{item.totalPrice}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                      <span>Tax Amount:</span>
                                      <span>₹{item.taxAmount}</span>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2 pt-1 border-t border-gray-100">
                                      <div className="flex items-center gap-1">
                                        <span>
                                          {item.taxRate > 0 ? `GST (${item.taxRate.toFixed(1)}%)` : 'Includes GST & Service Tax'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBillItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Remove Item"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Charges Summary */}
                    {billItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₹{billItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <span>Total Tax:</span>
                              <span className="text-xs text-blue-600">
                                {billItems.some(item => item.taxRate > 0) ? '' : '(GST + Service Tax)'}
                              </span>
                            </span>
                            <span>₹{billItems.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                            <span>Grand Total:</span>
                            <span>₹{billItems.reduce((sum, item) => sum + item.finalAmount, 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>


            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={deleteConfirmation.onClose}
        onConfirm={deleteConfirmation.onConfirm}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        itemName={deleteConfirmation.itemName}
        isLoading={deleteConfirmation.isLoading}
        variant={deleteConfirmation.variant}
      />
    </div>
  )
}


