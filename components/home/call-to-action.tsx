import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { Calendar, Phone, Mail } from "lucide-react"
import Link from "next/link"

const CallToAction = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-amber-900/90" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <Badge className="mb-6 bg-amber-500/90 hover:bg-amber-500 text-white border-0 text-xs md:text-sm px-4 py-2">
            🌟 Limited Time Offer
          </Badge>

          {/* Main Content */}
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Experience
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
              Luxury?
            </span>
          </h2>

          <p className="text-base md:text-xl lg:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Book your unforgettable stay today and discover why Grand Luxe is the premier choice for discerning travelers
          </p>

          {/* Special Offer */}
          <div className="mb-10 p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-md mx-auto">
            <div className="text-2xl md:text-3xl font-bold text-amber-300 mb-2">Save 20%</div>
            <div className="text-sm md:text-base text-blue-100">on weekend stays this month</div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold rounded-full"
              asChild
            >
              <Link href="/booking">
                <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Book Your Stay
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold rounded-full"
              asChild
            >
              <Link href="/services">
                Explore Services
              </Link>
            </Button>
          </div>

          {/* Contact Options */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-blue-100">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-amber-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/30" />
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-400" />
              <span>reservations@grandluxe.com</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xs md:text-sm text-blue-200">
              <div>✓ Best Price Guarantee</div>
              <div>✓ Free Cancellation</div>
              <div>✓ Instant Confirmation</div>
              <div>✓ 24/7 Support</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default CallToAction