"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader, Save, X, Calendar, Users, Bed, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NewBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookingCreated: () => void
}

interface RoomType {
  id: string
  name: string
  size: string
  bedType: string
  maxGuests: number
  amenities: string[]
  features: string[]
  currency: string
  price: number
  availableRooms: Room[]
}

interface Room {
  id: string
  roomNumber: string
  floorNumber?: number
  status: string
  availableForBooking: boolean
}

interface PricingBreakdown {
  baseAmount: number
  totalTaxAmount: number
  totalAmount: number
  taxes: Array<{
    name: string
    percentage: number
    amount: number
  }>
}

export default function NewBookingModal({ open, onOpenChange, onBookingCreated }: NewBookingModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    roomTypeId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    nights: 1,
    promoCode: ''
  })

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingPricing, setLoadingPricing] = useState(false)

  const fetchRoomTypes = async () => {
    setLoadingRoomTypes(true)
    try {
      const response = await fetch('/api/room-types/with-available-rooms')
      if (response.ok) {
        const data = await response.json()
        setRoomTypes(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch room types",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
      toast({
        title: "Error",
        description: "Failed to fetch room types",
        variant: "destructive"
      })
    } finally {
      setLoadingRoomTypes(false)
    }
  }

  const fetchAvailableRooms = useCallback(async (roomTypeId: string) => {
    setLoadingRooms(true)
    try {
      const response = await fetch(`/api/rooms/available-for-booking?roomTypeId=${roomTypeId}`)
      if (response.ok) {
        const rooms = await response.json()
        setAvailableRooms(rooms)
        
        // Set the room type details
        const roomType = roomTypes.find(rt => rt.id === roomTypeId)
        if (roomType) {
          setSelectedRoomType(roomType)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch available rooms",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      toast({
        title: "Error",
        description: "Failed to fetch available rooms",
        variant: "destructive"
      })
    } finally {
      setLoadingRooms(false)
    }
  }, [roomTypes])

  const calculatePricing = useCallback(async () => {
    if (!selectedRoomType || formData.nights <= 0) return

    setLoadingPricing(true)
    try {
      const baseAmount = selectedRoomType.price * formData.nights
      
      const response = await fetch('/api/calculate-taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          baseAmount,
          discountAmount: 0, // No discount for manual bookings initially
          promoCode: formData.promoCode || undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        setPricingBreakdown(result.data)
      } else {
        // Fallback calculation
        setPricingBreakdown({
          baseAmount,
          totalTaxAmount: 0,
          totalAmount: baseAmount,
          taxes: []
        })
      }
    } catch (error) {
      console.error('Error calculating pricing:', error)
      // Fallback calculation
      const baseAmount = selectedRoomType.price * formData.nights
      setPricingBreakdown({
        baseAmount,
        totalTaxAmount: 0,
        totalAmount: baseAmount,
        taxes: []
      })
    } finally {
      setLoadingPricing(false)
    }
  }, [selectedRoomType, formData.nights, formData.promoCode])

  useEffect(() => {
    if (open) {
      fetchRoomTypes()
    }
  }, [open])

  useEffect(() => {
    if (formData.roomTypeId) {
      fetchAvailableRooms(formData.roomTypeId)
    }
  }, [formData.roomTypeId, fetchAvailableRooms])

  useEffect(() => {
    if (selectedRoomType && formData.nights > 0) {
      calculatePricing()
    }
  }, [selectedRoomType, formData.nights, formData.promoCode, calculatePricing])

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 1
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime()
    const nights = Math.ceil(timeDifference / (1000 * 3600 * 24))
    
    return nights > 0 ? nights : 1
  }

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    const newFormData = { ...formData, [field]: value }
    
    if (field === 'checkIn' || field === 'checkOut') {
      const nights = calculateNights(
        field === 'checkIn' ? value : formData.checkIn,
        field === 'checkOut' ? value : formData.checkOut
      )
      newFormData.nights = nights
    }
    
    setFormData(newFormData)
  }

  const validateForm = (): string | null => {
    if (!formData.guestName.trim()) return "Guest name is required"
    if (!formData.guestEmail.trim()) return "Guest email is required"
    if (!formData.guestPhone.trim()) return "Guest phone is required"
    if (!formData.roomTypeId) return "Please select a room type"
    if (!formData.roomId) return "Please select a specific room"
    if (!formData.checkIn) return "Check-in date is required"
    if (!formData.checkOut) return "Check-out date is required"
    
    const checkInDate = new Date(formData.checkIn)
    const checkOutDate = new Date(formData.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkInDate < today) return "Check-in date cannot be in the past"
    if (checkOutDate <= checkInDate) return "Check-out date must be after check-in date"
    
    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const bookingData = {
        ...formData,
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
        source: 'manual_booking'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const booking = await response.json()
        toast({
          title: "Success",
          description: `Booking created successfully! Booking ID: ${booking.id}`
        })
        onBookingCreated()
        handleClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create booking",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      roomTypeId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      nights: 1,
      promoCode: ''
    })
    setSelectedRoomType(null)
    setAvailableRooms([])
    setPricingBreakdown(null)
    onOpenChange(false)
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Create a new booking for a guest. Fill in all required information below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Guest Information</h3>
            
            <div>
              <Label htmlFor="guestName" className="text-sm">Guest Name *</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                placeholder="Enter guest name"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="guestEmail" className="text-sm">Email Address *</Label>
              <Input
                id="guestEmail"
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                placeholder="Enter email address"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="guestPhone" className="text-sm">Phone Number *</Label>
              <Input
                id="guestPhone"
                value={formData.guestPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                placeholder="Enter phone number"
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="adults" className="text-sm">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.adults}
                  onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="children" className="text-sm">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.children}
                  onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests" className="text-sm">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Enter any special requests or notes..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Right Column - Room & Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Room & Booking Details</h3>
            
            <div>
              <Label htmlFor="roomTypeId" className="text-sm">Room Type *</Label>
              <Select 
                value={formData.roomTypeId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, roomTypeId: value, roomId: '' }))}
                disabled={loadingRoomTypes}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={loadingRoomTypes ? "Loading room types..." : "Select room type"} />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((roomType) => (
                    <SelectItem key={roomType.id} value={roomType.id} disabled={roomType.availableRooms.length === 0}>
                      <div className="flex justify-between items-center w-full">
                        <span>{roomType.name}</span>
                        <span className="ml-2 text-xs">
                          {formatCurrency(roomType.price, roomType.currency)}/night
                          {roomType.availableRooms.length === 0 && " (No rooms)"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoomType && (
              <Card className="bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Selected Room Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span className="font-medium">{selectedRoomType.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRoomType.size} • {selectedRoomType.bedType} • Max {selectedRoomType.maxGuests} guests
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRoomType.amenities?.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                    ))}
                    {selectedRoomType.amenities?.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{selectedRoomType.amenities.length - 3} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.roomTypeId && (
              <div>
                <Label htmlFor="roomId" className="text-sm">Select Room *</Label>
                <Select 
                  value={formData.roomId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}
                  disabled={loadingRooms || availableRooms.length === 0}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={loadingRooms ? "Loading rooms..." : availableRooms.length === 0 ? "No rooms available" : "Select a room"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} 
                        {room.floorNumber && ` (Floor ${room.floorNumber})`}
                        {room.status === 'available' && " (Available)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkIn" className="text-sm">Check-in Date *</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => handleDateChange('checkIn', e.target.value)}
                  className="h-9"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="checkOut" className="text-sm">Check-out Date *</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => handleDateChange('checkOut', e.target.value)}
                  className="h-9"
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm font-medium">
                Duration: {formData.nights} night{formData.nights > 1 ? 's' : ''}
              </span>
            </div>

            <div>
              <Label htmlFor="promoCode" className="text-sm">Promo Code (Optional)</Label>
              <Input
                id="promoCode"
                value={formData.promoCode}
                onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                placeholder="Enter promo code"
                className="h-9"
              />
            </div>

            {/* Pricing Preview */}
            {pricingBreakdown && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pricing Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Amount ({formData.nights} nights):</span>
                    <span>{formatCurrency(pricingBreakdown.baseAmount, selectedRoomType?.currency || 'INR')}</span>
                  </div>
                  
                  {pricingBreakdown.taxes && pricingBreakdown.taxes.length > 0 && (
                    <>
                      {pricingBreakdown.taxes
                        .filter(tax => tax.percentage > 0 && tax.amount > 0)
                        .map((tax, index) => (
                          <div key={index} className="flex justify-between text-sm text-slate-600">
                            <span>{tax.name} ({tax.percentage}%):</span>
                            <span>{formatCurrency(tax.amount, selectedRoomType?.currency || 'INR')}</span>
                          </div>
                        ))}
                    </>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(pricingBreakdown.totalAmount, selectedRoomType?.currency || 'INR')}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.guestName || !formData.guestEmail || !formData.guestPhone || !formData.roomTypeId || !formData.roomId || !formData.checkIn || !formData.checkOut}
            size="sm"
          >
            {loading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
