"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Star, Quote, Play, Pause, Check } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Saranraj S",
    avatar: "S",
    location: "Google Review",
    quote:
      "My stay at the Aaditya Inn Rooms and Banquet was excellent! The rooms were impeccably clean and very comfortable, with elegant décor. The staff was incredibly friendly and helpful, making me feel welcomed. Highly recommend this hotel!",
    rating: 5,
    date: "2 months ago",
    verified: true,
  },
  {
    id: 2,
    name: "Shreetej Chavan",
    avatar: "S",
    location: "Google Review",
    quote:
      "I had a wonderful stay at Aaditya Inn. The rooms were clean, spacious, and relaxing. The staff was polite and always ready to help. Check-in to check-out was smooth. Highly recommend for a pleasant stay.",
    rating: 5,
    date: "2 months ago",
    verified: true,
  },
  {
    id: 3,
    name: "Kusum Pandey",
    avatar: "K",
    location: "Google Review",
    quote:
      "The rooms were clean, spacious, and well-maintained. Staff were incredibly friendly and helpful. The location was perfect and breakfast options were fresh and delicious. Would definitely recommend this hotel.",
    rating: 5,
    date: "2 months ago",
    verified: true,
  },
  {
    id: 4,
    name: "Shyamal Mondal",
    avatar: "S",
    location: "Google Review",
    quote:
      "Stayed at Itsy Hotels Aaditya Inn Tathawade – very neat and clean! Great for solo or family stays. Safe, well-connected location, good food options, and very helpful staff. Would definitely stay again.",
    rating: 5,
    date: "4 months ago",
    verified: true,
  },
  {
    id: 5,
    name: "Sheeba Girish",
    avatar: "S",
    location: "Google Review",
    quote:
      "Excellent hospitality and room service. Special thanks to Shyam, the receptionist, for personally taking interest in every guest's comfort. Truly made our family holiday pleasant.",
    rating: 5,
    date: "1 month ago",
    verified: true,
  },
  {
    id: 6,
    name: "Swapnil Pillai",
    avatar: "S",
    location: "Google Review",
    quote:
      "Excellent hotel at this price. Stayed for a week. Safe for solo women, couples, families. Polite staff, especially Shyam at reception. Food is decent with veg/non-veg options. Highly recommend!",
    rating: 5,
    date: "4 months ago",
    verified: true,
  },
]

export default function Testimonials() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const swiperRef = useRef<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Enhanced star rating with smooth animations
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 transition-colors duration-300 ${
          i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
        }`}
      />
    ))
  }

  // Modern Google logo with enhanced styling
  const GoogleLogo = () => (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-full opacity-80">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-xs font-medium text-gray-600">Google</span>
    </div>
  )

  // Enhanced loading skeleton with wave animation
  const LoadingSkeleton = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/20 rounded-3xl p-6 shadow-lg border border-blue-200/30">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
        </div>
      </div>
      {/* Wave animation overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  )

  // Modern testimonial card with enhanced design
  const renderTestimonialCard = (testimonial: any, index: number) => (
    <div
      key={testimonial.id}
      className="relative bg-gradient-to-br from-white to-blue-50/20 rounded-xl p-4 mx-1 transition-all duration-700 ease-in-out cursor-pointer border border-blue-200/30 transform hover:scale-105 mb-5 "
      style={{
        animation: 'fadeInOut 0.8s ease-in-out',
        opacity: 0,
        animationFillMode: 'forwards'
      }}
    >
      {/* Quote icon */}
      <div className="absolute top-3 right-3 opacity-10">
        <Quote className="h-6 w-6 text-amber-600" />
      </div>

      <div className="relative z-10 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-3 animate-slideInUp">
          <div className="relative">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">
              {testimonial.avatar}
            </div>
            {testimonial.verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h3>
              <div className="flex items-center space-x-0.5">{renderStars(testimonial.rating)}</div>
            </div>
            <p className="text-xs text-gray-600 mb-0.5 font-medium">{testimonial.location}</p>
            <p className="text-xs text-gray-400">{testimonial.date}</p>
          </div>
        </div>

        {/* Quote text */}
        <blockquote className="text-gray-700 leading-relaxed mb-4 text-sm relative">
          <span className="text-amber-600 text-lg font-bold">"</span>
          <span className="relative z-10">{testimonial.quote}</span>
          <span className="text-amber-600 text-lg font-bold relative z-10">"</span>
          {/* Text fade overlay */}
          <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-5"></div>
        </blockquote>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <GoogleLogo />
          <div className="text-xs text-green-600 font-medium">✓ Verified Review</div>
        </div>
      </div>
    </div>
  )

  const toggleAutoplay = () => {
    if (swiperRef.current) {
      if (isAutoPlaying) {
        swiperRef.current.autoplay.stop()
      } else {
        swiperRef.current.autoplay.start()
      }
      setIsAutoPlaying(!isAutoPlaying)
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 border border-blue-200/30 rounded-3xl p-8 lg:p-12 shadow-lg backdrop-blur-sm">
            <div className="text-center mb-16">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded-full w-32 mx-auto"></div>
                <div className="h-8 bg-gray-200 rounded-full w-64 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded-full w-48 mx-auto"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 lg:p-12 ">
          {/* Modern header with enhanced animations */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="h-4 w-4 fill-current" />
              <span>Customer Testimonials</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              What Our{" "}
              <span className="text-amber-600">
                Amazing Guests
              </span>{" "}
              Say About Us
            </h2>

            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Real experiences from our valued guests who have made unforgettable memories with us
            </p>
          </div>

                    {/* Carousel */}
          <div className="relative group">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Left Navigation Arrow */}
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 hover:text-amber-600 transition-colors duration-300" />
            </button>
            
            {/* Right Navigation Arrow */}
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-110"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 hover:text-amber-600 transition-colors duration-300" />
            </button>
            <Swiper
              modules={[Autoplay, EffectCoverflow, Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              centeredSlides={true}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              effect="slide"
              speed={800}
              breakpoints={{
                480: {
                  slidesPerView: 1.2,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 1.4,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 1.8,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 2.2,
                  spaceBetween: 28,
                },
                1280: {
                  slidesPerView: 2.5,
                  spaceBetween: 32,
                },
              }}
              onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
              }}
              className="pb-12 overflow-visible"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={testimonial.id}>{renderTestimonialCard(testimonial, index)}</SwiperSlide>
              ))}
            </Swiper>


          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          50% {
            opacity: 0.8;
            transform: translateY(10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .swiper-slide {
          transition: all 0.8s ease-in-out;
          position: relative;
          overflow: visible !important;
        }
        
        .swiper-slide-active {
          transform: scale(1) !important;
          opacity: 1 !important;
          z-index: 2;
          filter: blur(0px);
        }
        
        .swiper-slide-prev,
        .swiper-slide-next {
          transform: scale(0.85) !important;
          opacity: 0.5 !important;
          z-index: 1;
          filter: blur(1.5px);
        }
        
        .swiper-slide-prev {
          transform: scale(0.85) translateX(10%) !important;
        }
        
        .swiper-slide-next {
          transform: scale(0.85) translateX(-10%) !important;
        }
        
        /* Fade effect for cards */
        .swiper-slide {
          position: relative;
          overflow: visible !important;
        }
        
        .swiper-slide::before {
          content: '';
          position: absolute;
          top: 0;
          right: -40px;
          width: 150px;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 1));
          pointer-events: none;
          z-index: 25;
          border-radius: 0 12px 12px 0;
        }
        
        .swiper-slide-active::before {
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.95));
        }
        
        .swiper-slide-prev::before,
        .swiper-slide-next::before {
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.98));
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out 0.2s both;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out 0.4s both;
        }
      `}</style>
    </section>
  )
}