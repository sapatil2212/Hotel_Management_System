"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bed, 
  Utensils, 
  Dumbbell, 
  Heart, 
  Wifi, 
  Car, 
  Globe, 
  Shield,
  Coffee,
  Music,
  Camera,
  Gift
} from "lucide-react"

const services = [
  {
    icon: Bed,
    title: "Luxury Accommodation",
    description: "Experience comfort in our elegantly designed rooms with premium amenities and stunning views.",
    features: ["Premium bedding", "City views", "24/7 room service", "Daily housekeeping"],
    price: "From ₹5,000/night",
    category: "Accommodation",
    popular: true
  },
  {
    icon: Utensils,
    title: "Fine Dining",
    description: "Savor exquisite cuisine prepared by world-class chefs using the finest ingredients.",
    features: ["International cuisine", "Local specialties", "Wine pairing", "Private dining"],
    price: "From ₹1,500/meal",
    category: "Dining",
    popular: false
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "Stay fit with our state-of-the-art gym equipment and personal training sessions.",
    features: ["Modern equipment", "Personal trainers", "Yoga classes", "24/7 access"],
    price: "Free for guests",
    category: "Wellness",
    popular: false
  },
  {
    icon: Heart,
    title: "Spa & Wellness",
    description: "Rejuvenate your body and mind with our luxurious spa treatments and therapies.",
    features: ["Massage therapy", "Facial treatments", "Sauna & steam", "Wellness packages"],
    price: "From ₹3,000/session",
    category: "Wellness",
    popular: true
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Stay connected with complimentary high-speed internet throughout the hotel.",
    features: ["100 Mbps speed", "Multiple devices", "Business center", "Tech support"],
    price: "Free for guests",
    category: "Technology",
    popular: false
  },
  {
    icon: Car,
    title: "Transportation",
    description: "Convenient transportation services including airport transfers and local tours.",
    features: ["Airport pickup", "City tours", "Car rental", "Valet parking"],
    price: "From ₹500/ride",
    category: "Transport",
    popular: false
  },
  {
    icon: Globe,
    title: "Concierge Service",
    description: "Our dedicated concierge team is here to assist with all your needs and requests.",
    features: ["24/7 assistance", "Tour bookings", "Restaurant reservations", "Event planning"],
    price: "Free for guests",
    category: "Service",
    popular: false
  },
  {
    icon: Coffee,
    title: "Coffee Lounge",
    description: "Enjoy premium coffee and light refreshments in our elegant lounge area.",
    features: ["Artisan coffee", "Pastries", "Comfortable seating", "Business meetings"],
    price: "From ₹200",
    category: "Dining",
    popular: false
  },
  {
    icon: Music,
    title: "Entertainment",
    description: "Unwind with live music, cultural performances, and entertainment events.",
    features: ["Live music", "Cultural shows", "Movie nights", "Game room"],
    price: "Free for guests",
    category: "Entertainment",
    popular: false
  },
  {
    icon: Camera,
    title: "Event Spaces",
    description: "Host memorable events in our versatile venues with professional event planning.",
    features: ["Wedding venues", "Conference rooms", "Catering services", "Event planning"],
    price: "From ₹50,000/event",
    category: "Events",
    popular: false
  },
  {
    icon: Shield,
    title: "Security Services",
    description: "Your safety is our priority with 24/7 security and surveillance systems.",
    features: ["24/7 security", "CCTV surveillance", "Safe deposit boxes", "Emergency response"],
    price: "Included",
    category: "Security",
    popular: false
  },
  {
    icon: Gift,
    title: "Special Packages",
    description: "Customized packages for romantic getaways, business trips, and special occasions.",
    features: ["Honeymoon packages", "Business packages", "Family packages", "Custom itineraries"],
    price: "Custom pricing",
    category: "Packages",
    popular: true
  }
]

export default function ServicesGrid() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Premium Services
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover a world of luxury and convenience with our comprehensive range of services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                service.popular ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white' : ''
              }`}
            >
              {service.popular && (
                <Badge className="absolute top-4 right-4 bg-blue-600 text-white">
                  Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Features:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-xs text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {service.price}
                    </span>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience Our Services?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Book your stay today and enjoy all our premium services. Contact us for special packages and custom arrangements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Book Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
