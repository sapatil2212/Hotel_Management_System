"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Loader, Save, X, Calendar, Users, Bed, Mail, Phone, MapPin, Plus, Minus, Eye, Edit, Trash2, ArrowRight, ArrowLeft, Receipt, CreditCard, UserCheck } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EnhancedBillingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: any | null
  onBillGenerated: () => void
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Service {
  id: string
  name: string
  description?: string
  category: string
  price: number
  taxable: boolean
}

interface ExtraService {
  id: string
  serviceId?: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string
  gstApplicable: boolean
  gstPercentage: number
  additionalTaxes: number
  finalAmount: number
}

interface BillTotals {
  baseAmount: number
  servicesTotal: number
  subtotal: number
  gstAmount: number
  additionalTaxes: number
  totalAmount: number
}

export default function EnhancedBillingModal({ 
  open, 
  onOpenChange, 
  booking, 
  onBillGenerated 
}: EnhancedBillingModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [extraServices, setExtraServices] = useState<ExtraService[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Bill form state
  const [billForm, setBillForm] = useState({
    paymentMode: '',
    collectedBy: '',
    notes: '',
    customService: '',
    customPrice: '',
    customQuantity: 1,
    customDescription: '',
    customCategory: 'other',
    customGstApplicable: true,
    customGstPercentage: 18,
    customAdditionalTaxes: 0
  })

  // Calculated totals
  const [billTotals, setBillTotals] = useState<BillTotals>({
    baseAmount: 0,
    servicesTotal: 0,
    subtotal: 0,
    gstAmount: 0,
    additionalTaxes: 0,
    totalAmount: 0
  })

  useEffect(() => {
    if (open) {
      fetchUsers()
      fetchServices()
      if (booking) {
        calculateBillTotals()
      }
    }
  }, [open, booking, extraServices])

  useEffect(() => {
    if (booking) {
      calculateBillTotals()
    }
  }, [booking, extraServices])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users')
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchServices = async () => {
    setLoadingServices(true)
    try {
      const response = await fetch('/api/billing/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive"
      })
    } finally {
      setLoadingServices(false)
    }
  }

  const calculateBillTotals = () => {
    if (!booking) return

    // Use baseAmount if available, otherwise calculate from room price
    const roomBaseAmount = (booking as any).baseAmount || (booking.room?.roomType?.price * booking.nights) || 0
    
    // Calculate services with individual GST and taxes
    const servicesTotal = extraServices.reduce((sum, service) => {
      const basePrice = service.totalPrice
      const gstAmount = service.gstApplicable ? (basePrice * service.gstPercentage / 100) : 0
      const finalAmount = basePrice + gstAmount + service.additionalTaxes
      return sum + finalAmount
    }, 0)

    const subtotal = roomBaseAmount + extraServices.reduce((sum, service) => sum + service.totalPrice, 0)
    const gstAmount = extraServices.reduce((sum, service) => {
      return sum + (service.gstApplicable ? (service.totalPrice * service.gstPercentage / 100) : 0)
    }, 0)
    const additionalTaxes = extraServices.reduce((sum, service) => sum + service.additionalTaxes, 0)
    const totalAmount = roomBaseAmount + servicesTotal

    setBillTotals({
      baseAmount: roomBaseAmount,
      servicesTotal,
      subtotal,
      gstAmount,
      additionalTaxes,
      totalAmount
    })
  }

  const addServiceFromDropdown = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    const newService: ExtraService = {
      id: `service_${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      description: service.description || '',
      quantity: 1,
      unitPrice: service.price,
      totalPrice: service.price,
      category: service.category,
      gstApplicable: service.taxable,
      gstPercentage: 18,
      additionalTaxes: 0,
      finalAmount: service.price
    }

    setExtraServices(prev => [...prev, newService])
  }

  const addCustomService = () => {
    if (!billForm.customService || !billForm.customPrice) {
      toast({
        title: "Validation Error",
        description: "Please enter service name and price",
        variant: "destructive"
      })
      return
    }

    const price = parseFloat(billForm.customPrice)
    const quantity = billForm.customQuantity
    const basePrice = price * quantity
    const gstAmount = billForm.customGstApplicable ? (basePrice * billForm.customGstPercentage / 100) : 0
    const finalAmount = basePrice + gstAmount + billForm.customAdditionalTaxes

    const newService: ExtraService = {
      id: `custom_${Date.now()}`,
      serviceName: billForm.customService,
      description: billForm.customDescription,
      quantity: quantity,
      unitPrice: price,
      totalPrice: basePrice,
      category: billForm.customCategory,
      gstApplicable: billForm.customGstApplicable,
      gstPercentage: billForm.customGstPercentage,
      additionalTaxes: billForm.customAdditionalTaxes,
      finalAmount: finalAmount
    }

    setExtraServices(prev => [...prev, newService])
    
    // Reset custom service form
    setBillForm(prev => ({
      ...prev,
      customService: '',
      customPrice: '',
      customQuantity: 1,
      customDescription: '',
      customCategory: 'other',
      customGstApplicable: true,
      customGstPercentage: 18,
      customAdditionalTaxes: 0
    }))
  }

  const updateExtraService = (id: string, field: keyof ExtraService, value: any) => {
    setExtraServices(prev => prev.map(service => {
      if (service.id === id) {
        const updated = { ...service, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice
        }
        if (field === 'gstApplicable' || field === 'gstPercentage' || field === 'additionalTaxes' || field === 'totalPrice') {
          const gstAmount = updated.gstApplicable ? (updated.totalPrice * updated.gstPercentage / 100) : 0
          updated.finalAmount = updated.totalPrice + gstAmount + updated.additionalTaxes
        }
        return updated
      }
      return service
    }))
  }

  const removeExtraService = (id: string) => {
    setExtraServices(prev => prev.filter(service => service.id !== id))
  }

  const generateBill = async () => {
    if (!booking) return

    if (!billForm.paymentMode) {
      toast({
        title: "Validation Error",
        description: "Please select a payment mode",
        variant: "destructive"
      })
      return
    }

    if (!billForm.collectedBy) {
      toast({
        title: "Validation Error",
        description: "Please select who collected the payment",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Add bill items for extra services
      for (const service of extraServices) {
        await fetch('/api/billing/bill-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            serviceId: service.serviceId || null,
            itemName: service.serviceName,
            description: service.description,
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            totalPrice: service.totalPrice,
            gstApplicable: service.gstApplicable,
            gstPercentage: service.gstPercentage,
            additionalTaxes: service.additionalTaxes,
            finalAmount: service.finalAmount,
            addedBy: billForm.collectedBy
          })
        })
      }

      // Record payment
      await fetch('/api/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: billTotals.totalAmount,
          paymentMethod: billForm.paymentMode,
          receivedBy: billForm.collectedBy,
          notes: billForm.notes,
          paymentReference: `BILL-${Date.now()}`
        })
      })

      toast({
        title: "Success",
        description: "Bill generated and payment recorded successfully!",
      })

      onBillGenerated()
      handleClose()
    } catch (error) {
      console.error('Error generating bill:', error)
      toast({
        title: "Error",
        description: "Failed to generate bill",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setExtraServices([])
    setCurrentStep(1)
    setBillForm({
      paymentMode: '',
      collectedBy: '',
      notes: '',
      customService: '',
      customPrice: '',
      customQuantity: 1,
      customDescription: '',
      customCategory: 'other',
      customGstApplicable: true,
      customGstPercentage: 18,
      customAdditionalTaxes: 0
    })
    onOpenChange(false)
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Booking Information"
      case 2: return "Extra Charges"
      case 3: return "Payment Details"
      default: return ""
    }
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <DialogHeader className="text-white">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Generate Bill - {booking.id}
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-blue-100">
              <span>Booking Info</span>
              <span>Extra Charges</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Booking Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Guest & Room Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{booking.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{booking.guestEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{booking.guestPhone}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room:</span>
                        <span className="font-medium">{booking.room?.roomNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{booking.room?.roomType?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nights:</span>
                        <span>{booking.nights}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span>{booking.adults} adults, {booking.children} children</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Room Rate</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(booking.room?.roomType?.price || 0)}/night</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Base Amount</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(billTotals.baseAmount)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Extra Charges */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Extra Charges - {booking.guestName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Service from Dropdown */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Add Service</Label>
                    <Select onValueChange={addServiceFromDropdown} disabled={loadingServices}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={loadingServices ? "Loading..." : "Select a service"} />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col">
                              <span className="text-sm">{service.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(service.price)} • {service.category}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Custom Service Form */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Add New Charge</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Item Name *</Label>
                        <Input
                          placeholder="e.g., Room Service, Laundry, Mini Bar"
                          value={billForm.customService}
                          onChange={(e) => setBillForm(prev => ({ ...prev, customService: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Price (₹) *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={billForm.customPrice}
                          onChange={(e) => setBillForm(prev => ({ ...prev, customPrice: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Units</Label>
                        <Input
                          type="number"
                          min="1"
                          value={billForm.customQuantity}
                          onChange={(e) => setBillForm(prev => ({ ...prev, customQuantity: parseInt(e.target.value) || 1 }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">GST %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={billForm.customGstPercentage}
                          onChange={(e) => setBillForm(prev => ({ ...prev, customGstPercentage: parseFloat(e.target.value) || 0 }))}
                          className="h-8 text-sm"
                          disabled={!billForm.customGstApplicable}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Additional Taxes (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={billForm.customAdditionalTaxes}
                          onChange={(e) => setBillForm(prev => ({ ...prev, customAdditionalTaxes: parseFloat(e.target.value) || 0 }))}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Textarea
                        placeholder="Optional description for this charge"
                        value={billForm.customDescription}
                        onChange={(e) => setBillForm(prev => ({ ...prev, customDescription: e.target.value }))}
                        className="h-16 text-sm resize-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gstApplicable"
                        checked={billForm.customGstApplicable}
                        onCheckedChange={(checked) => setBillForm(prev => ({ ...prev, customGstApplicable: checked as boolean }))}
                      />
                      <Label htmlFor="gstApplicable" className="text-sm">GST Applicable</Label>
                    </div>

                    <Button onClick={addCustomService} size="sm" className="w-full h-8">
                      <Plus className="h-3 w-3 mr-2" />
                      Add Charge
                    </Button>
                  </div>

                  <Separator />

                  {/* Added Services List */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Added Charges ({extraServices.length})</Label>
                    {extraServices.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No extra charges added</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {extraServices.map((service) => (
                          <Card key={service.id} className="p-3 border border-gray-200">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{service.serviceName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {service.category}
                                    </Badge>
                                  </div>
                                  {service.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {service.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtraService(service.id)}
                                  className="h-6 w-6 p-0 text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <Label className="text-muted-foreground">Quantity</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={service.quantity}
                                    onChange={(e) => updateExtraService(service.id, 'quantity', parseInt(e.target.value) || 1)}
                                    className="h-6 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Unit Price</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={service.unitPrice}
                                    onChange={(e) => updateExtraService(service.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="h-6 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">GST %</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={service.gstPercentage}
                                    onChange={(e) => updateExtraService(service.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                                    className="h-6 text-xs"
                                    disabled={!service.gstApplicable}
                                  />
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Extra Taxes</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={service.additionalTaxes}
                                    onChange={(e) => updateExtraService(service.id, 'additionalTaxes', parseFloat(e.target.value) || 0)}
                                    className="h-6 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={service.gstApplicable}
                                  onCheckedChange={(checked) => updateExtraService(service.id, 'gstApplicable', checked)}
                                />
                                <Label className="text-xs">GST Applicable</Label>
                              </div>

                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Base: {formatCurrency(service.totalPrice)}</span>
                                <span className="text-muted-foreground">GST: {formatCurrency(service.gstApplicable ? (service.totalPrice * service.gstPercentage / 100) : 0)}</span>
                                <span className="text-muted-foreground">Taxes: {formatCurrency(service.additionalTaxes)}</span>
                                <span className="font-bold text-blue-600">Total: {formatCurrency(service.finalAmount)}</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Details */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Payment Mode *</Label>
                      <Select
                        value={billForm.paymentMode}
                        onValueChange={(value) => setBillForm(prev => ({ ...prev, paymentMode: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="online_gateway">Online Gateway</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Collected By *</Label>
                      <Select
                        value={billForm.collectedBy}
                        onValueChange={(value) => setBillForm(prev => ({ ...prev, collectedBy: value }))}
                        disabled={loadingUsers}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={loadingUsers ? "Loading..." : "Select staff member"} />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.name}>
                              <div className="flex flex-col">
                                <span className="text-sm">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.role}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <Textarea
                        value={billForm.notes}
                        onChange={(e) => setBillForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes or comments..."
                        className="h-20 text-sm resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bill Summary */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Bill Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Room Charges:</span>
                        <span>{formatCurrency(billTotals.baseAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Extra Services:</span>
                        <span>{formatCurrency(extraServices.reduce((sum, service) => sum + service.totalPrice, 0))}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(billTotals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>GST:</span>
                        <span>{formatCurrency(billTotals.gstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Additional Taxes:</span>
                        <span>{formatCurrency(billTotals.additionalTaxes)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">{formatCurrency(billTotals.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 text-green-800">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Ready to Generate Bill</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        All required fields are completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} disabled={loading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={generateBill}
                    disabled={loading || !billForm.paymentMode || !billForm.collectedBy}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Generating...' : 'Generate Bill'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
