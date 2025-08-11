"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail } from "lucide-react"
import { useHotel } from "@/contexts/hotel-context"

const Footer = () => {
  const { hotelInfo } = useHotel()
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 border-t">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold">
                GL
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent">
                  {hotelInfo.name || "Grand Luxe"}
                </span>
                <div className="text-sm text-muted-foreground">Hotel</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              {hotelInfo.tagline || "Experience unparalleled luxury and comfort at Grand Luxe Hotel. Where every detail is crafted for your perfect stay."}
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-amber-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-amber-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-amber-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-amber-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
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
            © 2024 {hotelInfo.name || "Grand Luxe Hotel"}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button size="sm" variant="outline">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Sign Up</Button>
            </Link>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer