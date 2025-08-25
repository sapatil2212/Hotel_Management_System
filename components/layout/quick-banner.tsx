"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Phone, Mail, Tag, X, ChevronLeft, ChevronRight, Sparkles, Gift, Clock, Star, Copy, Check } from "lucide-react"
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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
      className="relative bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 dark:from-slate-800 dark:via-gray-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10"></div>
      </div>
      
      <Container className="py-1.5 relative z-10">
        <div className="flex items-center justify-between">
          {/* Contact Information - Desktop Only */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {hotelInfo.reservationEmail && (
              <div className="flex items-center gap-2 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors duration-200 group">
                <div className="p-1.5 bg-slate-200/60 dark:bg-slate-600/40 rounded-full group-hover:bg-slate-300/80 dark:group-hover:bg-slate-500/60 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">{hotelInfo.reservationEmail}</span>
              </div>
            )}
          </div>

          {/* Enhanced Promo Codes Section */}
          <div className="flex-1 flex items-center justify-center md:justify-center">
            {isLoading ? (
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 dark:border-slate-300 border-t-transparent"></div>
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
                       className="h-5 w-5 p-0 bg-slate-200/60 dark:bg-slate-600/40 hover:bg-slate-300/80 dark:hover:bg-slate-500/60 text-slate-700 dark:text-slate-200 border-0 transition-all duration-200 opacity-0 group-hover:opacity-100"
                     >
                       <ChevronLeft className="h-2.5 w-2.5" />
                     </Button>
                  </>
                )}
                
                {/* Main Offer Display - Side by Side Layout */}
                <div className="flex items-center gap-2 md:gap-3 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 border border-slate-200/60 dark:border-slate-600/60 hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-300 transform hover:scale-105 shadow-sm">
                  {/* Offer Icon */}
                  <div className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-md">
                    <Gift className="h-2 w-2 md:h-2.5 md:w-2.5 text-white" />
                  </div>
                  
                  {/* Special Offer Label */}
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-2 w-2 md:h-2.5 md:w-2.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Special Offer
                    </span>
                    <Sparkles className="h-2 w-2 md:h-2.5 md:w-2.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                  </div>
                  
                  {/* Promo Code */}
                  <Badge className="bg-amber-600 text-white font-bold text-xs px-1 md:px-1.5 py-0.5 border-0 shadow-md flex items-center gap-1">
                    <span>{promoCodes[currentPromoIndex].code}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(promoCodes[currentPromoIndex].code)
                      }}
                      className="p-0.5 hover:bg-amber-500/20 rounded transition-all duration-200 hover:scale-110"
                    >
                      {copiedCode === promoCodes[currentPromoIndex].code ? (
                        <Check className="h-2.5 w-2.5 text-green-300" />
                      ) : (
                        <Copy className="h-2.5 w-2.5 text-white/80 hover:text-white" />
                      )}
                    </button>
                  </Badge>
                  
                  {/* Offer Title */}
                  <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs truncate max-w-[120px] md:max-w-none">
                    - {promoCodes[currentPromoIndex].title}
                  </span>
                  
                  {/* Time Remaining - Hidden on mobile */}
                  {getTimeRemaining(promoCodes[currentPromoIndex].validUntil) && (
                    <div className="hidden md:flex items-center gap-1">
                      <Clock className="h-2 w-2 text-amber-500 dark:text-amber-400" />
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
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
                       className="h-5 w-5 p-0 bg-slate-200/60 dark:bg-slate-600/40 hover:bg-slate-300/80 dark:hover:bg-slate-500/60 text-slate-700 dark:text-slate-200 border-0 transition-all duration-200 opacity-0 group-hover:opacity-100"
                     >
                       <ChevronRight className="h-2.5 w-2.5" />
                     </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Close Button */}
          <div className="flex md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-5 w-5 p-0 bg-slate-200/60 dark:bg-slate-600/40 hover:bg-slate-300/80 dark:hover:bg-slate-500/60 text-slate-700 dark:text-slate-200 border-0 transition-all duration-200 hover:scale-110"
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
                      ? 'bg-amber-600 dark:bg-amber-400 w-2' 
                      : 'bg-slate-400 dark:bg-slate-500 hover:bg-slate-600 dark:hover:bg-slate-400'
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
        <DialogContent className="max-w-lg rounded-2xl md:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Gift className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <div className="text-base md:text-lg font-bold">Exclusive Offer</div>
                <div className="text-xs md:text-sm text-gray-500">Limited time deal</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center py-6 md:py-8">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-2 border-amber-500 border-t-transparent"></div>
            </div>
          ) : detailedPromo ? (
            <div className="space-y-3 md:space-y-4">
              {/* Promo Code Badge */}
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-base md:text-lg px-4 md:px-6 py-2 md:py-3 font-bold border-0 rounded-lg flex items-center gap-2 mx-auto w-fit">
                  <span>{detailedPromo.code}</span>
                  <button
                    onClick={() => copyToClipboard(detailedPromo.code)}
                    className="p-1 hover:bg-amber-500/20 rounded transition-all duration-200 hover:scale-110"
                  >
                    {copiedCode === detailedPromo.code ? (
                      <Check className="h-3 w-3 md:h-4 md:w-4 text-green-300" />
                    ) : (
                      <Copy className="h-3 w-3 md:h-4 md:w-4 text-white/80 hover:text-white" />
                    )}
                  </button>
                </Badge>
              </div>
              
              {/* Title and Description */}
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{detailedPromo.title}</h3>
                {detailedPromo.description && (
                  <p className="text-sm md:text-base text-gray-600">{detailedPromo.description}</p>
                )}
              </div>
              
              {/* Discount Details */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 md:p-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Valid From</div>
                    <div className="text-xs md:text-sm">{detailedPromo.validFrom ? format(new Date(detailedPromo.validFrom), 'PPP') : 'Now'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Valid Until</div>
                    <div className="text-red-600 font-semibold text-xs md:text-sm">{format(new Date(detailedPromo.validUntil), 'PPP')}</div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                {(typeof detailedPromo.minOrderAmount === 'number' || typeof detailedPromo.maxDiscountAmount === 'number') && (
                  <div className="grid grid-cols-2 gap-4">
                    {typeof detailedPromo.minOrderAmount === 'number' && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Minimum Order:</span>
                        <span className="font-semibold">₹{detailedPromo.minOrderAmount}</span>
                      </div>
                    )}
                    {typeof detailedPromo.maxDiscountAmount === 'number' && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Maximum Discount:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">₹{detailedPromo.maxDiscountAmount}</span>
                      </div>
                    )}
                  </div>
                )}
                {detailedPromo.applicableRooms && detailedPromo.applicableRooms.length > 0 && (
                  <div>
                    <div className="text-gray-500 mb-1 text-xs md:text-sm">Applicable Rooms:</div>
                    <div className="text-gray-700 font-medium text-xs md:text-sm">
                      {detailedPromo.applicableRooms.includes('all') ? 'All room types' : detailedPromo.applicableRooms.join(', ')}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-2 md:p-3">
                <div className="flex items-start gap-2">
                  <Star className="h-3 w-3 mt-0.5 text-amber-500" />
                  <span className="text-xs">Terms and conditions apply. Offers are subject to availability and may change without notice.</span>
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
