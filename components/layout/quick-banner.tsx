"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Phone, Mail, Tag, X, ChevronLeft, ChevronRight } from "lucide-react"
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
    if (promoCodes.length <= 1) return

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [promoCodes.length])

  // Discount display removed per requirements; show only code and title

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

  // Hide banner if user dismissed it OR if there are no active offers
  if (!isVisible || (!isLoading && promoCodes.length === 0)) return null

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-amber-200 dark:border-gray-700">
      <Container className="py-3">
        <div className="flex items-center justify-between">
          {/* Contact Information */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {hotelInfo.primaryPhone && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span>{hotelInfo.primaryPhone}</span>
              </div>
            )}
            
            {hotelInfo.reservationEmail && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>{hotelInfo.reservationEmail}</span>
              </div>
            )}
            
            {/* Address removed from quick banner */}
          </div>

          {/* Promo Codes Section */}
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                Loading offers...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPromo}
                  className="h-6 w-6 p-0 hover:bg-amber-100 dark:hover:bg-gray-700"
                  disabled={promoCodes.length <= 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-amber-600" />
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700"
                    onClick={() => openPromoDetails(promoCodes[currentPromoIndex].id)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="font-semibold mr-1">
                      {promoCodes[currentPromoIndex].code}
                    </span>
                    <span className="text-xs">
                      - {promoCodes[currentPromoIndex].title}
                    </span>
                  </Badge>
                  {promoCodes.length > 1 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentPromoIndex + 1} of {promoCodes.length}
                    </span>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPromo}
                  className="h-6 w-6 p-0 hover:bg-amber-100 dark:hover:bg-gray-700"
                  disabled={promoCodes.length <= 1}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-amber-100 dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Mobile Contact Info */}
        <div className="md:hidden mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
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
        </div>
      </Container>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              Full details for this promotional offer
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">Loading details...</div>
          ) : detailedPromo ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">Promo Code</span>
                <Badge>{detailedPromo.code}</Badge>
              </div>
              <div>
                <div className="font-medium">{detailedPromo.title}</div>
                {detailedPromo.description && (
                  <div className="text-gray-600 dark:text-gray-300 mt-1">{detailedPromo.description}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Valid From</div>
                  <div>{detailedPromo.validFrom ? format(new Date(detailedPromo.validFrom), 'PPP') : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Valid Until</div>
                  <div>{format(new Date(detailedPromo.validUntil), 'PPP')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Discount Type</div>
                  <div className="capitalize">{detailedPromo.discountType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Discount Value</div>
                  <div>
                    {detailedPromo.discountType === 'percentage' ? `${detailedPromo.discountValue}%` : `₹${detailedPromo.discountValue}`}
                  </div>
                </div>
                {typeof detailedPromo.minOrderAmount === 'number' && (
                  <div>
                    <div className="text-xs text-gray-500">Min Order Amount</div>
                    <div>₹{detailedPromo.minOrderAmount}</div>
                  </div>
                )}
                {typeof detailedPromo.maxDiscountAmount === 'number' && (
                  <div>
                    <div className="text-xs text-gray-500">Max Discount</div>
                    <div>₹{detailedPromo.maxDiscountAmount}</div>
                  </div>
                )}
                {typeof detailedPromo.usageLimit === 'number' && (
                  <div>
                    <div className="text-xs text-gray-500">Usage Limit</div>
                    <div>{detailedPromo.usedCount ?? 0} / {detailedPromo.usageLimit}</div>
                  </div>
                )}
              </div>
              {detailedPromo.applicableRooms && detailedPromo.applicableRooms.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Applicable Rooms</div>
                  <div className="text-gray-700 dark:text-gray-200 text-xs">
                    {detailedPromo.applicableRooms.includes('all') ? 'All room types' : detailedPromo.applicableRooms.join(', ')}
                  </div>
                </div>
              )}
              <div className="text-[10px] text-gray-500">* Terms and conditions apply. Offers are subject to availability and may change without notice.</div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300">Unable to load offer details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
