"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, MapPin, Star, Bed, Wifi, Car, Utensils, Dumbbell, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useHotel } from "@/contexts/hotel-context"

interface Room {
  id: string
  roomNumber: string
  floorNumber?: number
  status: string
  roomType: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    size: string
    bedType: string
    maxGuests: number
    amenities: string[]
    images: string[]
  }
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const { hotelInfo } = useHotel()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  
     // Form state
   const [bookingData, setBookingData] = useState({
     checkIn: searchParams.get('checkIn') || "",
     checkOut: searchParams.get('checkOut') || "",
     adults: parseInt(searchParams.get('adults') || '1'),
     children: parseInt(searchParams.get('children') || '0'),
     guests: parseInt(searchParams.get('guests') || '1'),
     roomType: "all"
   })

  useEffect(() => {
    fetchAvailableRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [rooms, bookingData])

  const fetchAvailableRooms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/rooms/available-for-booking')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = rooms.filter(room => room.status === 'available')
    
         // Filter by room type if selected
     if (bookingData.roomType && bookingData.roomType !== "all") {
       filtered = filtered.filter(room => 
         room.roomType.name.toLowerCase().includes(bookingData.roomType.toLowerCase())
       )
     }
    
    // Filter by guest capacity
    const totalGuests = bookingData.adults + bookingData.children
    filtered = filtered.filter(room => room.roomType.maxGuests >= totalGuests)
    
    setFilteredRooms(filtered)
  }

  const updateBookingData = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: { [key: string]: any } = {
      'WiFi': Wifi,
      'Parking': Car,
      'Restaurant': Utensils,
      'Gym': Dumbbell,
      'Room Service': Phone
    }
    return amenityMap[amenity] || Bed
  }

  const telHref = `tel:${hotelInfo?.primaryPhone || '+1234567890'}`
  const waUrl = `https://wa.me/${hotelInfo?.primaryPhone?.replace(/\D/g, '') || '1234567890'}?text=Hi, I'm interested in booking a room at ${hotelInfo?.name || 'your hotel'}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available rooms...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
              <p className="text-gray-600 mt-2">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available for your dates
              </p>
            </div>
            
            {/* Quick Contact */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex items-center gap-2">
                <a href={telHref}>
                  <Phone className="h-4 w-4" />
                  Call to Book
                </a>
              </Button>
              <Button asChild variant="outline" className="flex items-center gap-2">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label htmlFor="checkIn" className="text-sm font-medium">Check-in Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="checkIn"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => updateBookingData('checkIn', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label htmlFor="checkOut" className="text-sm font-medium">Check-out Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="checkOut"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => updateBookingData('checkOut', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Adults */}
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-sm font-medium">Adults</Label>
                  <Select 
                    value={bookingData.adults.toString()} 
                    onValueChange={(value) => updateBookingData('adults', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Adults" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Adult' : 'Adults'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Children */}
                <div className="space-y-2">
                  <Label htmlFor="children" className="text-sm font-medium">Children</Label>
                  <Select 
                    value={bookingData.children.toString()} 
                    onValueChange={(value) => updateBookingData('children', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Children" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Child' : 'Children'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <Label htmlFor="roomType" className="text-sm font-medium">Room Type</Label>
                  <Select 
                    value={bookingData.roomType} 
                    onValueChange={(value) => updateBookingData('roomType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Room Type" />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="all">Any Room Type</SelectItem>
                       <SelectItem value="deluxe">Deluxe Room</SelectItem>
                       <SelectItem value="suite">Suite</SelectItem>
                       <SelectItem value="premium">Premium Room</SelectItem>
                       <SelectItem value="family">Family Room</SelectItem>
                     </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={filterRooms}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600"
                >
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rooms Grid */}
          <div className="lg:col-span-3">
            {filteredRooms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms available</h3>
                  <p className="text-gray-600 mb-4">
                    No rooms match your current search criteria. Try adjusting your filters or dates.
                  </p>
                                     <Button 
                     onClick={() => {
                       setBookingData({
                         checkIn: "",
                         checkOut: "",
                         adults: 1,
                         children: 0,
                         guests: 1,
                         roomType: "all"
                       })
                     }}
                     variant="outline"
                   >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      {room.roomType.images && room.roomType.images[0] ? (
                        <img
                          src={room.roomType.images[0]}
                          alt={room.roomType.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                          <Bed className="h-12 w-12 text-amber-600" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-green-600">
                        Available
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {room.roomType.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Room {room.roomNumber}
                            {room.floorNumber && ` • Floor ${room.floorNumber}`}
                          </p>
                          <div className="flex items-center gap-1 text-amber-600">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(room.roomType.price, room.roomType.currency)}
                          </p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>

                                             <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                         {room.roomType.description}
                       </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          <Bed className="h-3 w-3 mr-1" />
                          {room.roomType.bedType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Max {room.roomType.maxGuests} guests
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {room.roomType.size}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-6">
                        {room.roomType.amenities?.slice(0, 4).map((amenity, index) => {
                          const Icon = getAmenityIcon(amenity)
                          return (
                            <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                              <Icon className="h-3 w-3" />
                              <span>{amenity}</span>
                            </div>
                          )
                        })}
                        {room.roomType.amenities && room.roomType.amenities.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{room.roomType.amenities.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600"
                          asChild
                        >
                          <Link href={`/rooms/${room.roomType.name.toLowerCase().replace(/\s+/g, '-')}/book?roomId=${room.id}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${bookingData.adults}&children=${bookingData.children}`}>
                            Book Now
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/rooms/${room.roomType.name.toLowerCase().replace(/\s+/g, '-')}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
