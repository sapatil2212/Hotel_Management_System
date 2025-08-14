"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface HotelInfo {
  id?: string
  name: string
  tagline: string
  description: string
  logo?: string | null
  logoDisplayType?: string
  brandText?: string
  brandTextStyle?: string
  starRating: number
  overallRating: number
  reviewCount: number
  primaryPhone: string
  whatsappPhone: string
  primaryEmail: string
  reservationEmail: string
  address: string
  emergencyContact: string
  googleMapsEmbedCode: string
  latitude: number | null
  longitude: number | null
  directionsUrl: string
  nearbyAttractions: string[]
  distanceFromKeyPlaces: string[]
  checkInTime: string
  checkOutTime: string
  cancellationPolicy: string
  petPolicy: string
  smokingPolicy: string
  privacyPolicy?: string
  termsOfService?: string
  guestPolicies?: string
  bookingPartners: Array<{name: string, url: string, commission?: number}>
  partnerLogos: string[]
  propertyAmenities: string[]
  businessFacilities: string[]
  safetyFeatures: string[]
  services: string[]
  faqs?: Array<{ question: string; answer: string }>
  // Tax Configuration
  gstNumber?: string
  gstPercentage?: number
  serviceTaxPercentage?: number
  otherTaxes?: Array<{ name: string; percentage: number; description?: string }>
  taxEnabled?: boolean
  updatedAt?: string
}

interface HotelContextType {
  hotelInfo: HotelInfo
  updateHotelInfo: (newInfo: Partial<HotelInfo>) => void
  refreshHotelInfo: () => Promise<void>
  isLoading: boolean
}

const defaultHotelInfo: HotelInfo = {
  name: "Grand Luxe Hotel",
  tagline: "Luxury redefined",
  description: "",
  logo: null,
  logoDisplayType: "image",
  brandText: "",
  brandTextStyle: "default",
  starRating: 5,
  overallRating: 4.5,
  reviewCount: 0,
  primaryPhone: "+1 (555) 123-4567",
  whatsappPhone: "",
  primaryEmail: "info@grandluxe.com",
  reservationEmail: "reservations@grandluxe.com",
  address: "123 Luxury Avenue, Downtown District, New York, NY 10001",
  emergencyContact: "",
  googleMapsEmbedCode: "",
  latitude: null,
  longitude: null,
  directionsUrl: "",
  nearbyAttractions: [],
  distanceFromKeyPlaces: [],
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  cancellationPolicy: "",
  petPolicy: "",
  smokingPolicy: "",
  privacyPolicy: "",
  termsOfService: "",
  guestPolicies: "",
  bookingPartners: [],
  partnerLogos: [],
  propertyAmenities: [],
  businessFacilities: [],
  safetyFeatures: [],
  services: [],
  faqs: [],
  // Tax Configuration
  gstNumber: "",
  gstPercentage: 18.0,
  serviceTaxPercentage: 0.0,
  otherTaxes: [],
  taxEnabled: true
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>(defaultHotelInfo)
  const [isLoading, setIsLoading] = useState(true)

  const fetchHotelInfo = async () => {
    try {
      const response = await fetch('/api/hotel-info')
      if (response.ok) {
        const data = await response.json()
        const updatedInfo = {
          ...defaultHotelInfo,
          ...data,
          nearbyAttractions: data.nearbyAttractions || [],
          distanceFromKeyPlaces: data.distanceFromKeyPlaces || [],
          bookingPartners: data.bookingPartners || [],
          partnerLogos: data.partnerLogos || [],
          propertyAmenities: data.propertyAmenities || [],
          businessFacilities: data.businessFacilities || [],
          safetyFeatures: data.safetyFeatures || [],
          services: data.services || [],
          faqs: data.faqs || [],
          otherTaxes: data.otherTaxes || []
        }
        setHotelInfo(updatedInfo)
      } else {
        // Keep default values if API fails
        setHotelInfo(defaultHotelInfo)
      }
    } catch (error) {
      console.error('Error fetching hotel info:', error)
      // Keep default values if API fails
      setHotelInfo(defaultHotelInfo)
    } finally {
      setIsLoading(false)
    }
  }

  const updateHotelInfo = (newInfo: Partial<HotelInfo>) => {
    setHotelInfo(prev => ({ ...prev, ...newInfo }))
  }

  const refreshHotelInfo = async () => {
    setIsLoading(true)
    await fetchHotelInfo()
  }

  // Fetch hotel info on mount
  useEffect(() => {
    fetchHotelInfo()
  }, [])

  // Poll for updates every 30 seconds to catch backend changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHotelInfo()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Listen for storage events to catch updates from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hotel-info-updated') {
        refreshHotelInfo()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <HotelContext.Provider value={{ 
      hotelInfo, 
      updateHotelInfo, 
      refreshHotelInfo, 
      isLoading 
    }}>
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider')
  }
  return context
}
