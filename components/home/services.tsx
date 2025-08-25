import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Waves, ChefHat, Users, Dumbbell, Bell, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const Services = () => {
  const services = [
    {
      icon: Waves,
      title: "Luxury Rooms",
      description: "Experience ultimate comfort in our premium accommodations",
      image: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
      features: ["Premium Bedding", "City Views", "Room Service"]
    },
    {
      icon: ChefHat,
      title: "Fine Dining",
      description: "Michelin-starred culinary excellence",
      image: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg",
      features: ["Award-winning Chef", "Wine Pairing", "Private Dining"]
    },
    {
      icon: Users,
      title: "Events & Conferences",
      description: "State-of-the-art meeting facilities",
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
      features: ["Modern AV Equipment", "Catering", "Event Planning"]
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 lg:p-12">
          {/* Section Header */}
          <div className="text-center mb-8 lg:mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs md:text-sm">
              World-Class Amenities
            </Badge>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 bg-clip-text text-transparent">
                Exceptional Services
              </span>
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
              Experience unmatched luxury with our comprehensive range of premium services and amenities
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card 
                  key={index}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 bg-white hover:bg-white hover:scale-[1.02] relative"
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Service icon with enhanced styling */}
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20">
                          <IconComponent className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                      
                      {/* Service title overlay */}
                      <div className="absolute bottom-4 right-4 text-right">
                        <h3 className="text-white font-bold text-lg drop-shadow-lg">
                          {service.title}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Key Features
                      </div>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/services">
                Explore All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services