"use client"

import { useState, useEffect } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Award, Users } from "lucide-react"
import Link from "next/link"

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { hotelInfo } = useHotel()
  
  const slides = [
    {
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      title: "Experience Luxury Redefined",
      subtitle: "Where elegance meets comfort in the heart of the city"
    },
    {
      image: "https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg",
      title: "Presidential Suites",
      subtitle: "Indulge in the ultimate luxury experience"
    },
    {
      image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      title: "Rooftop Infinity Pool",
      subtitle: "Stunning city views and unparalleled relaxation"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Badge */}
          <Badge className="mb-6 bg-amber-500/90 hover:bg-amber-500 text-white border-0 text-sm px-4 py-2">
            ⭐ {hotelInfo.starRating || 5}-Star Luxury Hotel
          </Badge>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            {slides[currentSlide].subtitle}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-6 text-lg font-semibold rounded-full" asChild>
              <Link href="/rooms">View Our Rooms</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg font-semibold rounded-full"
              asChild
            >
              <Link href="/services">Explore Services</Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold">{hotelInfo.starRating || 5}★</span>
              </div>
              <p className="text-sm text-gray-300">Luxury Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold">{hotelInfo.reviewCount ? `${hotelInfo.reviewCount > 1000 ? Math.floor(hotelInfo.reviewCount/1000) + 'K+' : hotelInfo.reviewCount}` : '10K+'}</span>
              </div>
              <p className="text-sm text-gray-300">Happy Guests</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold">{hotelInfo.overallRating || 4.9}</span>
              </div>
              <p className="text-sm text-gray-300">Guest Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-amber-400 w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero