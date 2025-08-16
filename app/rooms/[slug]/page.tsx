"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Container } from "@/components/ui/container"
import { 
  Star, 
  Users, 
  Bed, 
  Bath, 
  Square, 
  IndianRupee, 
  Wifi, 
  Car, 
  Coffee, 
  ArrowRight, 
  MapPin, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  MessageCircle,
  Calendar,
  Clock,
  Shield,
  Award,
  Heart,
  ArrowsUpFromLine
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import { useHotel } from "@/contexts/hotel-context"

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
  description: string
  shortDescription: string
  highlights: string
  amenities: string[]
  features: string[]
  viewType?: string
  floorNumber?: number
  roomNumber?: string
  cancellationFree: boolean
  instantBooking: boolean
}

interface Review {
  id: string
  guestName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

interface FAQ {
  question: string
  answer: string
}

export default function RoomDetailsPage() {
  const params = useParams()
  const { hotelInfo } = useHotel()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchRoom()
  }, [params.slug, refreshKey])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      
      // Add timestamp and random number to prevent any caching
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
      
      if (response.ok) {
        const rooms = await response.json()
        const currentRoom = rooms.find((r: any) => r.slug === params.slug)
        
        if (currentRoom) {
          setRoom(currentRoom)
        } else {
          setRoom(mockRoom)
        }
      } else {
        setRoom(mockRoom)
      }
    } catch (error) {
      console.error('Error fetching room:', error)
      setRoom(mockRoom)
    } finally {
      setLoading(false)
    }
  }

  // Mock data - fallback when API fails
  const mockRoom: Room = {
    id: "1",
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
    isPromoted: true,
    discountPercent: 10,
    images: [
      "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg",
      "https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg",
      "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg"
    ],
    description: "Experience unparalleled luxury in our Presidential Suite. This spacious accommodation features a separate living and dining area, premium amenities, and breathtaking panoramic views. Designed for discerning guests who expect nothing but the finest, this suite offers butler service, marble bathrooms with jacuzzi, and exquisite furnishings throughout.",
    shortDescription: "Luxurious suite with separate living area and premium amenities",
    highlights: "• Panoramic city views from floor-to-ceiling windows\n• Premium Egyptian cotton bedding for ultimate comfort\n• Marble bathroom with rainfall shower and luxury toiletries\n• Complimentary high-speed WiFi throughout your stay\n• 24/7 room service with extensive menu options\n• Climate control with individual temperature settings",
    amenities: [
      "Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV", "Safe", "Jacuzzi", "Butler Service",
      "Coffee/Tea Maker", "Telephone", "Wake-up Service", "Daily Housekeeping", "Premium Toiletries", "Work Desk"
    ],
    features: [
      "Ocean View", "Non-Smoking", "Soundproof", "Balcony", "Butler Service", "Jacuzzi", "Separate Living Area"
    ],
    viewType: "City View",
    floorNumber: 12,
    roomNumber: "1205",
    cancellationFree: true,
    instantBooking: true
  }

  const mockReviews: Review[] = [
    {
      id: "1",
      guestName: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely stunning room with amazing city views! The service was impeccable and the amenities were top-notch. Will definitely stay here again.",
      date: "2024-01-15",
      verified: true
    },
    {
      id: "2",
      guestName: "Michael Chen",
      rating: 4,
      comment: "Great room for business travelers. The work desk was spacious and the WiFi was fast. Room service was prompt and delicious.",
      date: "2024-01-10",
      verified: true
    },
    {
      id: "3",
      guestName: "Emily Davis",
      rating: 5,
      comment: "Perfect for our anniversary getaway. The room was beautifully decorated and the bathroom was luxurious. Highly recommend!",
      date: "2024-01-05",
      verified: true
    }
  ]

  // FAQs are now managed from backend via hotelInfo.faqs



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Contact helpers
  const normalizePhone = (value?: string) => (value || "").replace(/\D/g, "")
  const displayPhone = hotelInfo.primaryPhone || "+91 98765 43210"
  const telHref = `tel:${(hotelInfo.primaryPhone || '').replace(/[^+\d]/g, '') || '+919876543210'}`
  const waNumber = normalizePhone(hotelInfo.whatsappPhone || hotelInfo.primaryPhone)
  const waUrl = `https://wa.me/${waNumber || '919876543210'}?text=${encodeURIComponent(`Hi, I'm interested in ${room?.name || 'a room'} at ${hotelInfo.name || 'your hotel'}.`)}`

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === room!.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? room!.images.length - 1 : prev - 1
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-96 bg-gray-200"></div>
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
          <p className="text-muted-foreground mb-4">The room you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/rooms">Back to Rooms</Link>
          </Button>
        </div>
      </div>
    )
  }

  const structuredData = room ? {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotelInfo.name || "Grand Luxe Hotel",
    "description": hotelInfo.description || "Luxury hotel offering premium accommodations and world-class hospitality",
    "url": hotelInfo.directionsUrl || "https://grandluxehotel.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": hotelInfo.address || "123 Luxury Street, Premium City, State 12345",
      "addressCountry": "IN"
    },
    "telephone": hotelInfo.primaryPhone || "+91 98765 43210",
    "starRating": {
      "@type": "Rating",
      "ratingValue": (hotelInfo.starRating || 5).toString()
    },
    "priceRange": "₹₹₹₹",
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification", 
        "name": "Air Conditioning",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Room Service",
        "value": true
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Hotel Rooms",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Hotel",
            "name": room.name,
            "description": room.description
          },
          "price": room.price,
          "priceCurrency": "INR",
          "availability": "InStock"
        }
      ]
    }
  } : null

  return (
    <>
      {room && (
        <Head>
          <title>{room.name} | Grand Luxe Hotel - Starting from ₹{room.price.toLocaleString()}</title>
          <meta name="description" content={room.description} />
          <meta name="keywords" content={`${room.name.toLowerCase()}, luxury hotel room, premium accommodation, Grand Luxe Hotel, hotel booking, deluxe room, city view, modern amenities`} />
          <meta property="og:title" content={`${room.name} | Grand Luxe Hotel`} />
          <meta property="og:description" content={room.description} />
          <meta property="og:image" content={room.images[0]} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${room.name} | Grand Luxe Hotel`} />
          <meta name="twitter:description" content={room.description} />
          <meta name="twitter:image" content={room.images[0]} />
        </Head>
      )}
      <div className="min-h-screen bg-gray-50">
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <Container className="py-4">
          <nav className="text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link href="/rooms" className="text-muted-foreground hover:text-foreground">Rooms</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{room.name}</span>
          </nav>
        </Container>
      </div>

      <Container className="py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                  <Image
                    src={room.images[currentImageIndex]}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Navigation buttons */}
                  {room.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white/90 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white/90 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                    </>
                  )}
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-4 sm:w-6' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* View all photos button */}
                  <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-xs sm:text-sm"
                      >
                        View All Photos ({room.images.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-4 h-full overflow-y-auto">
                        {room.images.map((image, index) => (
                          <div key={index} className="relative h-48 sm:h-64 rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`${room.name} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>

            {/* Room Information */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <CardTitle className="text-xl sm:text-2xl">{room.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {room.isPromoted && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-xs sm:text-sm">
                            ⭐ Promoted
                          </Badge>
                        )}
                        {room.isSoldOut ? (
                          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm">
                            ✗ SOLD OUT
                          </Badge>
                                                 ) : (
                           <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm">
                             ✓ Available
                           </Badge>
                         )}
                      </div>
                    </div>
                    {room.viewType && (
                      <p className="text-base sm:text-lg text-amber-600 font-medium">{room.viewType}</p>
                    )}
                    <p className="text-muted-foreground text-sm sm:text-base">{room.shortDescription}</p>
                  </div>
                  <Button variant="outline" size="icon" className="hidden sm:flex">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs defaultValue="highlights" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                    <TabsTrigger value="highlights">Room Highlights</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities & Services</TabsTrigger>
                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="highlights" className="mt-4 sm:mt-6">
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Room Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <Square className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <div>
                              <div className="text-xs sm:text-sm font-medium">{room.size}</div>
                              <div className="text-xs text-muted-foreground">Room Size</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <div>
                              <div className="text-xs sm:text-sm font-medium">{room.bedType}</div>
                              <div className="text-xs text-muted-foreground">Bed Type</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bath className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <div>
                              <div className="text-xs sm:text-sm font-medium">{room.bathroomCount} Bathroom{room.bathroomCount > 1 ? 's' : ''}</div>
                              <div className="text-xs text-muted-foreground">Private Bath</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <div>
                              <div className="text-xs sm:text-sm font-medium">Max {room.maxGuests} Guests</div>
                              <div className="text-xs text-muted-foreground">Occupancy</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Description</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{room.description}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Key Features</h3>
                        <div className="whitespace-pre-line text-muted-foreground leading-relaxed text-sm sm:text-base">
                          {room.highlights || "No key features listed"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="mt-4 sm:mt-6">
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Room Amenities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {room.amenities?.length > 0 ? room.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              <span className="text-xs sm:text-sm">{amenity}</span>
                            </div>
                          )) : (
                            <p className="text-muted-foreground text-sm sm:text-base">No amenities listed</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Room Features</h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {room.features?.length > 0 ? room.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                              {feature}
                            </Badge>
                          )) : (
                            <p className="text-muted-foreground text-sm sm:text-base">No features listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="faqs" className="mt-4 sm:mt-6">
                    <div className="space-y-3 sm:space-y-4">
                      {Array.isArray((hotelInfo as any).faqs) && (hotelInfo as any).faqs.length > 0 && (
                        <>
                          {(hotelInfo as any).faqs.map((faq: any, index: number) => (
                            <div key={`hfaq-${index}`} className="border rounded-lg p-3 sm:p-4">
                              <h4 className="font-medium mb-2 text-sm sm:text-base">{faq.question}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                          ))}
                          <Separator />
                        </>
                      )}
                      {Array.isArray((hotelInfo as any).faqs) && (hotelInfo as any).faqs.length === 0 && (
                        <p className="text-xs sm:text-sm text-muted-foreground">No FAQs available at the moment.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Guest Reviews */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                  Guest Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 sm:pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium text-sm sm:text-base">{review.guestName}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                <Check className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Verified Stay
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm sm:text-base">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 sm:top-8">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="text-center">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-2">{room.name}</div>
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
                      <div className="text-2xl sm:text-3xl font-bold">{formatPrice(room.price)}</div>
                      {room.originalPrice && room.originalPrice > room.price && (
                        <div className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(room.originalPrice)}</div>
                      )}
                      {room.discountPercent && room.discountPercent > 0 && (
                        <Badge variant="destructive" className="text-xs sm:text-sm">{room.discountPercent}% OFF</Badge>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">per night</div>
                    <div className="mt-3 flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{room.bedType}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Max {room.maxGuests}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Quick features */}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-center">
                    {room.cancellationFree && (
                      <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-green-600">
                        <Check className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span>Free cancellation</span>
                      </div>
                    )}
                    {room.instantBooking && (
                      <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-blue-600">
                        <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span>Instant booking</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-600">
                      <Shield className="h-2 w-2 sm:h-3 sm:w-3" />
                      <span>Secure payment</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Booking buttons */}
                  <div className="space-y-2 sm:space-y-3">
                    {room.isSoldOut ? (
                      <Button 
                        className="w-full bg-red-500 hover:bg-red-600 cursor-not-allowed opacity-60" 
                        size="lg"
                        disabled
                      >
                        Sold Out
                        <X className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" 
                        size="lg"
                        asChild
                      >
                        <Link href={`/rooms/${room.slug}/book`}>
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <a href={telHref}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call to Reserve
                      </a>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp Us
                      </a>
                    </Button>

                    {/* Cancellation Policy - editable from backend */}
                    <div className="space-y-2 p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="text-xs sm:text-sm font-semibold text-amber-800">Cancellation Policy</h4>
                      {hotelInfo.cancellationPolicy ? (
                        <p className="text-xs sm:text-sm text-amber-900 whitespace-pre-line">{hotelInfo.cancellationPolicy}</p>
                      ) : (
                        <div className="text-xs sm:text-sm text-amber-900 space-y-1">
                          <p>For cancellation done prior 9 AM on 10 August, 100% Refundable</p>
                          <p>For cancellation done post 9 AM on 10 August, Non Refundable</p>
                          <p>Follow safety measures advised at the hotel</p>
                          <p>
                            By proceeding, you agree to our
                            {' '}<Link href="/guest-policies" className="underline font-medium text-amber-900">Guest Policies</Link>.
                          </p>
                        </div>
                      )}
                      {!hotelInfo.cancellationPolicy && null}
                      {hotelInfo.cancellationPolicy && (
                        <p className="text-xs text-amber-900">
                          By proceeding, you agree to our
                          {' '}<Link href="/guest-policies" className="underline font-medium text-amber-900">Guest Policies</Link>.
                        </p>
                      )}
                    </div>
                    

                  </div>
                  
                  {/* Contact info */}
                  <div className="text-center text-xs sm:text-sm text-muted-foreground">
                    <p>Need help? Call us at</p>
                    <p className="font-medium text-foreground">{hotelInfo.primaryPhone || "+91 98765 43210"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
      </div>
    </>
  )
}
