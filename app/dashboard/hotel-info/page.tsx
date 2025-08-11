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
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Star, 
  Phone, 
  MapPin, 
  Shield, 
  Users, 
  Building2, 
  Save, 
  Plus, 
  X, 
  CheckCircle2,
  Info,
  RotateCcw,
  Loader2,
  ExternalLink,
  Trash2,
  Calculator
} from "lucide-react"
import { toast } from "sonner"

interface HotelInfo {
  id?: string
  name: string
  tagline: string
  description: string
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
}

export default function HotelInfoPage() {
  const [loading, setLoading] = useState(false)
  const { hotelInfo, updateHotelInfo, refreshHotelInfo } = useHotel()
  const [newAttraction, setNewAttraction] = useState("")
  const [isDirty, setIsDirty] = useState(false)

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
        
        // Refresh the context to ensure consistency
        await refreshHotelInfo()
        
        toast.success('Hotel information saved successfully!')
        setIsDirty(false)
      } else {
        toast.error('Failed to save hotel information')
      }
    } catch (error) {
      console.error('Error saving hotel info:', error)
      toast.error('Failed to save hotel information')
    } finally {
      setLoading(false)
    }
  }, [hotelInfo, refreshHotelInfo, updateHotelInfo])

  const updateHotelField = (field: string, value: any) => {
    setIsDirty(true)
    updateHotelInfo({ [field]: value })
  }

  const addItem = (field: keyof HotelInfo, item: any) => {
    const currentArray = hotelInfo[field] as any[]
    updateHotelInfo({
      [field]: [...currentArray, item]
    })
    setIsDirty(true)
  }

  const removeItem = (field: keyof HotelInfo, index: number) => {
    const currentArray = hotelInfo[field] as any[]
    updateHotelInfo({
      [field]: currentArray.filter((_, i) => i !== index)
    })
    setIsDirty(true)
  }

  const handleReset = async () => {
    setLoading(true)
    try {
      await refreshHotelInfo()
      setIsDirty(false)
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
    }

    const removeFaq = (index: number) => {
      const next = faqs.filter((_, i) => i !== index)
      updateHotelField('faqs' as any, next)
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Button type="button" onClick={addFaq} className="bg-blue-600 hover:bg-blue-700">Add FAQ</Button>
          <Button type="button" variant="outline" onClick={() => { setQuestion(''); setAnswer('') }}>Clear</Button>
        </div>
        <Separator />
        <div className="space-y-3">
          {faqs.length === 0 && (
            <p className="text-sm text-slate-500">No FAQs added yet.</p>
          )}
          {faqs.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
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
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
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
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Discard unsaved changes</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSave} disabled={loading || !isDirty} className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save changes
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1 text-slate-600">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Star rating</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{hotelInfo.starRating} Star</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1 text-slate-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Overall rating</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{hotelInfo.overallRating}/5.0</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1 text-slate-600">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Reviews</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{hotelInfo.reviewCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Overview */}


        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Tabs defaultValue="basic" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50/60">
              <TabsList className="grid w-full grid-cols-6 h-14 bg-transparent border-0 rounded-none">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-none h-full border-r border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Basic Info
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-none h-full border-r border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="location" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-none h-full border-r border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="taxes" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-none h-full border-r border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Taxes/GST
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="policies" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-none h-full border-r border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Policies
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="faqs" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-none h-full"
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    FAQs
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <Card className="border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-2 block">
                            Hotel Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            aria-required
                            aria-invalid={!hotelInfo.name}
                            value={hotelInfo.name}
                            onChange={(e) => updateHotelField('name', e.target.value)}
                            placeholder="Grand Luxe Hotel"
                            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                          <p className="mt-1 text-xs text-slate-500">Displayed across guest-facing pages and emails.</p>
                        </div>
                        
                        <div>
                          <Label htmlFor="tagline" className="text-sm font-medium text-slate-700 mb-2 block">
                            Tagline
                          </Label>
                          <Input
                            id="tagline"
                            value={hotelInfo.tagline}
                            onChange={(e) => updateHotelField('tagline', e.target.value)}
                            placeholder="Luxury redefined"
                            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="starRating" className="text-sm font-medium text-slate-700 mb-2 block">
                              Star Rating
                            </Label>
                            <Select value={hotelInfo.starRating.toString()} onValueChange={(value) => updateHotelField('starRating', parseInt(value))}>
                              <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 Star</SelectItem>
                                <SelectItem value="4">4 Star</SelectItem>
                                <SelectItem value="5">5 Star</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="overallRating" className="text-sm font-medium text-slate-700 mb-2 block">
                              Overall Rating
                            </Label>
                            <Input
                              id="overallRating"
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={hotelInfo.overallRating}
                              onChange={(e) => updateHotelField('overallRating', parseFloat(e.target.value))}
                              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="reviewCount" className="text-sm font-medium text-slate-700 mb-2 block">
                            Review Count
                          </Label>
                          <Input
                            id="reviewCount"
                            type="number"
                            value={hotelInfo.reviewCount}
                            onChange={(e) => updateHotelField('reviewCount', parseInt(e.target.value))}
                            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card className="border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-emerald-50 rounded-md">
                          <Info className="h-5 w-5 text-emerald-600" />
                        </div>
                        Hotel Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          rows={10}
                          value={hotelInfo.description}
                          onChange={(e) => updateHotelField('description', e.target.value)}
                          placeholder="Describe your hotel's unique features, atmosphere, and what makes it special..."
                          className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg resize-y"
                        />
                        <p className="mt-1 text-xs text-slate-500">Keep it concise and guest-friendly. Markdown is supported in guest views if enabled.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FAQManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-purple-50 rounded-md">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="primaryPhone" className="text-sm font-medium text-slate-700 mb-2 block">
                          Primary Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="primaryPhone"
                          value={hotelInfo.primaryPhone}
                          onChange={(e) => updateHotelField('primaryPhone', e.target.value)}
                          placeholder="+91 98765 43210"
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
                          placeholder="+91 98765 43210"
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
                          placeholder="info@grandluxe.com"
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
                          placeholder="reservations@grandluxe.com"
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
                          placeholder="+91 98765 43210"
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

              <TabsContent value="location" className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-orange-50 rounded-md">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      Location & Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="taxes" className="space-y-6">
                <div className="grid grid-cols-1 gap-8">
                  {/* Tax Configuration */}
                  <Card className="border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-green-50 rounded-md">
                          <Calculator className="h-5 w-5 text-green-600" />
                        </div>
                        Tax Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                            <div className="grid grid-cols-2 gap-4">
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
                  <Card className="border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        Tax Calculation Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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

              <TabsContent value="policies" className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-rose-50 rounded-md">
                        <Shield className="h-5 w-5 text-rose-600" />
                      </div>
                      Hotel Policies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="checkInTime" className="text-sm font-medium text-slate-700 mb-2 block">
                          Check-in Time
                        </Label>
                        <Input
                          id="checkInTime"
                          value={hotelInfo.checkInTime}
                          onChange={(e) => updateHotelField('checkInTime', e.target.value)}
                          placeholder="3:00 PM"
                          className="h-11 border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="checkOutTime" className="text-sm font-medium text-slate-700 mb-2 block">
                          Check-out Time
                        </Label>
                        <Input
                          id="checkOutTime"
                          value={hotelInfo.checkOutTime}
                          onChange={(e) => updateHotelField('checkOutTime', e.target.value)}
                          placeholder="11:00 AM"
                          className="h-11 border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cancellationPolicy" className="text-sm font-medium text-slate-700 mb-2 block">
                        Cancellation Policy
                      </Label>
                      <Textarea
                        id="cancellationPolicy"
                        rows={4}
                        value={hotelInfo.cancellationPolicy}
                        onChange={(e) => updateHotelField('cancellationPolicy', e.target.value)}
                        placeholder="Describe your cancellation policy..."
                        className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y"
                      />
                    </div>
                    
                    

                    <div>
                      <Label htmlFor="guestPolicies" className="text-sm font-medium text-slate-700 mb-2 block">
                        Guest Policies Page Content
                      </Label>
                      <Textarea
                        id="guestPolicies"
                        rows={10}
                        value={(hotelInfo as any).guestPolicies || ""}
                        onChange={(e) => updateHotelField('guestPolicies', e.target.value)}
                        placeholder="Paste or write your Guest Policies content here..."
                        className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 rounded-lg resize-y"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}