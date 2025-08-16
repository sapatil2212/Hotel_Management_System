"use client"

import { useState, useEffect } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Award, Users, Calendar, Sparkles, Crown } from "lucide-react"
import Link from "next/link"

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { hotelInfo } = useHotel()
  
  const slides = [
    {
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      mobileImage: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      title: "Where Every Door Opens to Luxury.",
      subtitle: "From the moment you step inside, feel the warmth of personalized service",
      cta: "Explore Rooms",
      link: "/rooms"
    },
    {
      image: "https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg",
      mobileImage: "https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg",
      title: "Your dream event deserves a royal venue",
      subtitle: "Spacious and equipped with modern amenities, our banquet hall is ready to host your happiest moments",
      cta: "View Banquet",
      link: "/services"
    },
    {
      image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      mobileImage: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      title: "Exceptional Dining Experience",
      subtitle: "Taste the finest cuisine at our world-class restaurant",
      cta: "Explore Now",
      link: "/services"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-0 pb-8 group bg-white">
      <div className="relative h-[60vh] md:h-[85vh] overflow-hidden rounded-3xl">
        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 z-30 flex items-center justify-center w-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 z-30 flex items-center justify-center w-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Background Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Mobile Image (hidden on desktop) */}
            <div className="md:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-40 z-10 rounded-3xl" />
              <img
                src={slide.mobileImage}
                alt={slide.title}
                className="w-full h-full object-cover object-center rounded-3xl"
              />
            </div>
            
            {/* Desktop Image */}
            <div className="hidden md:block">
              <div className="absolute inset-0 bg-black bg-opacity-40 z-10 rounded-3xl" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center rounded-3xl"
              />
            </div>
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start">
          <div className="text-center md:text-left text-white max-w-4xl px-6 lg:px-[60px] transform md:translate-y-0 -translate-y-[90px] transition-all duration-1000 ease-out">
            {/* Luxury Badge */}
            <div className="inline-flex items-center justify-center mb-6 bg-amber-600/20 backdrop-blur-sm px-6 py-2 rounded-full border border-amber-500/30">
              <Sparkles className="h-5 w-5 text-amber-300 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-amber-100 tracking-widest">
                ⭐ {hotelInfo.starRating || 5}-STAR LUXURY
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl md:text-6xl lg:text-6xl font-bold mb-4 md:mb-6 font-luxury leading-tight">
              <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 text-gray-200 max-w-2xl mx-auto md:mx-0">
              {slides[currentSlide].subtitle}
            </p>
            
       
            <Link
              href={slides[currentSlide].link}
              className="group relative inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-3 sm:px-4 py-3 rounded-xl hover:shadow-xl transform transition-all duration-300 hover:scale-[1.03] hover:from-amber-500 hover:to-amber-600 overflow-hidden"
            >
              <Calendar className="h-4 w-4 relative z-10" />
              <span className='font-semibold text-xs sm:text-base relative z-10'>{slides[currentSlide].cta}</span>
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />

              {/* Working Shimmer effect */}
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Link>
          </div>
        </div>

        {/* Slide Indicators - Always visible */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-amber-400 w-8' : 'bg-white bg-opacity-30 hover:bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Luxury Decorative Elements */}
        <div className="absolute top-6 right-6 bg-black/20 backdrop-blur-sm rounded-2xl p-4 transform transition-all duration-500 hover:scale-105">
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-amber-400" /> 
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-sm text-white font-semibold mt-1">Premium Stay</p>
        </div>
      </div>
    </section>
  )
}

export default Hero