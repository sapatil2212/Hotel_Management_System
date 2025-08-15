import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Waves, ChefHat, Users, Dumbbell, Bell, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const Services = () => {
  const services = [
    {
      icon: Waves,
      title: "Luxury Spa",
      description: "Rejuvenate with our world-class treatments",
      image: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg",
      features: ["Massage Therapy", "Aromatherapy", "Wellness Treatments"]
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
    },
    {
      icon: Dumbbell,
      title: "Fitness & Pool",
      description: "Stay active with premium facilities",
      image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      features: ["Infinity Pool", "Modern Gym", "Personal Training"]
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
            World-Class Amenities
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Exceptional Services
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience unmatched luxury with our comprehensive range of premium services and amenities
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 px-16">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card 
                key={index}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <CardTitle className="text-lg mb-2">{service.title}</CardTitle>
                  <CardDescription className="mb-4">
                    {service.description}
                  </CardDescription>
                  
                  <ul className="space-y-1 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8" asChild>
            <Link href="/services">Explore All Services</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}

export default Services