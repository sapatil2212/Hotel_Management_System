"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Award, Users, MapPin } from "lucide-react"
import { useHotel } from "@/contexts/hotel-context"

export default function ServiceHero() {
  const { hotelInfo } = useHotel()

  const stats = [
    { icon: Star, label: "5-Star Rating", value: "4.8/5" },
    { icon: Users, label: "Happy Guests", value: "10K+" },
    { icon: Award, label: "Awards Won", value: "15+" },
    { icon: MapPin, label: "Prime Location", value: "Downtown" }
  ]

  return (
    <div className="text-center">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
          Premium Services
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Exceptional Services for
          <span className="text-blue-600"> Exceptional Stays</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Experience luxury and comfort with our comprehensive range of services designed to make your stay memorable and convenient.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Book Your Stay
          </Button>
          <Button size="lg" variant="outline">
            View Room Types
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
