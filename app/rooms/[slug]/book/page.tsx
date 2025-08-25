"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Container } from "@/components/ui/container"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CalendarIcon, 
  Users, 
  Bed, 
  Bath, 
  Square, 
  IndianRupee, 
  Check, 
  ArrowLeft,
  CreditCard,
  Shield,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Home,
  User,
  Star,
  ArrowRight,
  Edit
} from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useHotel } from "@/contexts/hotel-context"
import { usePolicyModal } from "@/components/ui/policy-modal"

interface Room {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  size: string
  bedType: string
  bathroomCount: number
  maxGuests: number
  discountPercent?: number | null
  images: string[]
  shortDescription: string
  description: string
  highlights?: string
  amenities: string[]
  features: string[]
  cancellationFree: boolean
  instantBooking: boolean
}

interface BookingData {
  checkIn: Date | undefined
  checkOut: Date | undefined
  adults: number
  children: number
  numberOfRooms: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  agreeToTerms: boolean
  promoCode: string
}

interface ValidatedPromo {
  promoCode: {
    id: string
    code: string
    title: string
    description?: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
  }
  originalAmount: number
  discountAmount: number
  finalAmount: number
  savings: number
}

interface FeaturedPromo {
  id: string
  code: string
  title: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  validUntil: string
  isActive: boolean
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { hotelInfo } = useHotel()
  const { openPrivacy, openTerms, PrivacyModal, TermsModal } = usePolicyModal()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [validatedPromo, setValidatedPromo] = useState<ValidatedPromo | null>(null)
  const [promoValidating, setPromoValidating] = useState(false)
  const [taxBreakdown, setTaxBreakdown] = useState<any>(null)
  const [featuredPromos, setFeaturedPromos] = useState<FeaturedPromo[]>([])
  const [promosLoading, setPromosLoading] = useState<boolean>(true)
  
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: undefined,
    checkOut: undefined,
    adults: 1,
    children: 0,
    numberOfRooms: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
    agreeToTerms: false,
    promoCode: ""
  })
  
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const timestamp = new Date().getTime()
      const random = Math.random()
      const response = await fetch(`/api/rooms?t=${timestamp}&r=${random}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }

      const rooms = await response.json()
      const foundRoom = rooms.find((r: Room) => r.slug === params.slug)

      if (foundRoom) {
        setRoom(foundRoom)
      } else {
        toast.error('Room not found')
        router.push('/rooms')
      }
    } catch (error) {
      console.error('Error fetching room:', error)
      toast.error('Failed to load room details')
      router.push('/rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.slug) {
      fetchRoom()
    }
  }, [params.slug])

  // Fetch available promos to show under Price Breakdown
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await fetch('/api/promo-codes/featured')
        const data = await response.json()
        if (data.success) {
          setFeaturedPromos(data.data)
        }
      } catch (e) {
        // ignore silently
      } finally {
        setPromosLoading(false)
      }
    }
    fetchPromos()
  }, [])

  // Effect to recalculate taxes when booking data changes
  useEffect(() => {
    if (room && bookingData.checkIn && bookingData.checkOut) {
      calculateTaxBreakdown()
    }
  }, [room, bookingData.checkIn, bookingData.checkOut, bookingData.numberOfRooms, validatedPromo])

  // Effect to calculate initial taxes when room is loaded
  useEffect(() => {
    if (room) {
      calculateTaxBreakdown()
    }
  }, [room])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      return differenceInDays(bookingData.checkOut, bookingData.checkIn)
    }
    return 0
  }

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setValidatedPromo(null)
      return
    }

    setPromoValidating(true)
    try {
      const nights = calculateNights()
      const roomPrice = room?.price || 0
      const subtotal = roomPrice * nights * bookingData.numberOfRooms
      
      // Use dynamic tax calculation or fall back to current tax breakdown
      let totalAmount = subtotal
      if (taxBreakdown) {
        // Recalculate taxes for the base amount without any promo discount
        const response = await fetch('/api/calculate-taxes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseAmount: subtotal, discountAmount: 0 })
        })
        
        if (response.ok) {
          const result = await response.json()
          totalAmount = result.data.totalAmount
        } else {
          totalAmount = subtotal + (taxBreakdown.totalTaxAmount || subtotal * 0.18)
        }
      } else {
        totalAmount = subtotal + (subtotal * 0.18) // Fallback
      }

      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          roomId: room?.id,
          totalAmount,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut
        })
      })

      const data = await response.json()

      if (data.success) {
        setValidatedPromo(data.data)
        toast.success(`${data.data.promoCode.title} - ₹${data.data.savings} discount applied!`)
      } else {
        setValidatedPromo(null)
        toast.error(data.error)
      }
    } catch (error) {
      setValidatedPromo(null)
      toast.error('Error validating promo code')
    } finally {
      setPromoValidating(false)
    }
  }

  const calculateSubtotal = () => {
    const nights = calculateNights()
    if (!room || nights <= 0) return 0
    
    const roomPrice = room.price
    return roomPrice * nights * bookingData.numberOfRooms
  }

  const calculateTaxBreakdown = async () => {
    const baseAmount = calculateSubtotal()
    const discountAmount = validatedPromo?.discountAmount || 0
    
    try {
      const response = await fetch('/api/calculate-taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseAmount, discountAmount })
      })
      
      if (response.ok) {
        const result = await response.json()
        setTaxBreakdown(result.data)
        return result.data
      }
    } catch (error) {
      console.error('Error calculating tax breakdown:', error)
    }
    
    // Fallback to simple calculation
    const finalAmount = baseAmount - discountAmount
    const taxAmount = finalAmount * 0.18 // 18% default GST
    return {
      baseAmount: finalAmount,
      totalTaxAmount: taxAmount,
      totalAmount: finalAmount + taxAmount,
      taxes: [{ name: 'GST', percentage: 18, amount: taxAmount }]
    }
  }

  const calculateTaxes = () => {
    return taxBreakdown?.totalTaxAmount || calculateSubtotal() * 0.18 // 18% GST fallback
  }

  const calculateTotal = () => {
    if (validatedPromo) {
      return validatedPromo.finalAmount
    }
    return taxBreakdown?.totalAmount || (calculateSubtotal() + calculateTaxes())
  }

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error("Please select check-in and check-out dates")
      return false
    }
    
    if (calculateNights() <= 0) {
      toast.error("Check-out date must be after check-in date")
      return false
    }
    
    if (!bookingData.guestName.trim()) {
      toast.error("Please enter guest name")
      return false
    }
    
    if (!bookingData.guestEmail.trim()) {
      toast.error("Please enter email address")
      return false
    }
    
    if (!bookingData.guestPhone.trim()) {
      toast.error("Please enter phone number")
      return false
    }
    
    if (!bookingData.agreeToTerms) {
      toast.error("Please agree to terms and conditions")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Show confirmation modal instead of immediately submitting
    setShowConfirmationModal(true)
  }

  const handleConfirmBooking = async () => {
    console.log('Starting booking confirmation process...')
    console.log('User Agent:', navigator.userAgent)
    console.log('Is Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    
    setSubmitting(true)
    setShowConfirmationModal(false)
    
    try {
      const bookingPayload = {
        roomTypeId: room!.id, // This is actually the room type ID
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: calculateNights(),
        adults: bookingData.adults,
        children: bookingData.children,
        numberOfRooms: bookingData.numberOfRooms,
        totalAmount: calculateTotal(),
        originalAmount: validatedPromo ? validatedPromo.originalAmount : calculateTotal(),
        discountAmount: validatedPromo ? validatedPromo.discountAmount : 0,
        promoCodeId: validatedPromo ? validatedPromo.promoCode.id : null,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        specialRequests: bookingData.specialRequests
      }
      
      console.log('Booking payload:', bookingPayload)
      
      // Create booking with automatic room allocation and timeout for mobile
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('Request timeout reached')
        controller.abort()
      }, 45000) // Increased timeout to 45 seconds for mobile
      
      let response: Response | undefined
      let retryCount = 0
      const maxRetries = 3 // Increased retries for mobile
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`Attempting booking (attempt ${retryCount + 1}/${maxRetries + 1})...`)
          
          // Add mobile-specific headers
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
          
          // Add user agent for debugging
          if (typeof navigator !== 'undefined') {
            headers['X-User-Agent'] = navigator.userAgent
          }
          
          response = await fetch('/api/bookings', {
            method: 'POST',
            headers,
            body: JSON.stringify(bookingPayload),
            signal: controller.signal,
            // Add mobile-specific fetch options
            keepalive: true,
            mode: 'cors',
            credentials: 'same-origin'
          })
          
          console.log('Response status:', response.status)
          console.log('Response headers:', Object.fromEntries(response.headers.entries()))
          
          if (response.ok) {
            console.log('Booking request successful')
            break // If successful, break out of retry loop
          } else {
            const errorText = await response.text()
            console.error('Response not ok:', response.status, errorText)
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }
        } catch (fetchError) {
          console.error(`Booking attempt ${retryCount + 1} failed:`, fetchError)
          retryCount++
          
          if (retryCount > maxRetries) {
            throw fetchError
          }
          
          // Exponential backoff with jitter for mobile
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 5000)
          console.log(`Retrying in ${backoffDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
        }
      }

      clearTimeout(timeoutId)

      if (!response || !response.ok) {
        const error = await response?.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(error?.error || 'Failed to create booking')
      }

      const booking = await response.json()
      console.log('Booking created successfully:', booking)
      
      // If a promo code was used, increment its usage count
      if (validatedPromo) {
        try {
          await fetch(`/api/promo-codes/${validatedPromo.promoCode.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              usedCount: (validatedPromo as any).usedCount + 1 
            })
          })
        } catch (error) {
          console.error('Error updating promo code usage:', error)
        }
      }
      
      toast.success(`Booking confirmed! Room ${booking.room.roomNumber} has been allocated to you.`)
      
      // Redirect to confirmation page with booking ID
      router.push(`/booking/confirmation?bookingId=${booking.id}`)
      
    } catch (error) {
      console.error("Booking error:", error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error("Booking request timed out. Please check your connection and try again.")
        } else {
          toast.error(error.message || "Failed to submit booking. Please try again.")
        }
      } else {
        toast.error("Failed to submit booking. Please try again.")
      }
      
      // Re-show the confirmation modal on error so user can retry
      setShowConfirmationModal(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <Container className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-8 h-96"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-8 h-96"></div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
          <p className="text-muted-foreground mb-4">The room you're trying to book doesn't exist.</p>
          <Button asChild>
            <Link href="/rooms">Back to Rooms</Link>
          </Button>
        </div>
      </div>
    )
  }

  const nights = calculateNights()
  const subtotal = calculateSubtotal()
  const taxes = calculateTaxes()
  const total = calculateTotal()

  // Contact helpers
  const normalizePhone = (value?: string) => (value || "").replace(/\D/g, "")
  const telHref = `tel:${(hotelInfo.primaryPhone || '').replace(/[^+\d]/g, '') || '+919876543210'}`
  const waNumber = normalizePhone(hotelInfo.whatsappPhone || hotelInfo.primaryPhone)
  const waUrl = `https://wa.me/${waNumber || '919876543210'}?text=${encodeURIComponent('Hi, I would like to inquire about booking.')} `

  return (
         <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <Container className="py-3 md:py-4 px-4 md:px-0">
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/rooms/${room.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Room</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Book Your Stay</h1>
              <p className="text-sm md:text-base text-muted-foreground">{room.name}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4 md:py-8 px-4 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                             {/* Guest Information */}
               <Card className="border border-gray-200 bg-white shadow-sm">
                 <CardHeader className="pb-3 md:pb-4">
                   <CardTitle className="flex items-center gap-2 text-gray-900">
                     <User className="h-5 w-5" />
                     Guest Information
                   </CardTitle>
                 </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guestName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                         <Input
                          id="guestName"
                          value={bookingData.guestName}
                          onChange={(e) => updateBookingData('guestName', e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-200 mobile-form-input mobile-focus"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail" className="text-sm font-medium text-gray-700">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                         <Input
                          id="guestEmail"
                          type="email"
                          value={bookingData.guestEmail}
                          onChange={(e) => updateBookingData('guestEmail', e.target.value)}
                          placeholder="your@email.com"
                          className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-200 mobile-form-input mobile-focus"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestPhone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                    <div className="relative">
                                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                   <Input
                        id="guestPhone"
                        value={bookingData.guestPhone}
                        onChange={(e) => updateBookingData('guestPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-200 mobile-form-input mobile-focus"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Stay Details */}
               <Card className="border border-gray-200 bg-white shadow-sm">
                 <CardHeader className="pb-3 md:pb-4">
                   <CardTitle className="flex items-center gap-2 text-gray-900">
                     <Home className="h-5 w-5" />
                     Stay Details
                   </CardTitle>
                 </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label>Check-in Date *</Label>
                      <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal mobile-calendar mobile-focus"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingData.checkIn ? format(bookingData.checkIn, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={bookingData.checkIn}
                            onSelect={(date) => {
                              updateBookingData('checkIn', date)
                              setCheckInOpen(false)
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>Check-out Date *</Label>
                      <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal mobile-calendar mobile-focus"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingData.checkOut ? format(bookingData.checkOut, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={bookingData.checkOut}
                            onSelect={(date) => {
                              updateBookingData('checkOut', date)
                              setCheckOutOpen(false)
                            }}
                            disabled={(date) => 
                              date < new Date() || 
                              (bookingData.checkIn ? date <= bookingData.checkIn : false)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div>
                      <Label htmlFor="adults">Adults</Label>
                      <Select value={bookingData.adults.toString()} onValueChange={(value) => updateBookingData('adults', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(room.maxGuests)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Adult{i + 1 > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="children">Children</Label>
                      <Select value={bookingData.children.toString()} onValueChange={(value) => updateBookingData('children', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(Math.max(0, room.maxGuests - bookingData.adults) + 1)].map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i} Children
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="numberOfRooms">Number of Rooms</Label>
                      <Select value={bookingData.numberOfRooms.toString()} onValueChange={(value) => updateBookingData('numberOfRooms', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(5)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Room{i + 1 > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {nights > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          {nights} night{nights > 1 ? 's' : ''} stay
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

                             {/* Special Requests */}
               <Card className="border border-gray-200 bg-white shadow-sm">
                 <CardHeader className="pb-3 md:pb-4">
                   <CardTitle className="flex items-center gap-2 text-gray-900">
                     <AlertCircle className="h-5 w-5" />
                     Special Requests
                   </CardTitle>
                 </CardHeader>
                <CardContent>
                  <Label htmlFor="specialRequests">Additional requests (optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={(e) => updateBookingData('specialRequests', e.target.value)}
                    placeholder="Any special requests or requirements..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Special requests cannot be guaranteed but the hotel will do its best to accommodate them.
                  </p>
                </CardContent>
              </Card>

              
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
                         <div className="sticky top-4 md:top-8 space-y-4 md:space-y-6">
                             {/* Room Summary */}
               <Card className="border border-gray-200 bg-white shadow-sm">
                 <CardHeader className="pb-3 md:pb-4">
                   <CardTitle className="flex items-center gap-2 text-gray-900">
                     <CreditCard className="h-5 w-5" />
                     Booking Summary
                   </CardTitle>
                 </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  {/* Room Image - Made Bigger */}
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                    {room.images && room.images.length > 0 ? (
                      <Image
                        src={room.images[0]}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Bed className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Room Details - Moved Below Image */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-base text-center">{room.name}</h3>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        {room.size}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {room.bedType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Max {room.maxGuests} guests
                      </div>
                    </div>
                  </div>
                  
                  {bookingData.checkIn && bookingData.checkOut && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Check-in:</span>
                          <span className="font-medium">{format(bookingData.checkIn, "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-out:</span>
                          <span className="font-medium">{format(bookingData.checkOut, "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span className="font-medium">
                            {bookingData.adults} adult{bookingData.adults > 1 ? 's' : ''}
                            {bookingData.children > 0 && `, ${bookingData.children} children`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rooms:</span>
                          <span className="font-medium">
                            {bookingData.numberOfRooms} room{bookingData.numberOfRooms > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

                             {/* Price Breakdown */}
               {nights > 0 && (
                 <Card className="border border-gray-200 bg-white shadow-sm">
                   <CardHeader className="pb-3 md:pb-4">
                     <CardTitle className="flex items-center gap-2 text-gray-900">
                       <IndianRupee className="h-5 w-5" />
                       Price Breakdown
                     </CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{formatPrice(room.price)} × {nights} night{nights > 1 ? 's' : ''} × {bookingData.numberOfRooms} room{bookingData.numberOfRooms > 1 ? 's' : ''}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    
                    {/* Dynamic Tax Breakdown */}
                    {taxBreakdown && taxBreakdown.taxes ? (
                      taxBreakdown.taxes
                        .filter((tax: any) => tax.percentage > 0 && tax.amount > 0)
                        .map((tax: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{tax.name} ({tax.percentage}%)</span>
                            <span>{formatPrice(tax.amount)}</span>
                          </div>
                        ))
                    ) : (
                      // Fallback only if no tax breakdown is available
                      taxes > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Taxes & fees</span>
                          <span>{formatPrice(taxes)}</span>
                        </div>
                      )
                    )}
                    {room.discountPercent && room.discountPercent > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({room.discountPercent}%)</span>
                        <span>-{formatPrice((room.originalPrice! - room.price) * nights)}</span>
                      </div>
                    )}
                    
                      {/* Available Offers */}
                      <div className="my-4">
                        <div className="rounded-lg border bg-amber-50 border-amber-200 p-3">
                          <div className="text-sm font-semibold text-amber-900 mb-2">Available Offers</div>
                          {promosLoading ? (
                            <div className="text-xs text-amber-800/80">Loading offers...</div>
                          ) : featuredPromos.length > 0 ? (
                            <div className="space-y-2">
                              {featuredPromos.map((p) => (
                                <div key={p.id} className="flex items-center justify-between text-xs py-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{p.code}</Badge>
                                    <span className="text-amber-900/90">- {p.title}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => {
                                      updateBookingData('promoCode', p.code)
                                      validatePromoCode(p.code)
                                    }}
                                  >
                                    Apply
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-800/80">No active offers</div>
                          )}
                        </div>
                      </div>

                    {/* Promo Code Section */}
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Label htmlFor="promoCode" className="text-sm font-medium">Have Promo Code?</Label>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id="promoCode"
                            value={bookingData.promoCode}
                            onChange={(e) => {
                              updateBookingData('promoCode', e.target.value)
                              // Clear validated promo when user types
                              if (validatedPromo) {
                                setValidatedPromo(null)
                              }
                            }}
                            placeholder="Enter promo code"
                            className="flex-1 text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => validatePromoCode(bookingData.promoCode)}
                            disabled={promoValidating || !bookingData.promoCode.trim()}
                            className="sm:w-auto w-full"
                          >
                            {promoValidating ? 'Validating...' : 'Apply'}
                          </Button>
                        </div>
                        
                        {/* Applied Promo Display */}
                        {validatedPromo && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  {validatedPromo.promoCode.title}
                                </p>
                                {validatedPromo.promoCode.description && (
                                  <p className="text-xs text-green-600">
                                    {validatedPromo.promoCode.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-green-800">
                                  -₹{validatedPromo.savings}
                                </p>
                                <p className="text-xs text-green-600">
                                  {validatedPromo.promoCode.discountType === 'percentage' 
                                    ? `${validatedPromo.promoCode.discountValue}% off`
                                    : `₹${validatedPromo.promoCode.discountValue} off`
                                  }
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setValidatedPromo(null)
                                updateBookingData('promoCode', '')
                              }}
                              className="mt-2 h-6 text-xs text-green-700 hover:text-green-800"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                     </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    
                    <Separator />
                    
                    {/* Book Now Button */}
                                                             <Button 
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 md:py-4 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button touch-friendly no-select" 
                      size="lg"
                      disabled={submitting || !bookingData.agreeToTerms}
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Book Now - {formatPrice(total)}
                        </>
                      )}
                    </Button>

                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="agreeToTermsSummary"
                        checked={bookingData.agreeToTerms}
                        onCheckedChange={(checked) => updateBookingData('agreeToTerms', checked)}
                        required
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="agreeToTermsSummary"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the terms and conditions *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          By checking this box, you agree to our{" "}
                          <button onClick={openTerms} className="underline hover:text-blue-600">terms of service</button> and{" "}
                          <button onClick={openPrivacy} className="underline hover:text-blue-600">privacy policy</button>.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

                             {/* Security Features */}
               <Card className="border border-gray-200 bg-white shadow-sm">
                 <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span>Secure payment processing</span>
                    </div>
                    {room.cancellationFree && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span>Free cancellation until 24 hours before check-in</span>
                      </div>
                    )}
                    {room.instantBooking && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Clock className="h-4 w-4" />
                        <span>Instant booking confirmation</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

                             {/* Contact Support */}
               <Card className="border border-gray-200 bg-white shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-base">Need Help?</CardTitle>
                 </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={telHref}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call {hotelInfo.primaryPhone || "+91 98765 43210"}
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                      <Mail className="h-4 w-4 mr-2" />
                      WhatsApp Support
                    </a>
                  </Button>

                  {/* Cancellation Policy - editable from backend */}
                  <div className="space-y-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800">Cancellation Policy</h4>
                    {hotelInfo.cancellationPolicy ? (
                      <p className="text-sm text-amber-900 whitespace-pre-line">{hotelInfo.cancellationPolicy}</p>
                    ) : (
                      <div className="text-sm text-amber-900 space-y-1">
                        <p>For cancellation done prior 9 AM on 10 August, 100% Refundable</p>
                        <p>For cancellation done post 9 AM on 10 August, Non Refundable</p>
                        <p>Follow safety measures advised at the hotel</p>
                        <p>
                          By proceeding, you agree to our
                          {' '}<Link href="/guest-policies" className="underline font-medium text-amber-900">Guest Policies</Link>.
                        </p>
                      </div>
                    )}
                    {hotelInfo.cancellationPolicy && (
                      <p className="text-xs text-amber-900">
                        By proceeding, you agree to our
                        {' '}<Link href="/guest-policies" className="underline font-medium text-amber-900">Guest Policies</Link>.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>

                    {/* Confirmation Modal */}
       <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
         <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-2 sm:my-4 rounded-lg mobile-modal-fix">
                       <DialogHeader className="px-4 sm:px-0">
              <DialogTitle className="text-xl font-bold text-center">Confirm Your Booking</DialogTitle>
            </DialogHeader>
           
                       {/* Success Banner */}
            <div className="flex justify-center mb-6 px-4 sm:px-0">
              <div className="bg-yellow-100 border border-yellow-200 rounded-lg px-3 py-2">
               <div className="flex items-center gap-2 text-yellow-800">
                 <span className="text-sm">🎉</span>
                 <span className="text-sm font-semibold">
                   Yay! you just saved ₹{validatedPromo ? validatedPromo.savings : 1405} on this booking!
                 </span>
               </div>
             </div>
           </div>
          
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-4 lg:px-0">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                             {/* Your Details Section */}
               <Card className="border border-gray-200 bg-white">
                 <CardHeader className="pb-3">
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                       1
                     </div>
                     <CardTitle className="text-base">Your details</CardTitle>
                   </div>
                 </CardHeader>
                                 <CardContent>
                   <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm">
                     <span className="font-medium">{bookingData.guestName}</span>
                     <span className="hidden sm:inline text-gray-500">•</span>
                     <span className="text-gray-600">{bookingData.guestEmail}</span>
                     <span className="hidden sm:inline text-gray-500">•</span>
                     <span className="text-gray-600">{bookingData.guestPhone}</span>
                   </div>
                 </CardContent>
              </Card>

                             {/* Payment Method Section */}
               <Card className="border border-gray-200 bg-white">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-base">Choose payment method to pay</CardTitle>
                   <div className="flex items-center gap-2 text-xs text-gray-600">
                     <Shield className="h-3 w-3" />
                     100% safe and secure payments
                   </div>
                 </CardHeader>
                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                         {/* Pay At Hotel Option */}
                     <div className="border-2 border-green-500 bg-green-50 rounded-lg p-3 sm:p-4 cursor-pointer touch-manipulation">
                       <div className="flex items-center justify-between mb-2">
                         <span className="font-semibold text-sm sm:text-base text-green-800">Pay At Hotel</span>
                         <div className="flex items-center gap-1">
                           <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                           <span className="text-xs text-yellow-700">No payment needed today</span>
                         </div>
                       </div>
                       <p className="text-xs sm:text-sm text-green-700">
                         We will confirm your stay without any charge. Pay directly at the hotel during your stay.
                       </p>
                     </div>

                                         {/* Pay Now Option */}
                     <div className="border-2 border-gray-200 bg-white rounded-lg p-3 sm:p-4 cursor-pointer hover:border-gray-300 touch-manipulation">
                       <div className="flex items-center justify-between">
                         <span className="font-semibold text-sm sm:text-base text-gray-800">Pay Now</span>
                         <ArrowRight className="h-3 w-3 text-gray-500" />
                       </div>
                     </div>
                  </div>

                                     {/* Book Now Button */}
                   <Button 
                     onClick={handleConfirmBooking}
                     className={`w-full font-semibold py-3 sm:py-2 text-base mobile-button touch-friendly no-select ${
                       submitting 
                         ? 'bg-gray-400 cursor-not-allowed mobile-loading' 
                         : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                     } text-white`}
                     size="lg"
                     disabled={submitting}
                     type="button"
                   >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        <span className="text-sm sm:text-base">Processing your booking...</span>
                      </div>
                    ) : (
                      "Book Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-4">
                                     {/* Hotel Info */}
                   <div className="mb-3">
                     <h3 className="font-semibold text-sm text-gray-900 mb-1">
                       {hotelInfo.name || "Super Collection O Mundhwa Chowk formerly Opal Suites"}
                     </h3>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="flex items-center">
                         <span className="text-xs font-medium">4.5</span>
                         <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-1" />
                       </div>
                       <span className="text-xs text-gray-500">(294 Ratings) • Excellent</span>
                     </div>
                    
                                         {/* Room Image */}
                     <div className="relative h-16 w-full rounded overflow-hidden bg-gray-100 mb-2">
                       {room?.images && room.images.length > 0 ? (
                         <Image
                           src={room.images[0]}
                           alt={room.name}
                           fill
                           className="object-cover"
                         />
                       ) : (
                         <div className="flex items-center justify-center h-full text-gray-400">
                           <Bed className="h-5 w-5" />
                         </div>
                       )}
                     </div>

                     {/* Stay Details */}
                     <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{calculateNights()} Night</span>
                      </div>
                                             <div className="flex items-center gap-2">
                         <CalendarIcon className="h-3 w-3 text-gray-500" />
                         <span>
                           {bookingData.checkIn && bookingData.checkOut && 
                             `${format(bookingData.checkIn, "EEE, dd MMM")} - ${format(bookingData.checkOut, "EEE, dd MMM")}`
                           }
                         </span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span>{bookingData.numberOfRooms} Room, {bookingData.adults} Guest</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Bed className="h-3 w-3 text-gray-500" />
                         <span>{room?.name || "Classic"}</span>
                       </div>
                    </div>
                  </div>

                                     <Separator className="my-3" />

                   {/* Price Breakdown */}
                   <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Room price for {calculateNights()} Night × {bookingData.numberOfRooms} Room</span>
                      <span>{formatPrice((room?.price || 0) * calculateNights() * bookingData.numberOfRooms)}</span>
                    </div>
                    
                    {room?.discountPercent && room.discountPercent > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Instant discount</span>
                        <span>-{formatPrice((room.originalPrice! - room.price) * calculateNights() * bookingData.numberOfRooms)}</span>
                      </div>
                    )}
                    
                    {validatedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>{validatedPromo.promoCode.title} Discount</span>
                        <span>-₹{validatedPromo.discountAmount}</span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    {/* Tax Breakdown */}
                    {taxBreakdown && taxBreakdown.taxes && taxBreakdown.taxes.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal (after discounts)</span>
                          <span>₹{taxBreakdown.baseAmount.toFixed(2)}</span>
                        </div>
                        {taxBreakdown.taxes
                          .filter((tax: any) => tax.percentage > 0 && tax.amount > 0)
                          .map((tax: any, index: number) => (
                            <div key={index} className="flex justify-between text-slate-600">
                              <span>{tax.name} ({tax.percentage}%)</span>
                              <span>₹{tax.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        <Separator className="my-2" />
                      </>
                    )}
                     
                     <div className="flex justify-between font-bold text-base">
                       <span>Total Payable Amount</span>
                       <span>{formatPrice(total)}</span>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policy Modals */}
      <PrivacyModal />
      <TermsModal />
    </div>
  )
}
