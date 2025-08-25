"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/ui/container"
import { 
  Check, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Download,
  Share,
  Home,
  Clock,
  Loader
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface BookingDetails {
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
  specialRequests?: string
  status: string
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
    }
  }
  promoCode?: {
    code: string
    title: string
  }
  createdAt: string
}

interface HotelInfo {
  name: string
  address?: string
  primaryPhone?: string
  primaryEmail?: string
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
      fetchHotelInfo()
    } else {
      setLoading(false)
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      console.log('Fetching booking details for ID:', bookingId);
      
      const response = await fetch(`/api/bookings/${bookingId}`)
      console.log('Booking API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json()
        console.log('Booking data received:', data);
        setBookingDetails(data)
        
        // Automatically generate invoice if it doesn't exist
        try {
          const invoiceResponse = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId })
          })
          
          if (invoiceResponse.ok) {
            const invoice = await invoiceResponse.json()
            console.log('Invoice generated:', invoice.invoiceNumber)
          }
        } catch (error) {
          console.error('Error generating invoice:', error)
        }
      } else {
        const errorText = await response.text();
        console.error('Booking API error:', response.status, errorText);
        
        toast({
          title: "Error",
          description: `Failed to fetch booking details: ${response.status} - ${errorText}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast({
        title: "Error",
        description: `Failed to fetch booking details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  const fetchHotelInfo = async () => {
    try {
      const response = await fetch('/api/hotel-info')
      if (response.ok) {
        const data = await response.json()
        setHotelInfo(data)
      }
    } catch (error) {
      console.error('Error fetching hotel info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!bookingDetails) return
    
    setDownloading(true)
    try {
      const response = await fetch(`/api/bookings/${bookingDetails.id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `booking-invoice-${bookingDetails.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Invoice downloaded successfully"
        })
      } else {
        throw new Error('Failed to download PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive"
      })
    } finally {
      setDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Container className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading booking details...</p>
        </Container>
      </div>
    )
  }

  if (!bookingId || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Container className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The booking you're looking for could not be found.
          </p>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for choosing {hotelInfo?.name || 'our hotel'}. Your reservation has been confirmed and Room {bookingDetails.room.roomNumber} has been allocated to you.
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Booking ID</Label>
                  <div className="font-mono font-semibold">{bookingDetails.id}</div>
                </div>
                <div>
                  <Label>Room Allocated</Label>
                  <div className="font-medium">
                    Room {bookingDetails.room.roomNumber}
                    {bookingDetails.room.floorNumber && ` (Floor ${bookingDetails.room.floorNumber})`}
                  </div>
                  <div className="text-sm text-muted-foreground">{bookingDetails.room.roomType.name}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Check-in</div>
                    <div className="font-medium">{formatDate(bookingDetails.checkIn)}</div>
                    <div className="text-xs text-muted-foreground">3:00 PM onwards</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Check-out</div>
                    <div className="font-medium">{formatDate(bookingDetails.checkOut)}</div>
                    <div className="text-xs text-muted-foreground">11:00 AM</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{bookingDetails.nights} night{bookingDetails.nights > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Guests</div>
                    <div className="font-medium">
                      {bookingDetails.adults} Adult{bookingDetails.adults > 1 ? 's' : ''}
                      {bookingDetails.children > 0 && `, ${bookingDetails.children} Child${bookingDetails.children > 1 ? 'ren' : ''}`}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Guest</Label>
                <div className="font-medium">{bookingDetails.guestName}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <div className="font-medium">{bookingDetails.guestEmail}</div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="font-medium">{bookingDetails.guestPhone}</div>
                </div>
              </div>
              {bookingDetails.specialRequests && (
                <div>
                  <Label>Special Requests</Label>
                  <div className="font-medium">{bookingDetails.specialRequests}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Room Size</Label>
                  <div className="font-medium">{bookingDetails.room.roomType.size}</div>
                </div>
                <div>
                  <Label>Bed Type</Label>
                  <div className="font-medium">{bookingDetails.room.roomType.bedType}</div>
                </div>
              </div>
              <div>
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {bookingDetails.room.roomType.amenities?.map((amenity: string, index: number) => (
                    <Badge key={index} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
              {bookingDetails.room.roomType.features && bookingDetails.room.roomType.features.length > 0 && (
                <div>
                  <Label>Features</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bookingDetails.room.roomType.features?.map((feature: string, index: number) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookingDetails.originalAmount && bookingDetails.discountAmount && bookingDetails.discountAmount > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span>Original Amount:</span>
                    <span>{formatCurrency(bookingDetails.originalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount {bookingDetails.promoCode ? `(${bookingDetails.promoCode.code})` : ''}:</span>
                    <span>-{formatCurrency(bookingDetails.discountAmount)}</span>
                  </div>
                  <Separator />
                </>
              ) : null}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount Paid</span>
                <span>{formatCurrency(bookingDetails.totalAmount)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Payment confirmation has been sent to your email address.
              </p>
            </CardContent>
          </Card>

          {/* Hotel Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{hotelInfo?.name || 'Hotel Management System'}</div>
                  {hotelInfo?.address && (
                    <div className="text-sm text-muted-foreground">{hotelInfo.address}</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotelInfo?.primaryPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{hotelInfo.primaryPhone}</div>
                    </div>
                  </div>
                )}
                {hotelInfo?.primaryEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{hotelInfo.primaryEmail}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4" />
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>• Please bring a valid photo ID for check-in</li>
                <li>• Early check-in and late check-out are subject to availability</li>
                <li>• Free cancellation available until 24 hours before check-in</li>
                <li>• Contact the hotel directly for any special requests or modifications</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Generating PDF...' : 'Download Invoice'}
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Booking Confirmation - ${bookingDetails.id}`,
                  text: `My booking at ${hotelInfo?.name || 'hotel'} is confirmed! Room ${bookingDetails.room.roomNumber} from ${formatDate(bookingDetails.checkIn)} to ${formatDate(bookingDetails.checkOut)}`,
                  url: window.location.href
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                toast({
                  title: "Link Copied",
                  description: "Booking link copied to clipboard"
                })
              }
            }}>
              <Share className="mr-2 h-4 w-4" />
              Share Booking
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8 p-6 bg-white rounded-lg border">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our customer service team is available 24/7 to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {hotelInfo?.primaryPhone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${hotelInfo.primaryPhone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Support
                  </a>
                </Button>
              )}
              {hotelInfo?.primaryEmail && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${hotelInfo.primaryEmail}?subject=Booking Support - ${bookingDetails.id}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Support
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>
}
