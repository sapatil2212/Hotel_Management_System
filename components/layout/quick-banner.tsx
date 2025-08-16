"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Phone, Mail, Tag, X, ChevronLeft, ChevronRight, Sparkles, Gift, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

interface DetailedPromoCode extends PromoCode {
  validFrom?: string
  minOrderAmount?: number | null
  maxDiscountAmount?: number | null
  usageLimit?: number | null
  usedCount?: number | null
  applicableRooms?: string[] | null
  _count?: { bookings: number }
}

export function QuickBanner() {
  const { hotelInfo } = useHotel()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailedPromo, setDetailedPromo] = useState<DetailedPromoCode | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Fetch featured promo codes
  useEffect(() => {
    const fetchFeaturedPromoCodes = async () => {
      try {
        const response = await fetch('/api/promo-codes/featured')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          setPromoCodes(data.data)
        }
      } catch (error) {
        console.error('Error fetching featured promo codes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedPromoCodes()
  }, [])

  // Auto-rotate promo codes
  useEffect(() => {
    if (promoCodes.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length)
    }, 4000) // Slightly faster rotation

    return () => clearInterval(interval)
  }, [promoCodes.length, isHovered])

  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length)
  }

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + promoCodes.length) % promoCodes.length)
  }

  const openPromoDetails = async (promoId: string) => {
    setIsDialogOpen(true)
    setDetailsLoading(true)
    setDetailedPromo(null)
    try {
      const response = await fetch(`/api/promo-codes/${promoId}`)
      const data = await response.json()
      if (data.success) {
        setDetailedPromo(data.data)
      }
    } catch (err) {
      console.error('Error fetching promo details:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Calculate time remaining for the offer
  const getTimeRemaining = (validUntil: string) => {
    const now = new Date()
    const endDate = new Date(validUntil)
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return 'Ending soon!'
  }

  // Hide banner if user dismissed it OR if there are no active offers
  if (!isVisible || (!isLoading && promoCodes.length === 0)) return null

  return (
    <div 
      className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-700 dark:via-orange-700 dark:to-red-700 border-b border-amber-500 dark:border-amber-600 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse"></div>
      </div>
      
      <Container className="py-1.5 relative z-10">
        <div className="flex items-center justify-between">
          {/* Contact Information - Desktop Only */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {hotelInfo.primaryPhone && (
              <div className="flex items-center gap-2 text-white hover:text-amber-100 transition-colors duration-200 group">
                <div className="p-1.5 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">{hotelInfo.primaryPhone}</span>
              </div>
            )}
            
            {hotelInfo.reservationEmail && (
              <div className="flex items-center gap-2 text-white hover:text-amber-100 transition-colors duration-200 group">
                <div className="p-1.5 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">{hotelInfo.reservationEmail}</span>
              </div>
            )}
          </div>

          {/* Enhanced Promo Codes Section */}
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-3 text-white">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">Loading exclusive offers...</span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-4 group cursor-pointer"
                onClick={() => openPromoDetails(promoCodes[currentPromoIndex].id)}
              >
                {/* Navigation Arrows */}
                {promoCodes.length > 1 && (
                  <>
                                         <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation()
                         prevPromo()
                       }}
                       className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-200 opacity-0 group-hover:opacity-100"
                     >
                       <ChevronLeft className="h-2.5 w-2.5" />
                     </Button>
                  </>
                )}
                
                {/* Main Offer Display - Side by Side Layout */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  {/* Offer Icon */}
                  <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                    <Gift className="h-2.5 w-2.5 text-white" />
                  </div>
                  
                  {/* Special Offer Label */}
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-yellow-300 animate-pulse" />
                    <span className="text-xs font-semibold text-yellow-200 uppercase tracking-wider">
                      Special Offer
                    </span>
                    <Sparkles className="h-2.5 w-2.5 text-yellow-300 animate-pulse" />
                  </div>
                  
                  {/* Promo Code */}
                  <Badge className="bg-white text-amber-600 font-bold text-xs px-1.5 py-0.5 border-0 shadow-md">
                    {promoCodes[currentPromoIndex].code}
                  </Badge>
                  
                  {/* Offer Title */}
                  <span className="text-white font-semibold text-xs">
                    - {promoCodes[currentPromoIndex].title}
                  </span>
                  
                  {/* Time Remaining */}
                  {getTimeRemaining(promoCodes[currentPromoIndex].validUntil) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-2 w-2 text-yellow-200" />
                      <span className="text-xs text-yellow-200 font-medium">
                        {getTimeRemaining(promoCodes[currentPromoIndex].validUntil)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Navigation Arrows */}
                {promoCodes.length > 1 && (
                  <>
                                         <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation()
                         nextPromo()
                       }}
                       className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-200 opacity-0 group-hover:opacity-100"
                     >
                       <ChevronRight className="h-2.5 w-2.5" />
                     </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Close Button */}
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-200 hover:scale-110"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>

        {/* Offer Indicators - Mobile */}
        {promoCodes.length > 1 && (
          <div className="flex justify-center mt-0.5 md:hidden">
            <div className="flex space-x-1">
              {promoCodes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromoIndex(index)}
                  className={`w-0.5 h-0.5 rounded-full transition-all duration-200 ${
                    index === currentPromoIndex 
                      ? 'bg-white w-2' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to offer ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Contact Info - Hidden on mobile as per requirements */}
        {/* <div className="md:hidden mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          {hotelInfo.primaryPhone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="truncate">{hotelInfo.primaryPhone}</span>
            </div>
          )}
          
          {hotelInfo.reservationEmail && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{hotelInfo.reservationEmail}</span>
            </div>
          )}
        </div> */}
      </Container>

      {/* Enhanced Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">Exclusive Offer</div>
                <div className="text-sm text-gray-500">Limited time deal</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
            </div>
          ) : detailedPromo ? (
            <div className="space-y-4">
              {/* Promo Code Badge */}
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-6 py-3 font-bold border-0">
                  {detailedPromo.code}
                </Badge>
              </div>
              
              {/* Title and Description */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{detailedPromo.title}</h3>
                {detailedPromo.description && (
                  <p className="text-gray-600">{detailedPromo.description}</p>
                )}
              </div>
              
              {/* Discount Details */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Discount Type</div>
                    <div className="font-semibold capitalize">{detailedPromo.discountType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Discount Value</div>
                    <div className="font-semibold text-amber-600">
                      {detailedPromo.discountType === 'percentage' ? `${detailedPromo.discountValue}%` : `₹${detailedPromo.discountValue}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Valid From</div>
                    <div>{detailedPromo.validFrom ? format(new Date(detailedPromo.validFrom), 'PPP') : 'Now'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Valid Until</div>
                    <div className="text-red-600 font-semibold">{format(new Date(detailedPromo.validUntil), 'PPP')}</div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="space-y-3 text-sm">
                {typeof detailedPromo.minOrderAmount === 'number' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Minimum Order:</span>
                    <span className="font-semibold">₹{detailedPromo.minOrderAmount}</span>
                  </div>
                )}
                {typeof detailedPromo.maxDiscountAmount === 'number' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Maximum Discount:</span>
                    <span className="font-semibold text-amber-600">₹{detailedPromo.maxDiscountAmount}</span>
                  </div>
                )}
                {typeof detailedPromo.usageLimit === 'number' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Usage:</span>
                    <span className="font-semibold">{detailedPromo.usedCount ?? 0} / {detailedPromo.usageLimit}</span>
                  </div>
                )}
                {detailedPromo.applicableRooms && detailedPromo.applicableRooms.length > 0 && (
                  <div>
                    <div className="text-gray-500 mb-1">Applicable Rooms:</div>
                    <div className="text-gray-700 font-medium">
                      {detailedPromo.applicableRooms.includes('all') ? 'All room types' : detailedPromo.applicableRooms.join(', ')}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Star className="h-3 w-3 mt-0.5 text-amber-500" />
                  <span>Terms and conditions apply. Offers are subject to availability and may change without notice.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Unable to load offer details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
