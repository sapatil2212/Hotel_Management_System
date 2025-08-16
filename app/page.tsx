import Hero from "@/components/home/hero"
import Services from "@/components/home/services"
import FeaturedRooms from "@/components/home/featured-rooms"
import AmenitiesSection from "@/components/home/amenities-section"
import Testimonials from "@/components/home/testimonials"
import CallToAction from "@/components/home/call-to-action"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeaturedRooms />
      <AmenitiesSection />
      <Services />
      <Testimonials />
      <CallToAction />
    </div>
  )
}