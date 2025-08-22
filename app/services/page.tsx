import { Container } from "@/components/ui/container"
import ServicesGrid from "@/components/services/services-grid"
import ServiceHero from "@/components/services/service-hero"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <Container>
        <div className="py-16">
          {/* Hero Section */}
          <ServiceHero />

          {/* Services Grid */}
          <div className="mt-20">
            <ServicesGrid />
          </div>
        </div>
      </Container>
    </div>
  )
}
