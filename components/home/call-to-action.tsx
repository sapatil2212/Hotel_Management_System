"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { Calendar, Phone, Mail, Copy, Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useHotel } from "@/contexts/hotel-context"

interface PromoCode {
  id: string
  code: string
  title: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  validUntil: string
  isActive: boolean
}

const CallToAction = () => {
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { hotelInfo } = useHotel()

  // Fetch featured promo code
  useEffect(() => {
    const fetchFeaturedPromoCode = async () => {
      try {
        const response = await fetch('/api/promo-codes/featured?limit=1')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          setPromoCode(data.data[0])
        }
      } catch (error) {
        console.error('Error fetching featured promo code:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedPromoCode()
  }, [])

  // Copy promo code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl">
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

          <div className="relative z-10 p-8 lg:p-12">
            <div className="max-w-4xl mx-auto text-center text-white">
              {/* Badge */}
              <Badge className="mb-4 bg-amber-500/90 hover:bg-amber-500 text-white border-0 text-xs px-3 py-1">
                🌟 Limited Time Offer
              </Badge>

              {/* Main Content */}
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Ready to Experience{" "}
                <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
                  Luxury?
                </span>
              </h2>

              <p className="text-sm md:text-lg lg:text-xl mb-6 text-blue-100 max-w-2xl mx-auto">
                Book your unforgettable stay today and discover why {hotelInfo?.name || "our hotel"} is the premier choice for discerning travelers
              </p>

              {/* Special Offer */}
              {isLoading ? (
                <div className="mb-8 p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-sm mx-auto animate-pulse">
                  <div className="h-6 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded"></div>
                </div>
              ) : promoCode ? (
                <div className="mb-8 p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between gap-6">
                    {/* Left side - Promo Code */}
                    <div className="flex items-center justify-between gap-4 flex-1">
                      {/* Discount Info */}
                      <div className="text-left">
                        <div className="text-lg md:text-xl font-bold text-amber-300 mb-1">
                          Save {promoCode.discountValue}{promoCode.discountType === 'percentage' ? '%' : '₹'}
                        </div>
                        <div className="text-xs md:text-sm text-blue-100">
                          {promoCode.title}
                        </div>
                      </div>
                      
                      {/* Promo Code with Copy Action */}
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30 flex-shrink-0">
                        <span className="text-sm font-mono font-bold text-white">
                          {promoCode.code}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white hover:bg-white/20"
                          onClick={() => copyToClipboard(promoCode.code)}
                        >
                          {copiedCode === promoCode.code ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Right side - Book Your Stay Button */}
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 backdrop-blur-sm border border-white/30 text-white px-4 md:px-5 py-2 md:py-3 text-sm md:text-base font-semibold rounded-lg flex-shrink-0"
                      asChild
                    >
                      <Link href="/rooms">
                        Book Your Stay
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs text-blue-200">
                  <div>✓ Best Price Guarantee</div>
                  <div>✓ Free Cancellation</div>
                  <div>✓ Instant Confirmation</div>
                  <div>✓ 24/7 Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction