"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Executive",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      rating: 5,
      text: "Grand Luxe exceeded all my expectations. The service was impeccable, the accommodations were stunning, and every detail was perfect. I'll definitely be returning for my next business trip."
    },
    {
      name: "Michael Chen",
      role: "Travel Blogger",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      rating: 5,
      text: "Having stayed at luxury hotels worldwide, Grand Luxe stands out for its exceptional attention to detail and genuine hospitality. The spa experience alone is worth the visit."
    },
    {
      name: "Emily Rodriguez",
      role: "Event Planner",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      rating: 5,
      text: "We hosted our company's annual gala at Grand Luxe, and it was absolutely perfect. The staff went above and beyond to ensure every detail was flawless. Highly recommended!"
    },
    {
      name: "David Mitchell",
      role: "Entrepreneur",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      rating: 5,
      text: "The Presidential Suite was breathtaking, and the concierge service was outstanding. Grand Luxe truly understands what luxury hospitality means."
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            Guest Experiences
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              What Our Guests Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover why guests choose Grand Luxe for their most memorable stays
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto relative px-16">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="h-12 w-12 text-amber-500 mx-auto" />
                </div>

                {/* Rating */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 font-medium italic leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <Image
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                    <div className="text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-amber-500 w-8' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20 px-16">
          {[
            { number: "10K+", label: "Happy Guests" },
            { number: "4.9", label: "Average Rating" },
            { number: "95%", label: "Return Rate" },
            { number: "50+", label: "Awards Won" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Testimonials