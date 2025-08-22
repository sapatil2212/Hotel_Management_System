"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Star,
  AlertTriangle,
  Loader2,
  MessageSquare
} from "lucide-react"
import { useHotel } from "@/contexts/hotel-context"

export default function ContactInfo() {
  const { hotelInfo, isLoading } = useHotel()

  const contactMethods = [
    {
      icon: Phone,
      title: "Primary Phone",
      value: hotelInfo.primaryPhone || "+1 (555) 123-4567",
      action: "Call Now",
      href: `tel:${hotelInfo.primaryPhone || "+15551234567"}`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: hotelInfo.whatsappPhone || hotelInfo.primaryPhone || "+1 (555) 123-4567",
      action: "WhatsApp",
      href: `https://wa.me/${(hotelInfo.whatsappPhone || hotelInfo.primaryPhone || "+15551234567").replace(/\D/g, '')}`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Mail,
      title: "Email",
      value: hotelInfo.primaryEmail || "info@hotel.com",
      action: "Send Email",
      href: `mailto:${hotelInfo.primaryEmail || "info@hotel.com"}`,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Mail,
      title: "Reservations",
      value: hotelInfo.reservationEmail || hotelInfo.primaryEmail || "reservations@hotel.com",
      action: "Book Now",
      href: `mailto:${hotelInfo.reservationEmail || hotelInfo.primaryEmail || "reservations@hotel.com"}`,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: MapPin,
      title: "Address",
      value: hotelInfo.address || "123 Hotel Street, City, State 12345",
      action: "Get Directions",
      href: `https://maps.google.com/?q=${encodeURIComponent(hotelInfo.address || "123 Hotel Street, City, State 12345")}`,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: AlertTriangle,
      title: "Emergency",
      value: hotelInfo.emergencyContact || hotelInfo.primaryPhone || "+1 (555) 123-4567",
      action: "Call Emergency",
      href: `tel:${hotelInfo.emergencyContact || hotelInfo.primaryPhone || "+15551234567"}`,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ]

  const businessHours = [
    { day: "Check-in Time", hours: hotelInfo.checkInTime || "3:00 PM" },
    { day: "Check-out Time", hours: hotelInfo.checkOutTime || "11:00 AM" },
    { day: "24/7 Support", hours: "Always Available" }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Loading hotel information...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hotel Information */}
      {hotelInfo.name && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-4 h-4" />
              {hotelInfo.name}
            </CardTitle>
            {hotelInfo.tagline && (
              <CardDescription className="text-sm">
                {hotelInfo.tagline}
              </CardDescription>
            )}
          </CardHeader>
          {hotelInfo.description && (
            <CardContent className="pt-0">
              <p className="text-sm text-gray-700 leading-relaxed">
                {hotelInfo.description}
              </p>
              {hotelInfo.starRating && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center">
                    {[...Array(hotelInfo.starRating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {hotelInfo.overallRating}/5 ({hotelInfo.reviewCount} reviews)
                  </span>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Contact Methods */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-4 h-4" />
            Contact Information
          </CardTitle>
          <CardDescription className="text-sm">
            Get in touch with us through any of these methods
          </CardDescription>
        </CardHeader>
                 <CardContent className="pt-0">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {contactMethods.map((method, index) => {
               const Icon = method.icon
               return (
                 <div key={index} className="flex items-center gap-2 py-2">
                   <div className={`p-1.5 rounded-md ${method.bgColor}`}>
                     <Icon className={`w-3.5 h-3.5 ${method.color}`} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-medium text-gray-900 truncate">{method.title}</p>
                     <a 
                       href={method.href} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate block"
                     >
                       {method.value}
                     </a>
                   </div>
                 </div>
               )
             })}
           </div>
         </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-4 h-4" />
            Hotel Hours
          </CardTitle>
          <CardDescription className="text-sm">
            Important timing information for your stay
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {businessHours.map((schedule, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-900">{schedule.day}</span>
                <span className="text-sm text-gray-600">{schedule.hours}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-amber-50 rounded-md">
            <p className="text-xs text-amber-800">
              <strong>24/7 Support:</strong> For urgent matters, our emergency line is always available.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Response */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Quick Response Guarantee
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              We typically respond to all inquiries within 2-4 hours during business hours.
            </p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Response Time: 2-4 hours
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
