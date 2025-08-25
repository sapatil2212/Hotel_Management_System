"use client"

import { useState, useEffect, useCallback } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Phone, 
  MapPin, 
  Shield, 
  Building2, 
  Save, 
  Plus, 
  X, 
  Info,
  RotateCcw,
  Loader2,
  ExternalLink,
  Trash2,
  Calculator,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

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
  bookingConfirmationTerms?: string
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
  socialMediaLinks?: Array<{ platform: string; url: string; enabled: boolean }>
}

export default function HotelInfoPage() {
  const [loading, setLoading] = useState(false)
  const { hotelInfo, updateHotelInfo, refreshHotelInfo, isLoading } = useHotel()
  const [newAttraction, setNewAttraction] = useState("")
  const [newAmenity, setNewAmenity] = useState("")
  const [newBusinessFacility, setNewBusinessFacility] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Ensure social media links are initialized
  useEffect(() => {
    if (hotelInfo && !hotelInfo.socialMediaLinks) {
      const defaultSocialLinks = [
        { platform: "facebook", url: "", enabled: false },
        { platform: "instagram", url: "", enabled: false },
        { platform: "twitter", url: "", enabled: false },
        { platform: "linkedin", url: "", enabled: false },
        { platform: "youtube", url: "", enabled: false }
      ]
      updateHotelInfo({ socialMediaLinks: defaultSocialLinks })
    }
  }, [hotelInfo, updateHotelInfo])

  const handleSave = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hotel-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelInfo),
      })

      if (response.ok) {
        const updatedData = await response.json()
        // Update the global context with the saved data
        updateHotelInfo(updatedData)
        
        // Trigger update for other tabs/windows
        localStorage.setItem('hotel-info-updated', Date.now().toString())
        
        // Don't refresh the context immediately to prevent form clearing
        // The data is already updated via updateHotelInfo above
        
        toast.success('Hotel information saved successfully!')
        setIsDirty(false)
        // Clear activity tracking after successful save
        localStorage.removeItem('hotel-info-last-activity')
        // Show success modal
        setShowSuccessModal(true)
      } else {
        toast.error('Failed to save hotel information')
      }
    } catch (error) {
      console.error('Error saving hotel info:', error)
      toast.error('Failed to save hotel information')
    } finally {
      setLoading(false)
    }
  }, [hotelInfo, updateHotelInfo])

  const updateHotelField = (field: string, value: any) => {
    setIsDirty(true)
    updateHotelInfo({ [field]: value })
    // Track user activity to prevent auto-refresh interference
    localStorage.setItem('hotel-info-last-activity', Date.now().toString())
  }

  const addItem = (field: keyof HotelInfo, item: any) => {
    const currentArray = hotelInfo[field] as any[]
    updateHotelInfo({
      [field]: [...currentArray, item]
    })
    setIsDirty(true)
    // Track user activity to prevent auto-refresh interference
    localStorage.setItem('hotel-info-last-activity', Date.now().toString())
  }

  const removeItem = (field: keyof HotelInfo, index: number) => {
    const currentArray = hotelInfo[field] as any[]
    updateHotelInfo({
      [field]: currentArray.filter((_, i) => i !== index)
    })
    setIsDirty(true)
    // Track user activity to prevent auto-refresh interference
    localStorage.setItem('hotel-info-last-activity', Date.now().toString())
  }

  const handleReset = async () => {
    setLoading(true)
    try {
      await refreshHotelInfo()
      setIsDirty(false)
      // Clear activity tracking after reset
      localStorage.removeItem('hotel-info-last-activity')
      toast.success('Reverted unsaved changes')
    } catch (err) {
      toast.error('Failed to reset changes')
    } finally {
      setLoading(false)
    }
  }

  // Inline FAQ editor component definition
  function FAQManager() {
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const faqs = (hotelInfo as any).faqs as Array<{question: string; answer: string}> || []

    const addFaq = () => {
      if (!question.trim() || !answer.trim()) {
        toast.error('Please enter both question and answer')
        return
      }
      // Prevent duplicate by exact question match (case-insensitive)
      const exists = faqs.some(f => f.question.trim().toLowerCase() === question.trim().toLowerCase())
      if (exists) {
        toast.error('A FAQ with the same question already exists')
        return
      }
      const next = [...faqs, { question: question.trim(), answer: answer.trim() }]
      updateHotelField('faqs' as any, next)
      setQuestion("")
      setAnswer("")
      // Track user activity to prevent auto-refresh interference
      localStorage.setItem('hotel-info-last-activity', Date.now().toString())
    }

    const removeFaq = (index: number) => {
      const next = faqs.filter((_, i) => i !== index)
      updateHotelField('faqs' as any, next)
      // Track user activity to prevent auto-refresh interference
      localStorage.setItem('hotel-info-last-activity', Date.now().toString())
    }

    return (
       <div className="space-y-4 sm:space-y-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="faqQuestion" className="text-sm font-medium text-slate-700 mb-2 block">Question</Label>
            <Input id="faqQuestion" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" className="h-11" />
          </div>
          <div>
            <Label htmlFor="faqAnswer" className="text-sm font-medium text-slate-700 mb-2 block">Answer</Label>
            <Input id="faqAnswer" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter short answer" className="h-11" />
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button type="button" onClick={addFaq} className="bg-amber-600 hover:bg-amber-700">Add FAQ</Button>
           <Button type="button" variant="outline" onClick={() => { setQuestion(''); setAnswer('') }} className="border-amber-300 text-amber-700 hover:bg-amber-50">Clear</Button>
        </div>
        <Separator />
         <div className="space-y-3 px-1">
          {faqs.length === 0 && (
            <p className="text-sm text-slate-500">No FAQs added yet.</p>
          )}
          {faqs.map((item, index) => (
             <div key={index} className="flex items-start justify-between gap-4 p-3 sm:p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="text-sm font-medium">{item.question}</div>
                <div className="text-sm text-slate-600">{item.answer}</div>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => removeFaq(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [isDirty])

  // Track when user starts editing to prevent auto-refresh
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem('hotel-info-last-activity', Date.now().toString())
    }
  }, [isDirty])

  // Add activity tracking for form interactions
  useEffect(() => {
    const trackActivity = () => {
      localStorage.setItem('hotel-info-last-activity', Date.now().toString())
    }

    // Track form-specific events
    const events = ['input', 'change', 'focus', 'blur']
    
    // Only track events on form elements within this page
    const formElements = document.querySelectorAll('input, textarea, select, button')
    
    const eventListeners = events.map(event => {
      const listener = (e: Event) => {
        // Only track if the event is on a form element
        if (formElements.length > 0 && Array.from(formElements).some(el => el.contains(e.target as Node))) {
          trackActivity()
        }
      }
      
      document.addEventListener(event, listener, { passive: true })
      return { event, listener }
    })

    return () => {
      eventListeners.forEach(({ event, listener }) => {
        document.removeEventListener(event, listener)
      })
    }
  }, [])

  // Save on Ctrl/Cmd + S
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (!loading) {
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave, loading])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Hotel Information</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-2 mt-1">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Manage hotel details</h1>
              {isDirty ? (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Unsaved changes</Badge>
              ) : (
                <Badge variant="outline" className="text-slate-600">Up to date</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" onClick={handleReset} disabled={loading || !isDirty} className="h-10 rounded-lg">
                     <RotateCcw className="h-4 w-4 sm:mr-2" />
                     <span className="hidden sm:inline">Reset</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Discard unsaved changes</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button onClick={handleSave} disabled={loading || !isDirty} className="h-10 rounded-lg bg-amber-600 hover:bg-amber-700">
                    {loading ? (
                      <>
                         <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                         <span className="hidden sm:inline">Saving</span>
                      </>
                    ) : (
                      <>
                         <Save className="h-4 w-4 sm:mr-2" />
                         <span className="hidden sm:inline">Save changes</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ctrl/⌘ + S</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Loading State */}
        {isLoading && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Loading Hotel Information</h3>
                  <p className="text-sm text-blue-700">
                    Please wait while we fetch your hotel details from the database...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 bg-slate-100 p-1 rounded-lg gap-1">
               <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">Basic Info</TabsTrigger>
               <TabsTrigger value="faqs" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">FAQs</TabsTrigger>
               <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">Contact</TabsTrigger>
               <TabsTrigger value="location" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">Location</TabsTrigger>
               <TabsTrigger value="social" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">Social Media</TabsTrigger>
               <TabsTrigger value="taxes" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">Taxes</TabsTrigger>
               <TabsTrigger value="policies" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900">Policies</TabsTrigger>
            </TabsList>

                        <div className="mt-4 sm:mt-6">
              <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-8">
                  {/* Basic Information */}
                    <Card className="border-slate-200 rounded-xl">
                      <CardHeader className="pb-2 px-4 sm:px-6">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                      <CardContent className="space-y-4 px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name" className="text-xs font-medium text-slate-700 mb-1 block">
                            Hotel Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={hotelInfo.name}
                            onChange={(e) => updateHotelField('name', e.target.value)}
                            placeholder="Enter hotel name"
                              className="h-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                          />
                          <p className="mt-1 text-xs text-slate-500">Displayed across guest-facing pages and emails.</p>
                        </div>
                        
                        <div>
                            <Label htmlFor="tagline" className="text-xs font-medium text-slate-700 mb-1 block">
                            Tagline
                          </Label>
                          <Input
                            id="tagline"
                            value={hotelInfo.tagline}
                            onChange={(e) => updateHotelField('tagline', e.target.value)}
                            placeholder="Enter hotel tagline"
                              className="h-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                          />
                        </div>
                          </div>
                          
                                                                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="description" className="text-xs font-medium text-slate-700 mb-1 block">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                               rows={6}
                          value={hotelInfo.description}
                          onChange={(e) => updateHotelField('description', e.target.value)}
                          placeholder="Describe your hotel's unique features, atmosphere, and what makes it special..."
                               className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-y text-sm"
                        />
                        <p className="mt-1 text-xs text-slate-500">Keep it concise and guest-friendly. Markdown is supported in guest views if enabled.</p>
                      </div>
                           
                        <div>
                             <Label className="text-xs font-medium text-slate-700 mb-1 block">
                               Logo Upload
                          </Label>
                          <ImageUpload
                            value={[]}
                            onChange={(urls) => updateHotelField('logo', urls[0] || null)}
                            maxImages={1}
                               className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                             />
                             {hotelInfo.logo && (
                               <div className="mt-2 p-2 border rounded-lg bg-slate-50 flex items-center justify-center">
                              <img 
                                src={hotelInfo.logo} 
                                alt="Hotel Logo" 
                                   className="h-12 w-auto object-contain border rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  
                </div>
              </TabsContent>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-4 sm:space-y-6">
                <Card className="border-slate-200 rounded-xl">
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <FAQManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 sm:space-y-6">
                <Card className="border-slate-200 rounded-xl">
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-purple-50 rounded-md">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <Label htmlFor="primaryPhone" className="text-sm font-medium text-slate-700 mb-2 block">
                          Primary Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="primaryPhone"
                          value={hotelInfo.primaryPhone}
                          onChange={(e) => updateHotelField('primaryPhone', e.target.value)}

                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                        />
                        <p className="mt-1 text-xs text-slate-500">Shown on booking confirmations and contact pages.</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="whatsappPhone" className="text-sm font-medium text-slate-700 mb-2 block">
                          WhatsApp Number
                        </Label>
                        <Input
                          id="whatsappPhone"
                          value={hotelInfo.whatsappPhone}
                          onChange={(e) => updateHotelField('whatsappPhone', e.target.value)}

                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="primaryEmail" className="text-sm font-medium text-slate-700 mb-2 block">
                          Primary Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="primaryEmail"
                          type="email"
                          value={hotelInfo.primaryEmail}
                          onChange={(e) => updateHotelField('primaryEmail', e.target.value)}

                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="reservationEmail" className="text-sm font-medium text-slate-700 mb-2 block">
                          Reservation Email
                        </Label>
                        <Input
                          id="reservationEmail"
                          type="email"
                          value={hotelInfo.reservationEmail}
                          onChange={(e) => updateHotelField('reservationEmail', e.target.value)}

                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="emergencyContact" className="text-sm font-medium text-slate-700 mb-2 block">
                          Emergency Contact
                        </Label>
                        <Input
                          id="emergencyContact"
                          value={hotelInfo.emergencyContact}
                          onChange={(e) => updateHotelField('emergencyContact', e.target.value)}

                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-slate-700 mb-2 block">
                        Complete Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="address"
                        rows={4}
                        value={hotelInfo.address}
                        onChange={(e) => updateHotelField('address', e.target.value)}
                        placeholder="Enter the complete hotel address..."
                        className="border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg resize-y"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 sm:space-y-6">
                <Card className="border-slate-200 rounded-xl">
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-orange-50 rounded-md">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      Location & Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <Label htmlFor="latitude" className="text-sm font-medium text-slate-700 mb-2 block">
                          Latitude
                        </Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={hotelInfo.latitude || ""}
                          onChange={(e) => updateHotelField('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="28.6139"
                          className="h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="longitude" className="text-sm font-medium text-slate-700 mb-2 block">
                          Longitude
                        </Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={hotelInfo.longitude || ""}
                          onChange={(e) => updateHotelField('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="77.2090"
                          className="h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="directionsUrl" className="text-sm font-medium text-slate-700 mb-2 block">
                        Directions URL
                      </Label>
                      <Input
                        id="directionsUrl"
                        value={hotelInfo.directionsUrl}
                        onChange={(e) => updateHotelField('directionsUrl', e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                      />
                      {hotelInfo.directionsUrl && (
                        <a href={hotelInfo.directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline">
                          Open in Maps <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="googleMapsEmbedCode" className="text-sm font-medium text-slate-700 mb-2 block">
                        Google Maps Embed Code
                      </Label>
                      <Textarea
                        id="googleMapsEmbedCode"
                        rows={4}
                        value={hotelInfo.googleMapsEmbedCode}
                        onChange={(e) => updateHotelField('googleMapsEmbedCode', e.target.value)}
                        placeholder="<iframe src='...' ></iframe>"
                        className="border-slate-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg resize-y"
                      />
                      {hotelInfo.googleMapsEmbedCode && (
                        <div className="mt-4 rounded-lg border border-slate-200 overflow-hidden">
                          {/* eslint-disable-next-line react/no-danger */}
                          <div dangerouslySetInnerHTML={{ __html: hotelInfo.googleMapsEmbedCode }} />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Nearby Attractions
                      </Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newAttraction}
                          onChange={(e) => setNewAttraction(e.target.value)}
                          placeholder="Add nearby attraction..."
                          className="h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newAttraction.trim()) {
                              addItem('nearbyAttractions', newAttraction.trim())
                              setNewAttraction("")
                            }
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-5 rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hotelInfo.nearbyAttractions.map((attraction, index) => (
                          <Badge key={index} variant="secondary" className="bg-orange-50 text-orange-800 border-orange-200 px-3 py-1 rounded-full">
                            {attraction}
                            <button
                              onClick={() => removeItem('nearbyAttractions', index)}
                              className="ml-2 text-orange-600 hover:text-orange-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Safety Features
                      </Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newAttraction}
                          onChange={(e) => setNewAttraction(e.target.value)}
                          placeholder="Add safety feature..."
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newAttraction.trim()) {
                              addItem('safetyFeatures', newAttraction.trim())
                              setNewAttraction("")
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hotelInfo.safetyFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-800 border-green-200 px-3 py-1 rounded-full">
                            {feature}
                            <button
                              onClick={() => removeItem('safetyFeatures', index)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Services
                      </Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newAttraction}
                          onChange={(e) => setNewAttraction(e.target.value)}
                          placeholder="Add service..."
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newAttraction.trim()) {
                              addItem('services', newAttraction.trim())
                              setNewAttraction("")
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hotelInfo.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-800 border-purple-200 px-3 py-1 rounded-full">
                            {service}
                            <button
                              onClick={() => removeItem('services', index)}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

                            <TabsContent value="social" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-8">
                  {/* Social Media Links */}
                  <Card className="border-slate-200 rounded-xl">
                    <CardHeader className="pb-2 px-4 sm:px-6">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-purple-50 rounded-md">
                          <ExternalLink className="h-5 w-5 text-purple-600" />
                        </div>
                        Social Media Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                      <p className="text-sm text-slate-600 mb-4">
                         Manage your social media links that will be displayed in the footer.
                      </p>
                      
                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         {(hotelInfo.socialMediaLinks || []).map((social, index) => (
                            <div key={social.platform} className="flex items-center gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={social.enabled}
                                                                     onChange={(e) => {
                                     const updatedLinks = [...(hotelInfo.socialMediaLinks || [])]
                                     updatedLinks[index] = { ...social, enabled: e.target.checked }
                                     updateHotelField('socialMediaLinks', updatedLinks)
                                   }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                               <span className="text-sm font-medium text-slate-700 capitalize min-w-[80px]">
                                  {social.platform}
                                </span>
                            </div>
                            
                            <div className="flex-1">
                              <Input
                                value={social.url}
                                                                 onChange={(e) => {
                                   const updatedLinks = [...(hotelInfo.socialMediaLinks || [])]
                                   updatedLinks[index] = { ...social, url: e.target.value }
                                   updateHotelField('socialMediaLinks', updatedLinks)
                                 }}
                                 placeholder={`${social.platform} URL`}
                                 className="h-9 border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg text-sm"
                              />
                            </div>
                            
                             <div className="flex items-center gap-1">
                              {social.enabled && social.url && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                         className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                                      >
                                         <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Open {social.platform} profile</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              
                              <button
                                                                 onClick={() => {
                                   const updatedLinks = [...(hotelInfo.socialMediaLinks || [])]
                                   updatedLinks[index] = { ...social, url: "", enabled: false }
                                   updateHotelField('socialMediaLinks', updatedLinks)
                                 }}
                                 className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Clear link"
                              >
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Social Media Integration</p>
                            <p className="text-blue-700">
                              Only enabled platforms with valid URLs will be displayed in the footer. 
                              Make sure to use the complete profile URLs (e.g., https://facebook.com/yourpage).
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="taxes" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-8">
                  {/* Tax Configuration */}
                  <Card className="border-slate-200 rounded-xl">
                    <CardHeader className="pb-2 px-4 sm:px-6">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-green-50 rounded-md">
                          <Calculator className="h-5 w-5 text-green-600" />
                        </div>
                        Tax Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Enable Tax Calculation</Label>
                            <p className="text-xs text-slate-500 mt-1">Apply taxes to all bookings</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={hotelInfo.taxEnabled || false}
                              onChange={(e) => updateHotelField('taxEnabled', e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {hotelInfo.taxEnabled && (
                          <>
                            <Separator />
                            
                                                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="gstNumber" className="text-sm font-medium text-slate-700 mb-2 block">
                                GST Number
                              </Label>
                              <Input
                                id="gstNumber"
                                value={hotelInfo.gstNumber || ''}
                                onChange={(e) => updateHotelField('gstNumber', e.target.value)}
                                placeholder="22AAAAA0000A1Z5"
                                className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                              />
                              <p className="mt-1 text-xs text-slate-500">Enter your 15-digit GST identification number.</p>
                            </div>

                              <div>
                                <Label htmlFor="gstPercentage" className="text-sm font-medium text-slate-700 mb-2 block">
                                  GST Percentage (%)
                                </Label>
                                <Input
                                  id="gstPercentage"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={hotelInfo.gstPercentage || 18}
                                  onChange={(e) => updateHotelField('gstPercentage', parseFloat(e.target.value) || 0)}
                                  className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                                />
                                <p className="mt-1 text-xs text-slate-500">Standard GST rate (typically 18% for hotels).</p>
                              </div>

                              <div>
                                <Label htmlFor="serviceTaxPercentage" className="text-sm font-medium text-slate-700 mb-2 block">
                                  Service Tax (%)
                                </Label>
                                <Input
                                  id="serviceTaxPercentage"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={hotelInfo.serviceTaxPercentage || 0}
                                  onChange={(e) => updateHotelField('serviceTaxPercentage', parseFloat(e.target.value) || 0)}
                                  className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                                />
                                <p className="mt-1 text-xs text-slate-500">Additional service tax if applicable.</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>


                </div>

                {/* Tax Calculation Preview */}
                {hotelInfo.taxEnabled && (
                  <Card className="border-slate-200 rounded-xl">
                    <CardHeader className="pb-2 px-4 sm:px-6">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        Tax Calculation Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 mb-3">Example: Room booking of ₹2,000</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Amount:</span>
                            <span>₹2,000.00</span>
                          </div>
                          {(hotelInfo.gstPercentage || 0) > 0 && (
                            <div className="flex justify-between">
                              <span>GST ({hotelInfo.gstPercentage}%):</span>
                              <span>₹{((2000 * (hotelInfo.gstPercentage || 0)) / 100).toFixed(2)}</span>
                            </div>
                          )}
                          {(hotelInfo.serviceTaxPercentage || 0) > 0 && (
                            <div className="flex justify-between">
                              <span>Service Tax ({hotelInfo.serviceTaxPercentage}%):</span>
                              <span>₹{((2000 * (hotelInfo.serviceTaxPercentage || 0)) / 100).toFixed(2)}</span>
                            </div>
                          )}

                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total Amount:</span>
                            <span>₹{(2000 + (2000 * ((hotelInfo.gstPercentage || 0) + (hotelInfo.serviceTaxPercentage || 0)) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

                            <TabsContent value="policies" className="space-y-4 sm:space-y-6">
                <Card className="border-slate-200 rounded-xl">
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-rose-50 rounded-md">
                        <Shield className="h-5 w-5 text-rose-600" />
                      </div>
                      Hotel Policies
                    </CardTitle>
                  </CardHeader>
                                    <CardContent className="space-y-4 px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkInTime" className="text-xs font-medium text-slate-700 mb-1 block">
                          Check-in Time
                        </Label>
                        <Input
                          id="checkInTime"
                          value={hotelInfo.checkInTime}
                          onChange={(e) => updateHotelField('checkInTime', e.target.value)}
                          placeholder="3:00 PM"
                           className="h-9 border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg text-sm"
                        />
                      </div>
                      
                      <div>
                         <Label htmlFor="checkOutTime" className="text-xs font-medium text-slate-700 mb-1 block">
                          Check-out Time
                        </Label>
                        <Input
                          id="checkOutTime"
                          value={hotelInfo.checkOutTime}
                          onChange={(e) => updateHotelField('checkOutTime', e.target.value)}
                          placeholder="11:00 AM"
                           className="h-9 border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <Label htmlFor="cancellationPolicy" className="text-xs font-medium text-slate-700 mb-1 block">
                        Cancellation Policy
                      </Label>
                      <Textarea
                        id="cancellationPolicy"
                           rows={3}
                        value={hotelInfo.cancellationPolicy}
                        onChange={(e) => updateHotelField('cancellationPolicy', e.target.value)}
                        placeholder="Describe your cancellation policy..."
                           className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                      />
                    </div>
                    
                    <div>
                         <Label htmlFor="guestPolicies" className="text-xs font-medium text-slate-700 mb-1 block">
                           Guest Policies
                         </Label>
                         <Textarea
                           id="guestPolicies"
                           rows={3}
                           value={(hotelInfo as any).guestPolicies || ""}
                           onChange={(e) => updateHotelField('guestPolicies', e.target.value)}
                           placeholder="General policies and guidelines..."
                           className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                         />
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="privacyPolicy" className="text-xs font-medium text-slate-700 mb-1 block">
                        Privacy Policy
                      </Label>
                      <Textarea
                        id="privacyPolicy"
                           rows={4}
                        value={hotelInfo.privacyPolicy || ""}
                        onChange={(e) => updateHotelField('privacyPolicy', e.target.value)}
                        placeholder="Enter your privacy policy content..."
                           className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                      />
                      <p className="mt-1 text-xs text-slate-500">This policy explains how you collect, use, and protect guest information.</p>
                    </div>
                    
                    <div>
                         <Label htmlFor="termsOfService" className="text-xs font-medium text-slate-700 mb-1 block">
                        Terms of Service
                      </Label>
                      <Textarea
                        id="termsOfService"
                           rows={4}
                        value={hotelInfo.termsOfService || ""}
                        onChange={(e) => updateHotelField('termsOfService', e.target.value)}
                        placeholder="Enter your terms of service content..."
                           className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                      />
                      <p className="mt-1 text-xs text-slate-500">These terms govern the use of your hotel services and website.</p>
                       </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bookingConfirmationTerms" className="text-xs font-medium text-slate-700 mb-1 block">
                        Booking Confirmation Terms & Conditions
                      </Label>
                      <Textarea
                        id="bookingConfirmationTerms"
                        rows={6}
                        value={hotelInfo.bookingConfirmationTerms || ""}
                        onChange={(e) => updateHotelField('bookingConfirmationTerms', e.target.value)}
                        placeholder="Enter terms and conditions that will appear on booking confirmation PDFs..."
                        className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                      />
                      <p className="mt-1 text-xs text-slate-500">These terms will be displayed on booking confirmation PDFs and invoices. Use bullet points (•) for better formatting.</p>
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800 font-medium mb-1">Formatting Tips:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Use "•" for bullet points (e.g., "• All bookings are subject to availability")</li>
                          <li>• Start with "Standard Terms:" for the heading</li>
                          <li>• Each line will be formatted automatically in the PDF</li>
                          <li>• Leave empty lines for better spacing</li>
                        </ul>
                      </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <Label htmlFor="petPolicy" className="text-xs font-medium text-slate-700 mb-1 block">
                          Pet Policy
                        </Label>
                        <Textarea
                          id="petPolicy"
                           rows={3}
                          value={hotelInfo.petPolicy || ""}
                          onChange={(e) => updateHotelField('petPolicy', e.target.value)}
                          placeholder="Describe your pet policy..."
                           className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                        />
                        <p className="mt-1 text-xs text-slate-500">Specify if pets are allowed and any restrictions.</p>
                      </div>
                      
                      <div>
                         <Label htmlFor="smokingPolicy" className="text-xs font-medium text-slate-700 mb-1 block">
                          Smoking Policy
                        </Label>
                        <Textarea
                          id="smokingPolicy"
                           rows={3}
                          value={hotelInfo.smokingPolicy || ""}
                          onChange={(e) => updateHotelField('smokingPolicy', e.target.value)}
                          placeholder="Describe your smoking policy..."
                           className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y text-sm"
                        />
                        <p className="mt-1 text-xs text-slate-500">Specify smoking areas and restrictions.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Amenities and Services */}
                <Card className="border-slate-200 rounded-xl">
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      Amenities & Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                         <Label className="text-xs font-medium text-slate-700 mb-1 block">
                        Property Amenities
                      </Label>
                         <div className="flex gap-2 mb-2">
                        <Input
                          value={newAmenity}
                          onChange={(e) => setNewAmenity(e.target.value)}
                          placeholder="Add property amenity..."
                             className="h-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newAmenity.trim()) {
                              addItem('propertyAmenities', newAmenity.trim())
                              setNewAmenity("")
                            }
                          }}
                             className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg"
                        >
                             <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                         <div className="flex flex-wrap gap-1.5">
                        {hotelInfo.propertyAmenities.map((amenity, index) => (
                             <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200 px-2 py-0.5 rounded-full text-xs">
                            {amenity}
                            <button
                              onClick={() => removeItem('propertyAmenities', index)}
                                 className="ml-1.5 text-blue-600 hover:text-blue-800"
                            >
                                 <X className="h-2.5 w-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                         <Label className="text-xs font-medium text-slate-700 mb-1 block">
                        Business Facilities
                      </Label>
                         <div className="flex gap-2 mb-2">
                        <Input
                          value={newBusinessFacility}
                          onChange={(e) => setNewBusinessFacility(e.target.value)}
                          placeholder="Add business facility..."
                             className="h-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newBusinessFacility.trim()) {
                              addItem('businessFacilities', newBusinessFacility.trim())
                              setNewBusinessFacility("")
                            }
                          }}
                             className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg"
                        >
                             <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                         <div className="flex flex-wrap gap-1.5">
                        {hotelInfo.businessFacilities.map((facility, index) => (
                             <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200 px-2 py-0.5 rounded-full text-xs">
                            {facility}
                            <button
                              onClick={() => removeItem('businessFacilities', index)}
                                 className="ml-1.5 text-blue-600 hover:text-blue-800"
                            >
                                 <X className="h-2.5 w-2.5" />
                            </button>
                          </Badge>
                        ))}
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>

               {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="w-[90vw] max-w-md mx-4 rounded-xl">
                       <DialogHeader>
              <DialogTitle className="flex flex-col items-center justify-center gap-3 text-lg">
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <span>Success!</span>
              </DialogTitle>
            </DialogHeader>
           <div className="space-y-4">
             <div className="text-center">
               <h3 className="text-lg font-semibold text-slate-900 mb-2">
                 Hotel Information Updated
               </h3>
                               <p className="text-slate-600 mb-6 text-sm">
                  Your hotel information has been successfully saved and updated across all guest-facing pages.
                </p>
             </div>
             
             
           </div>
         </DialogContent>
       </Dialog>
    </div>
  )
}