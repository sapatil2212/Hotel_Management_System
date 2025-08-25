"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { Star, Bed, Square, ArrowRight, Eye, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  availableRoomsCount?: number
  isSoldOut?: boolean
  isPromoted: boolean
  discountPercent?: number | null
  images: string[]
  shortDescription: string
  amenities: string[]
  viewType?: string
}

const FeaturedRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms?available=true')
      if (response.ok) {
        const apiRooms = await response.json()
        // Show only first 3 rooms for featured section
        setRooms(apiRooms.slice(0, 3))
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
          available: false,
          availableRoomsCount: 0,
          isSoldOut: true,
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
          availableRoomsCount: 3,
          isSoldOut: false,
          isPromoted: false,
          images: ["https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg"],
          shortDescription: "Spacious room designed for business travelers",
          amenities: ["Free WiFi", "Air Conditioning", "Work Desk", "TV", "Coffee Maker"],
          viewType: "Garden View"
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
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 bg-white hover:bg-white hover:scale-[1.02] relative">
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
          {room.isSoldOut ? (
            <Badge 
              variant="destructive" 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg backdrop-blur-sm font-semibold text-sm px-3 py-1"
            >
              ✗ SOLD OUT
            </Badge>
          ) : (
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg backdrop-blur-sm font-semibold text-sm px-3 py-1"
            >
              ✓ Available
              {room.availableRoomsCount && room.availableRoomsCount < room.totalRooms && (
                <span className="ml-1 text-xs">({room.availableRoomsCount}/{room.totalRooms})</span>
              )}
            </Badge>
          )}
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
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg group-hover:bg-amber-50 transition-colors duration-300">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
              <Square className="h-3 w-3 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">{room.size}</div>
              <div className="text-xs text-gray-500">Room Size</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg group-hover:bg-amber-50 transition-colors duration-300">
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
            className={`flex-1 h-10 font-semibold text-sm transition-all duration-300 ${
              room.isSoldOut 
                ? "bg-gray-400 cursor-not-allowed opacity-60" 
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl"
            }`}
            disabled={room.isSoldOut}
            asChild={!room.isSoldOut}
          >
            {room.isSoldOut ? (
              <span className="flex items-center justify-center">
                Sold Out
                <X className="ml-2 h-3 w-3" />
              </span>
            ) : (
              <Link href={`/rooms/${room.slug}/book`}>
                Book Now
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  if (loading) {
    return (
      <section className="bg-white">
        <Container className="bg-white">
          <div className="text-center mb-8 md:mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs md:text-sm">
              Featured Accommodations
            </Badge>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 bg-clip-text text-transparent">
                Our Finest Rooms
              </span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular accommodations, designed for your ultimate comfort and luxury
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="bg-gray-200 h-72 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="bg-white -mt-4 md:-mt-8">
      <Container className="bg-white">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-12 pt-4 md:pt-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs md:text-sm">
            Featured Accommodations
          </Badge>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 bg-clip-text text-transparent">
              Our Finest Rooms
            </span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular accommodations, designed for your ultimate comfort and luxury
          </p>
        </div>

        {/* Featured Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* View All Rooms Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
            asChild
          >
            <Link href="/rooms">
              View All Rooms
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}

export default FeaturedRooms
