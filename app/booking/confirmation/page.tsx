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
  Loader,
  Building2,
  CreditCard,
  FileText,
  ArrowLeft
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
  baseAmount?: number
  gstAmount?: number
  serviceTaxAmount?: number
  otherTaxAmount?: number
  totalTaxAmount?: number
  specialRequests?: string
  status: string
  paymentMethod?: string
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
      price: number
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
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
      fetchHotelInfo()
    } else {
      setLoading(false)
      setError('No booking ID provided')
    }
  }, [bookingId])

  const fetchBookingDetails = async (retryCount = 0) => {
    try {
      console.log(`Fetching booking details for ID: ${bookingId} (attempt ${retryCount + 1})`);
      
      const response = await fetch(`/api/bookings/${bookingId}`)
      console.log('Booking API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json()
        console.log('Booking data received:', data);
        console.log('Tax amounts:', {
          gstAmount: data.gstAmount,
          serviceTaxAmount: data.serviceTaxAmount,
          otherTaxAmount: data.otherTaxAmount
        });
        console.log('Full booking data:', JSON.stringify(data, null, 2));
        setBookingDetails(data)
        setError(null)
        
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
        
        // If it's a 404 and we haven't retried too many times, retry after a delay
        if (response.status === 404 && retryCount < 3) {
          console.log(`Booking not found, retrying in ${(retryCount + 1) * 1000}ms...`);
          setTimeout(() => {
            fetchBookingDetails(retryCount + 1)
          }, (retryCount + 1) * 1000)
          return
        }
        
        setError(`Failed to fetch booking details: ${response.status} - ${errorText}`)
        toast({
          title: "Error",
          description: `Failed to fetch booking details: ${response.status} - ${errorText}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      
      // If it's a network error and we haven't retried too many times, retry
      if (retryCount < 3) {
        console.log(`Network error, retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => {
          fetchBookingDetails(retryCount + 1)
        }, (retryCount + 1) * 1000)
        return
      }
      
      setError(`Failed to fetch booking details: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    }
  }

  // Set loading to false when we have either booking details or an error
  useEffect(() => {
    if (bookingDetails || error) {
      setLoading(false)
    }
  }, [bookingDetails, error])

  // Also set loading to false after a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  const handleDownloadPDF = async () => {
    if (!bookingDetails) return
    
    setDownloading(true)
    setDownloadSuccess(false)
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
        
        setDownloadSuccess(true)
        toast({
          title: "Success",
          description: "Invoice downloaded successfully"
        })
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setDownloadSuccess(false)
        }, 3000)
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
          {error && (
            <p className="text-sm text-amber-600 mt-2">
              {error.includes('404') ? 'Booking not found, retrying...' : 'Retrying...'}
            </p>
          )}
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
            {error || 'The booking you\'re looking for could not be found.'}
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
      <Container className="py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 relative">
          {/* Back to Home Button - Upper Left Corner */}
          <div className="absolute top-4 left-4">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-gray-50"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Action Buttons - Upper Right Corner */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-white hover:bg-gray-50 p-2"
              title={downloading ? 'Generating PDF...' : downloadSuccess ? 'Downloaded Successfully' : 'Download Invoice'}
            >
              {downloading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : downloadSuccess ? (
                <Check className="h-4 w-4 text-green-600 animate-pulse" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
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
              }}
              className="bg-white hover:bg-gray-50 p-2"
              title="Share Booking"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>

          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-sm text-muted-foreground">
              Thank you for choosing {hotelInfo?.name || 'our hotel'}. Your reservation has been confirmed and Room {bookingDetails.room.roomNumber} has been allocated to you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Booking Reference */}
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Booking Reference
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-mono font-semibold text-base">{bookingDetails.id}</div>
                  <div className="text-xs text-muted-foreground">
                    Booking Date & Time: {formatDateTime(bookingDetails.createdAt)}
                  </div>
                </CardContent>
              </Card>

              {/* Guest Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label>Full Name</Label>
                    <div className="font-medium text-sm">{bookingDetails.guestName}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="font-medium text-sm">{bookingDetails.guestEmail}</div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <div className="font-medium text-sm">{bookingDetails.guestPhone}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Stay Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Stay Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Check-in</Label>
                      <div className="font-medium text-sm">{formatDate(bookingDetails.checkIn)}</div>
                    </div>
                    <div>
                      <Label>Check-out</Label>
                      <div className="font-medium text-sm">{formatDate(bookingDetails.checkOut)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Duration</Label>
                      <div className="font-medium text-sm">{bookingDetails.nights} night{bookingDetails.nights > 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <Label>Guests</Label>
                      <div className="font-medium text-sm">
                        {bookingDetails.adults} adult{bookingDetails.adults > 1 ? 's' : ''}
                        {bookingDetails.children > 0 && `, ${bookingDetails.children} children`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Details */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Room Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Room Type</Label>
                      <div className="font-medium text-sm">{bookingDetails.room.roomType.name}</div>
                    </div>
                    <div>
                      <Label>Room Number</Label>
                      <div className="font-medium text-sm">{bookingDetails.room.roomNumber}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Floor</Label>
                      <div className="font-medium text-sm">{bookingDetails.room.floorNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <Label>Room Size</Label>
                      <div className="font-medium text-sm">{bookingDetails.room.roomType.size}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Bed Type</Label>
                      <div className="font-medium text-sm">{bookingDetails.room.roomType.bedType}</div>
                    </div>
                    <div>
                      <Label>Max Guests</Label>
                      <div className="font-medium text-sm">{bookingDetails.room.roomType.maxGuests}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                        {/* Right Column */}
            <div className="space-y-4">
              {/* Payment Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Base Amount */}
                  <div className="flex justify-between text-sm">
                    <span>Room Rate ({bookingDetails.nights} nights × {formatCurrency(bookingDetails.room.roomType.price)}):</span>
                    <span>{formatCurrency(bookingDetails.room.roomType.price * bookingDetails.nights)}</span>
                  </div>
                  
                  {/* GST Charges */}
                  {bookingDetails.gstAmount && bookingDetails.gstAmount > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span>GST Charges:</span>
                      <span>{formatCurrency(bookingDetails.gstAmount)}</span>
                    </div>
                  ) : null}
                  
                  {/* Service Tax */}
                  {bookingDetails.serviceTaxAmount && bookingDetails.serviceTaxAmount > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span>Service Tax:</span>
                      <span>{formatCurrency(bookingDetails.serviceTaxAmount)}</span>
                    </div>
                  ) : null}
                  
                  {/* Other Taxes */}
                  {bookingDetails.otherTaxAmount && bookingDetails.otherTaxAmount > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span>Other Taxes:</span>
                      <span>{formatCurrency(bookingDetails.otherTaxAmount)}</span>
                    </div>
                  ) : null}
                  
                  {/* Promo Code / Discount */}
                  {bookingDetails.discountAmount && bookingDetails.discountAmount > 0 ? (
                    <div className="flex justify-between text-red-600 text-sm">
                      <span>Discount {bookingDetails.promoCode ? `(${bookingDetails.promoCode.code})` : ''}:</span>
                      <span>-{formatCurrency(bookingDetails.discountAmount)}</span>
                    </div>
                  ) : null}
                  
                  <Separator />
                  
                  {/* Total Amount */}
                  <div className="flex justify-between items-center text-base font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(bookingDetails.totalAmount)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Payment Method: {bookingDetails.paymentMethod ? bookingDetails.paymentMethod.replace(/_/g, ' ') : 'Pay at Hotel'}
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Terms and Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-1">
                    <p><strong>Standard Terms:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>All bookings are subject to room availability at the time of check-in.</li>
                      <li>Room numbers are allocated but may be changed at the time of check-in based on operational requirements.</li>
                      <li>Check-in time: 3:00 PM | Check-out time: 11:00 AM</li>
                      <li>Early check-in and late check-out are subject to availability and may incur additional charges.</li>
                      <li>Valid government-issued photo ID is required at check-in.</li>
                      <li>Payment is due as per the selected payment method.</li>
                      <li>Cancellation policies apply as per hotel terms.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4 text-center">
                  <p className="font-semibold mb-1 text-sm">Thank you for choosing us! We look forward to your stay.</p>
                  <p className="text-xs text-muted-foreground mb-1">This is a computer-generated confirmation. No signature required.</p>
                  <p className="text-xs text-muted-foreground mb-1">For any queries, please contact us using the information below.</p>
                  <p className="text-xs text-muted-foreground">Generated on {formatDate(new Date().toISOString())}</p>
                </CardContent>
              </Card>
            </div>
          </div>



        </div>
      </Container>

      {/* Contact Support - Outside Main Container */}
      <div className="bg-gray-50 pb-8">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-3 text-lg">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our customer service team is available 24/7 to assist you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hotelInfo?.primaryPhone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${hotelInfo.primaryPhone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Support
                    </a>
                  </Button>
                )}
                {hotelInfo?.primaryEmail && (
                  <Button variant="outline" asChild>
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
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>
}
