"use client"

import { useState, useEffect } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, MapPin, Search, ChevronRight, Star, Award, Crown, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { toast } from "@/hooks/use-toast"

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [textVisible, setTextVisible] = useState(false)
  const { hotelInfo } = useHotel()
  const router = useRouter()
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    roomType: "all",
    guests: 1
  })

  // Availability check state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  const slides = [
    {
      image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop&crop=center",
      mobileImage: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop&crop=center",
      title: "Where Every Door Opens to Luxury",
      subtitle: "Experience unparalleled comfort and world-class service in the heart of the city",
      cta: "Explore Rooms",
      link: "/rooms"
    },
    {
      image: "https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop&crop=center",
      mobileImage: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop&crop=center",
      title: "Your Dream Event Deserves a Royal Venue",
      subtitle: "Spacious and equipped with modern amenities, our banquet hall is ready to host your happiest moments",
      cta: "View Banquet",
      link: "/services"
    },
    {
      image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop&crop=center",
      mobileImage: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop&crop=center",
      title: "Exceptional Dining Experience",
      subtitle: "Taste the finest cuisine at our world-class restaurant with breathtaking views",
      cta: "Explore Now",
      link: "/services"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setTextVisible(false)
      // Show text after 1 second when slide changes
      setTimeout(() => setTextVisible(true), 1000)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Show text on initial load after 1 second
  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.guests) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Validate dates
    const checkInDate = new Date(bookingData.checkIn)
    const checkOutDate = new Date(bookingData.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      toast({
        title: "Invalid Date",
        description: "Check-in date cannot be in the past",
        variant: "destructive"
      })
      return
    }

    if (checkOutDate <= checkInDate) {
      toast({
        title: "Invalid Date",
        description: "Check-out date must be after check-in date",
        variant: "destructive"
      })
      return
    }

    setIsCheckingAvailability(true)

    try {
      // Check room availability
      const response = await fetch('/api/rooms/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check availability')
      }

      if (data.available && data.availableRoomTypes.length > 0) {
        // Rooms are available, redirect to rooms page with search parameters
        const params = new URLSearchParams({
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests.toString(),
          available: 'true'
        })
        router.push(`/rooms?${params.toString()}`)
      } else {
        // No rooms available
        toast({
          title: "No Rooms Available",
          description: "Sorry, no rooms are available for the selected dates and guest count. Please try different dates or contact us for assistance.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast({
        title: "Error",
        description: "Failed to check room availability. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const updateBookingData = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <section className="relative min-h-[70vh] md:min-h-screen bg-white px-4 sm:px-6 lg:px-8">
    {/* Hero Background with Slides */}
    <div className="relative h-[60vh] md:h-[75vh] overflow-hidden rounded-3xl">
        {/* Background Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0">
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/50 z-10" />
              
              <picture className="w-full h-full block">
                <source
                  media="(max-width: 767px)"
                  srcSet={slide.mobileImage}
                  sizes="100vw"
                />
                <source
                  media="(min-width: 768px)"
                  srcSet={slide.image}
                  sizes="100vw"
                />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center rounded-3xl"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </picture>
            </div>
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Luxury Badge */}
              <div className={`inline-flex items-center justify-center mb-4 bg-amber-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-500/30 transition-all duration-1000 transform ${
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <Crown className="h-4 w-4 text-amber-300 mr-2" />
                <span className="text-xs font-medium text-amber-100 tracking-widest">
                  ⭐ {hotelInfo?.starRating || 5}-STAR LUXURY HOTEL
                </span>
              </div>

              {/* Main Title */}
              <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight transition-all duration-1000 delay-200 transform ${
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                  {slides[currentSlide].title}
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className={`text-lg md:text-xl lg:text-2xl mb-6 text-gray-200 max-w-3xl leading-relaxed transition-all duration-1000 delay-400 transform ${
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                {slides[currentSlide].subtitle}
              </p>

              {/* Trust Indicators */}
              <div className={`flex flex-wrap items-center justify-center gap-4 text-white/90 transition-all duration-1000 delay-600 transform ${
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span className="text-xs">Best Price Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs">Free Cancellation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="text-xs">Instant Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-amber-400 w-10' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Booking Form - Half on hero, half outside */}
      <div className="relative z-30 -mt-12 lg:-mt-20 hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100/50">
              <form onSubmit={handleBookingSubmit} className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    
                    {/* Check-in Date */}
                    <div className="space-y-1">
                      <CustomDatePicker
                        value={bookingData.checkIn}
                        onChange={(date) => updateBookingData('checkIn', date)}
                        placeholder="Check-in Date"
                        label="Check-in Date"
                        required
                        minDate={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Check-out Date */}
                    <div className="space-y-1">
                      <CustomDatePicker
                        value={bookingData.checkOut}
                        onChange={(date) => updateBookingData('checkOut', date)}
                        placeholder="Check-out Date"
                        label="Check-out Date"
                        required
                        minDate={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Number of Guests */}
                    <div className="space-y-1">
                      <Label htmlFor="guests" className="text-xs font-medium text-gray-700">
                        Number of Guests
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <Select 
                          value={bookingData.guests.toString()} 
                          onValueChange={(value) => updateBookingData('guests', parseInt(value))}
                        >
                          <SelectTrigger className="pl-8 h-11 text-sm border-gray-200 focus:border-amber-500 focus:ring-amber-200 rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-200 hover:border-gray-300">
                            <SelectValue placeholder="Select guests" />
                          </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                                      {/* Search Button */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700 opacity-0">
                        Search
                      </Label>
                      <Button 
                        type="submit"
                        disabled={isCheckingAvailability}
                        className="w-full h-10 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingAvailability ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Search className="h-3 w-3 mr-2" />
                            Check Availability
                            <ChevronRight className="h-3 w-3 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
            </div>
          </div>
        </div>
      </div>






    </section>
  )
}

export default Hero