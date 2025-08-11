"use client"

import { useState, useEffect } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Container } from "@/components/ui/container"
import { Star, Users, Bed, Bath, Square, IndianRupee, Wifi, Car, Coffee, ArrowRight, MapPin, Phone, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
// Removed next/head usage for App Router compatibility

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
  totalRooms: number
  available: boolean
  isPromoted: boolean
  discountPercent?: number | null
  images: string[]
  shortDescription: string
  amenities: string[]
  viewType?: string
}

interface HotelInfo {
  name: string
  starRating: number
  overallRating: number
  primaryPhone: string
  address: string
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const { hotelInfo } = useHotel()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/rooms?available=true')
      if (response.ok) {
        const apiRooms = await response.json()
        setRooms(apiRooms)
        return
      }
      
      // Fallback to mock data if API fails
      const mockRooms: Room[] = [
        {
          id: "1",
          name: "Super Deluxe Room",
          slug: "super-deluxe-room",
          price: 4500,
          originalPrice: 5000,
          size: "180 sq.ft (17 sq.mt)",
          bedType: "2 Single Beds",
          bathroomCount: 1,
          maxGuests: 3,
          totalRooms: 5,
          available: true,
          isPromoted: true,
          discountPercent: 10,
          images: ["https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg"],
          shortDescription: "Elegant room with modern amenities and city view",
          amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV"],
          viewType: "City View"
        },
        {
          id: "2",
          name: "Presidential Suite",
          slug: "presidential-suite",
          price: 12000,
          originalPrice: 15000,
          size: "500 sq.ft (46 sq.mt)",
          bedType: "1 King Bed",
          bathroomCount: 2,
          maxGuests: 4,
          totalRooms: 2,
          available: true,
          isPromoted: false,
          discountPercent: 20,
          images: ["https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg"],
          shortDescription: "Luxurious suite with separate living area and premium amenities",
          amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV", "Jacuzzi", "Butler Service"],
          viewType: "Ocean View"
        },
        {
          id: "3",
          name: "Executive Room",
          slug: "executive-room",
          price: 6500,
          size: "220 sq.ft (20 sq.mt)",
          bedType: "1 Queen Bed",
          bathroomCount: 1,
          maxGuests: 2,
          totalRooms: 8,
          available: true,
          isPromoted: false,
          images: ["https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg"],
          shortDescription: "Spacious room designed for business travelers",
          amenities: ["Free WiFi", "Air Conditioning", "Work Desk", "TV", "Coffee Maker"],
          viewType: "Garden View"
        },
        {
          id: "4",
          name: "Family Suite",
          slug: "family-suite",
          price: 8500,
          originalPrice: 9500,
          size: "350 sq.ft (32 sq.mt)",
          bedType: "2 Double Beds",
          bathroomCount: 2,
          maxGuests: 6,
          totalRooms: 3,
          available: true,
          isPromoted: true,
          discountPercent: 11,
          images: ["https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg"],
          shortDescription: "Perfect for families with connecting rooms and kid-friendly amenities",
          amenities: ["Free WiFi", "Air Conditioning", "Mini Fridge", "TV", "Kids Play Area"],
          viewType: "Pool View"
        }
      ]
      setRooms(mockRooms)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const RoomCard = ({ room }: { room: Room }) => (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02] relative">
      {/* Premium overlay for promoted rooms */}
      {room.isPromoted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 z-10" />
      )}
      
      <div className="relative overflow-hidden">
        <Image
          src={room.images[0]}
          alt={room.name}
          width={400}
          height={250}
          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Badges with improved styling */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {room.isPromoted && (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              Promoted
            </Badge>
          )}
          {room.discountPercent && room.discountPercent > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg backdrop-blur-sm font-semibold">
              {room.discountPercent}% OFF
            </Badge>
          )}
        </div>
        
        {/* Availability with improved styling */}
        <div className="absolute top-4 right-4 z-20">
          <Badge 
            variant={room.available ? "default" : "secondary"} 
            className={`${
              room.available 
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" 
                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
            } border-0 shadow-lg backdrop-blur-sm font-semibold`}
          >
            {room.available ? "✓ Available" : "✗ Sold Out"}
          </Badge>
        </div>
        
                          {/* Enhanced price overlay */}
          <div className="absolute bottom-4 right-4 text-right z-20">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-white/30">
              <div className="flex items-center gap-2 justify-end mb-1">
                <div className="text-lg font-bold text-white drop-shadow-lg">
                  {formatPrice(room.price)}
                </div>
                {room.originalPrice && room.originalPrice > room.price && (
                  <div className="text-xs text-red-200 line-through font-medium">
                    {formatPrice(room.originalPrice)}
                  </div>
                )}
              </div>
              <div className="text-xs text-white/80 font-medium">/night</div>
            </div>
          </div>
        
        {/* View type badge */}
        {room.viewType && (
          <div className="absolute bottom-4 left-4 z-20">
            <Badge className="bg-black/60 hover:bg-black/70 text-white border-0 backdrop-blur-sm">
              {room.viewType}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6 space-y-5">
        {/* Room name and rating */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
            {room.name}
          </h3>
                     <div className="flex items-center gap-2">
             <div className="flex items-center">
               {[...Array(5)].map((_, i) => (
                 <Star 
                   key={i} 
                   className={`h-3 w-3 ${
                     i < 4 ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                   }`} 
                 />
               ))}
             </div>
             <span className="text-xs text-gray-600 font-medium">4.8 (120 reviews)</span>
           </div>
        </div>
        
                 {/* Enhanced room details grid */}
                   <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group-hover:bg-amber-50 transition-colors duration-300">
              <div className="p-1.5 bg-white rounded-md shadow-sm">
                <Square className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{room.size}</div>
                <div className="text-xs text-gray-500">Room Size</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group-hover:bg-amber-50 transition-colors duration-300">
              <div className="p-1.5 bg-white rounded-md shadow-sm">
                <Bed className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{room.bedType}</div>
                <div className="text-xs text-gray-500">Bed Type</div>
              </div>
            </div>
          </div>
        
                 {/* Key amenities with improved styling */}
         <div className="space-y-2">
           <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
             Key Amenities
           </div>
           <div className="flex flex-wrap gap-2">
             {room.amenities.slice(0, 4).map((amenity, index) => (
               <Badge 
                 key={index} 
                 variant="outline" 
                 className="text-xs bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors duration-300"
               >
                 {amenity}
               </Badge>
             ))}
             {room.amenities.length > 4 && (
               <Badge 
                 variant="outline" 
                 className="text-xs bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors duration-300"
               >
                 +{room.amenities.length - 4} more
               </Badge>
             )}
           </div>
         </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
                 <div className="flex gap-3 w-full">
           <Button 
             variant="outline" 
             className="flex-1 h-10 border-2 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 font-semibold text-sm" 
             asChild
           >
             <Link href={`/rooms/${room.slug}`}>
               <Eye className="mr-2 h-3 w-3" />
               View Details
             </Link>
           </Button>
           <Button 
             className="flex-1 h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm" 
             asChild
           >
             <Link href={`/rooms/${room.slug}/book`}>
               Book Now
               <ArrowRight className="ml-2 h-3 w-3" />
             </Link>
           </Button>
         </div>
      </CardFooter>
    </Card>
  )

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
      <Skeleton className="w-full h-72" />
      <CardContent className="p-6 space-y-5">
        {/* Room name and rating skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
                     <div className="flex items-center gap-2">
             <div className="flex gap-1">
               {[...Array(5)].map((_, i) => (
                 <Skeleton key={i} className="h-3 w-3 rounded" />
               ))}
             </div>
             <Skeleton className="h-3 w-20" />
           </div>
        </div>
        
                 {/* Room details grid skeleton */}
                   <div className="grid grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Skeleton className="h-6 w-6 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        
                 {/* Amenities skeleton */}
         <div className="space-y-2">
           <Skeleton className="h-3 w-20" />
           <div className="flex gap-2">
             <Skeleton className="h-6 w-16" />
             <Skeleton className="h-6 w-20" />
             <Skeleton className="h-6 w-18" />
             <Skeleton className="h-6 w-14" />
           </div>
         </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
                 <div className="flex gap-3 w-full">
           <Skeleton className="h-10 flex-1" />
           <Skeleton className="h-10 flex-1" />
         </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-amber-100">
          <div className="absolute inset-0 bg-amber-50/30 opacity-50"></div>
          <Container className="relative py-16">
            <div className="text-center max-w-4xl mx-auto">
              {hotelInfo ? (
                <>
                  {/* Hotel Badge */}
                  <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-amber-200">
                    <div className="flex items-center">
                      {[...Array(hotelInfo.starRating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{hotelInfo.name || "Grand Luxe Hotel"}</span>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <span className="text-sm font-semibold text-amber-600">{hotelInfo.overallRating || 4.8}/5 Rating</span>
                  </div>
                  
                  {/* Main Title */}
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 bg-clip-text text-transparent">
                    Choose Your Perfect Room
                  </h1>
                  
                                     {/* Subtitle */}
                   <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                     Experience luxury and comfort in our carefully designed accommodations, where every detail is crafted for your ultimate satisfaction
                   </p>
                </>
              ) : (
                                 <div className="space-y-6">
                   <Skeleton className="h-12 w-80 mx-auto rounded-full" />
                   <Skeleton className="h-16 w-96 mx-auto" />
                   <Skeleton className="h-8 w-96 mx-auto" />
                 </div>
              )}
            </div>
          </Container>
        </div>

        {/* Enhanced Rooms Grid */}
        <Container className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? [...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)
              : rooms.map((room) => <RoomCard key={room.id} room={room} />)
            }
          </div>
          
          {!loading && rooms.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🏨</div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">No Rooms Available</h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                We're currently updating our room inventory. Please check back soon for our latest offerings.
              </p>
            </div>
          )}
        </Container>

        {/* Enhanced Call to Action */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-30"></div>
          <Container className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience Luxury?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
              Book your perfect room today and enjoy world-class hospitality with personalized service
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Phone className="mr-3 h-5 w-5" />
                Call for Reservations
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                View All Services
              </Button>
            </div>
          </Container>
        </div>
    </div>
  )
}


