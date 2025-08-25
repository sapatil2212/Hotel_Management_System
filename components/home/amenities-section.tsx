import { ShieldCheck, BedDouble, BellRing, Thermometer, Ruler, Wifi, Tv2, Sparkles } from "lucide-react"
import Image from "next/image"

export default function AmenitiesSection() {
  const services = [
    {
      icon: Sparkles,
      title: "Daily Housekeeping",
      description: "Clean and tidy rooms maintained daily by our professional housekeeping team.",
    },
    {
      icon: BedDouble,
      title: "Comfortable Beds",
      description: "Sink into cozy, high-quality mattresses for restful sleep and ultimate comfort.",
    },
    {
      icon: BellRing,
      title: "24/7 Room Service",
      description: "Prompt in-room dining and service, available around the clock for your convenience.",
    },
    {
      icon: Thermometer,
      title: "AC Rooms",
      description: "Fully air-conditioned rooms to ensure a cool and relaxing stay, day or night.",
    },
    {
      icon: Wifi,
      title: "High-Speed Wi-Fi",
      description: "Stay connected with fast, reliable internet access throughout your stay.",
    },
    {
      icon: Tv2,
      title: "Smart LED TV",
      description: "Enjoy your favorite shows and streaming services on large smart LED screens.",
    },
  ]

  return (
    <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-32">
        <div className="grid lg:grid-cols-2 gap-12 items-start font-inter">
          {/* Left side - Services */}
          <div>
            <div className="mb-8 lg:mb-12 text-center sm:text-left">
              <h2 className="text-xl sm:text-3xl font-bold text-primary mb-3">Discover the Amenities We Offer</h2>
              <p className="text-sm sm:text-md text-gray-600">
                Experience thoughtful comforts and premium amenities that redefine your stay.
              </p>
            </div>

            {/* Mobile Layout - 2 columns side by side */}
            <div className="grid grid-cols-2 gap-4 sm:hidden">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <div key={index} className="flex flex-col items-center text-center space-y-2">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-gray-900 leading-tight">{service.title}</h3>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Layout - Original horizontal layout */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 text-xs leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right side - Image */}
          <div className="lg:pl-8">
            <div className="relative">
              <Image
                src="/home/ameneties.png"
                alt="Hotel amenities visual"
                width={600}
                height={700}
                className="object-cover w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
