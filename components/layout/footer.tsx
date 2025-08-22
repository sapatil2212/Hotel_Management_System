"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { MapPin, Phone, Mail, Star } from "lucide-react"
import { useHotel } from "@/contexts/hotel-context"
import { usePolicyModal } from "@/components/ui/policy-modal"
import dynamic from 'next/dynamic'

// Dynamically import SocialIcon to avoid hydration issues
const SocialIcon = dynamic(() => import('react-social-icons').then(mod => ({ default: mod.SocialIcon })), {
  ssr: false,
  loading: () => <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
})

const Footer = () => {
  const { hotelInfo } = useHotel()
  const { openPrivacy, openTerms, PrivacyModal, TermsModal } = usePolicyModal()
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 border-t">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {hotelInfo.logo ? (
                <img 
                  src={hotelInfo.logo} 
                  alt={hotelInfo.name || "Hotel Logo"} 
                  className="h-10 w-auto object-contain"
                />
              ) : null}
            </Link>
            <p className="text-xs text-muted-foreground">
              {hotelInfo.tagline || "Experience unparalleled luxury and comfort at Grand Luxe Hotel. Where every detail is crafted for your perfect stay."}
            </p>
            <div className="space-y-4">
              {/* Social Media Icons */}
              <div className="flex space-x-3">
                {hotelInfo.socialMediaLinks?.filter(social => social.enabled && social.url).map((social, index) => (
                  <SocialIcon 
                    key={social.platform}
                    url={social.url} 
                    style={{ width: 24, height: 24 }}
                    className="hover:scale-110 transition-transform duration-200"
                  />
                ))}
              </div>
              
              {/* Rate us on Google */}
              <div className="pt-2">
                <Link 
                  href="#" 
                  className="inline-flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
                  title="Review us on Google"
                >
                  <SocialIcon 
                    url="https://maps.google.com" 
                    style={{ width: 20, height: 20 }}
                    className="group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 leading-none">review us</span>
                    <span className="text-sm text-gray-700 font-medium leading-none">on Google</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">

              <li>
                <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services#spa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Spa & Wellness
                </Link>
              </li>
              <li>
                <Link href="/services#dining" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Fine Dining
                </Link>
              </li>
              <li>
                <Link href="/services#events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Conference & Events
                </Link>
              </li>
              <li>
                <Link href="/services#fitness" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pool & Fitness
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-amber-600" />
                <span className="text-sm text-muted-foreground">
                  {hotelInfo.address || "123 Luxury Avenue, Downtown District, New York, NY 10001"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">{hotelInfo.primaryPhone || "+1 (555) 123-4567"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">{hotelInfo.reservationEmail || hotelInfo.primaryEmail || "reservations@grandluxe.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 {hotelInfo.name || "Grand Luxe Hotel"}. All rights reserved.
          </div>
          
          {/* Credit Section */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ by{' '}
              <a 
                href="https://digiworldtechnologies.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground underline hover:no-underline transition-all duration-200 font-medium"
              >
                Digiworld Infotech
              </a>
            </p>
          </div>
          
          <div className="flex gap-6">
            <button 
              onClick={openPrivacy}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={openTerms}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </Container>
      
      {/* Policy Modals */}
      <PrivacyModal />
      <TermsModal />
    </footer>
  )
}

export default Footer