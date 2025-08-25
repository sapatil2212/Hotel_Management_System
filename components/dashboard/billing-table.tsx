"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Loader, Phone, Mail, MapPin, Calendar, Users, Bed, Eye, Edit, Trash2, Save, X, Clock, AlertTriangle, CheckCircle, Download, Send, DollarSign, Receipt, CreditCard, FileText, Plus, ArrowRight, ArrowLeft, Check, Printer } from "lucide-react"
import { Invoice } from "@/components/ui/invoice"
import { InvoicePDF } from "@/components/ui/invoice-pdf"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useHotel } from "@/contexts/hotel-context"
import { TaxCalculator } from "@/lib/tax-calculator"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"

type InvoiceStatus = "pending" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled" | "refunded"

interface Invoice {
  id: string
  invoiceNumber: string
  bookingId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  roomTypeName: string
  roomNumber: string
  baseAmount: number
  discountAmount: number
  gstAmount: number
  serviceTaxAmount: number
  otherTaxAmount: number
  totalTaxAmount: number
  totalAmount: number
  status: string
  dueDate: string
  issuedDate: string
  paidDate?: string
  notes?: string
  terms: string
  qrCode?: string
  emailSent: boolean
  whatsappSent: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
  booking: {
    id: string
    status: string
    room: {
      roomNumber: string
      roomType: {
        name: string
      }
    }
  }
  payments: {
    id: string
    amount: number
    paymentMethod: string
    paymentDate: string
    status: string
    paymentReference?: string
    receivedBy?: string
  }[]
  invoiceItems: {
    id: string
    itemName: string
    description?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
    taxRate: number
    taxAmount: number
    finalAmount: number
  }[]
}

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  actualCheckoutTime?: string
  nights: number
  adults: number
  children: number
  totalAmount: number
  originalAmount?: number
  discountAmount?: number
  baseAmount?: number
  gstAmount?: number
  serviceTaxAmount?: number
  otherTaxAmount?: number
  totalTaxAmount?: number
  specialRequests?: string
  status: string
  source?: string
  createdAt: string
  room: {
    id: string
    roomNumber: string
    floorNumber?: number
    roomType: {
      id: string
      name: string
      size?: string
      bedType?: string
      maxGuests?: number
      amenities?: any[]
      features?: any[]
      currency?: string
      price: number
    }
  }
  promoCode?: {
    code: string
    title: string
  }
  invoices?: Invoice[]
  billItems?: {
    id: string
    itemName: string
    description?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
    taxAmount: number
    finalAmount: number
  }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface BillGenerationData {
  type: 'bill' | 'invoice'
  paymentMethod: string
  referenceId: string
  collectedBy: string
  notes: string
  extraCharges: Array<{
    item: string
    amount: number
    description: string
    gstApplicable: boolean
    gstPercentage: number
    gstAmount?: number
    finalAmount?: number
  }>
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  partially_paid: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

// Function to check if invoice is overdue
const isOverdue = (invoice: Invoice): boolean => {
  if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'refunded') {
    return false;
  }
  
  const dueDate = new Date(invoice.dueDate);
  const now = new Date();
  
  return dueDate < now;
};

// Function to get display status
const getDisplayStatus = (invoice: Invoice): string => {
  if (invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'refunded' && isOverdue(invoice)) {
    return 'overdue';
  }
  return invoice.status;
};

// Function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Function to calculate days overdue
const getDaysOverdue = (invoice: Invoice): number => {
  if (!isOverdue(invoice)) return 0;
  
  const dueDate = new Date(invoice.dueDate);
  const now = new Date();
  const diffTime = now.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Function to get invoice/bill display text
const getInvoiceDisplayText = (invoice: Invoice): string => {
  return invoice.status === 'paid' ? 'Bill' : 'Invoice';
};

export default function BillingTable() {
  const { hotelInfo, isLoading: hotelInfoLoading } = useHotel()
  const deleteConfirmation = useDeleteConfirmation()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editFormData, setEditFormData] = useState({
    status: 'pending',
    notes: '',
    terms: 'Payment due upon receipt'
  })
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [generatingInvoiceFromBooking, setGeneratingInvoiceFromBooking] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'invoices' | 'bookings'>('bookings')
  
  // Bill generation modal states
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [billFormData, setBillFormData] = useState({
    extraServiceCharge: 0,
    paymentMode: 'cash',
    collectedBy: '',
    notes: ''
  })
  const [generatingBill, setGeneratingBill] = useState(false)
  
  // View bill modal states
  const [isViewBillModalOpen, setIsViewBillModalOpen] = useState(false)
  const [selectedBillInvoice, setSelectedBillInvoice] = useState<Invoice | null>(null)
  
  // Enhanced billing states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isTaxInvoiceModalOpen, setIsTaxInvoiceModalOpen] = useState(false)
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null)
  const [selectedTaxInvoiceBooking, setSelectedTaxInvoiceBooking] = useState<Booking | null>(null)
  const [invoiceFormData, setInvoiceFormData] = useState({
    extraCharges: [
      { item: '', amount: 0, description: '', gstApplicable: false, gstPercentage: 18 }
    ],
    paymentMode: 'cash',
    referenceId: '',
    collectedBy: '',
    notes: '',
    emailIds: ['']
  })
  const [generatingEnhancedInvoice, setGeneratingEnhancedInvoice] = useState(false)
  const [sendingInvoice, setSendingInvoice] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [taxBreakdown, setTaxBreakdown] = useState<{
    baseAmount: number
    gst: number
    serviceTax: number
    otherTax: number
    totalTax: number
    totalAmount: number
    taxes: Array<{ name: string; percentage: number; amount: number }>
  } | null>(null)
  
  // Booking selection modal states
  const [isBookingSelectionModalOpen, setIsBookingSelectionModalOpen] = useState(false)

  // Multi-step bill generation modal states
  const [isMultiStepModalOpen, setIsMultiStepModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [billGenerationData, setBillGenerationData] = useState<BillGenerationData>({
    type: 'bill',
    paymentMethod: 'cash',
    referenceId: '',
    collectedBy: '',
    notes: '',
    extraCharges: []
  })
  const [generatedBill, setGeneratedBill] = useState<Invoice | null>(null)

  // View booking bill/invoice modal states
  const [isViewBookingModalOpen, setIsViewBookingModalOpen] = useState(false)
  const [viewBookingData, setViewBookingData] = useState<Booking | null>(null)
  const [viewInvoiceData, setViewInvoiceData] = useState<Invoice | null>(null)

  // Fetch invoices and bookings
  useEffect(() => {
    fetchInvoices()
    fetchBookings()
    fetchUsers()
  }, [])

  // Recalculate taxes when invoice modal opens or extra charges change
  useEffect(() => {
    if (isInvoiceModalOpen && selectedInvoiceBooking) {
      calculateInvoiceTaxes()
    }
  }, [isInvoiceModalOpen, selectedInvoiceBooking, invoiceFormData.extraCharges])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch invoices",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true)
      const response = await fetch('/api/bookings?include=billItems,invoices')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch bookings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      })
    } finally {
      setBookingsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Calculate taxes for invoice
  const calculateInvoiceTaxes = async () => {
    if (!selectedInvoiceBooking) return
    
    try {
      const baseAmount = ((selectedInvoiceBooking as any).baseAmount || (selectedInvoiceBooking.room.roomType.price * selectedInvoiceBooking.nights) || 0) + calculateTotalExtraCharges()
      const breakdown = await TaxCalculator.calculateTaxes(baseAmount)
      setTaxBreakdown(breakdown)
    } catch (error) {
      console.error('Error calculating taxes:', error)
      // Set default breakdown without taxes
      const baseAmount = ((selectedInvoiceBooking as any).baseAmount || (selectedInvoiceBooking.room.roomType.price * selectedInvoiceBooking.nights) || 0) + calculateTotalExtraCharges()
      setTaxBreakdown({
        baseAmount,
        gst: 0,
        serviceTax: 0,
        otherTax: 0,
        totalTax: 0,
        totalAmount: baseAmount,
        taxes: []
      })
    }
  }

  // Handle add extra charges
  const handleAddExtraCharges = async (booking: Booking) => {
    setSelectedBooking(booking)
    setIsBillModalOpen(true)
  }

  // Handle generate invoice from booking
  const handleGenerateInvoice = async (booking: Booking) => {
    try {
      setGeneratingInvoiceFromBooking(booking.id)
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          adults: booking.adults,
          children: booking.children,
          roomTypeName: booking.room.roomType.name,
          roomNumber: booking.room.roomNumber,
          baseAmount: booking.totalAmount,
          discountAmount: 0,
          gstAmount: 0,
          serviceTaxAmount: 0,
          otherTaxAmount: 0,
          totalTaxAmount: 0,
          totalAmount: booking.totalAmount,
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          terms: 'Payment due upon receipt'
        }),
      })

      if (response.ok) {
        const newInvoice = await response.json()
        setInvoices([newInvoice, ...invoices])
        toast({
          title: "Success",
          description: `Invoice generated successfully for booking ${booking.id}`,
        })
        // Refresh bookings to update invoice status
        fetchBookings()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to generate invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      })
    } finally {
      setGeneratingInvoiceFromBooking(null)
    }
  }

  // Handle view invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailModalOpen(true)
  }

  // Handle view invoice in bill/invoice format (same as booking view)
  const handleViewInvoiceAsBill = (invoice: Invoice) => {
    // Convert invoice to booking format for the view modal
    const bookingFromInvoice: Booking = {
      id: invoice.bookingId || invoice.id,
      guestName: invoice.guestName,
      guestEmail: invoice.guestEmail,
      guestPhone: invoice.guestPhone,
      checkIn: invoice.checkIn,
      checkOut: invoice.checkOut,
      nights: invoice.nights,
      adults: invoice.adults || 1,
      children: invoice.children || 0,
      totalAmount: invoice.baseAmount,
      status: invoice.status === 'paid' ? 'CHECKED_OUT' : 'CONFIRMED',
      createdAt: invoice.issuedDate,
      specialRequests: '',
      source: 'invoice',
      room: {
        id: invoice.id,
        roomNumber: invoice.roomNumber,
        roomType: {
          id: invoice.id,
          name: invoice.roomTypeName,
          price: invoice.baseAmount / invoice.nights
        }
      },
      billItems: invoice.invoiceItems?.filter(item => !item.itemName.includes('Room Stay')).map(item => ({
        id: item.id,
        itemName: item.itemName,
        description: item.description || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        discount: item.discount,
        taxAmount: item.taxAmount,
        finalAmount: item.finalAmount
      })) || [], // Populate from invoice items (excluding room stay)
      invoices: [invoice] // Include the original invoice
    }
    
    setViewBookingData(bookingFromInvoice)
    setIsViewBookingModalOpen(true)
  }

  // Handle edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setEditFormData({
      status: invoice.status,
      notes: invoice.notes || '',
      terms: invoice.terms
    })
    setIsEditModalOpen(true)
  }

  // Handle update invoice
  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv))
        setIsEditModalOpen(false)
        setEditingInvoice(null)
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // Handle delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    deleteConfirmation.showDeleteConfirmation(
      async () => {
        try {
          setDeleting(invoiceId)
          const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            setInvoices(invoices.filter(inv => inv.id !== invoiceId))
            toast({
              title: "Success",
              description: "Invoice deleted successfully",
            })
          } else {
            const error = await response.json()
            toast({
              title: "Error",
              description: error.error || "Failed to delete invoice",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error('Error deleting invoice:', error)
          toast({
            title: "Error",
            description: "Failed to delete invoice",
            variant: "destructive",
          })
        } finally {
          setDeleting(null)
        }
      },
      {
        title: 'Delete Invoice',
        description: 'Are you sure you want to delete this invoice? This action cannot be undone.',
        itemName: invoice ? `Invoice #${invoice.invoiceNumber}` : undefined,
        variant: 'danger'
      }
    )
  }

  // Handle send invoice
  const handleSendInvoice = async (invoice: Invoice) => {
    toast({
      title: "Info",
      description: "Send invoice functionality will be implemented soon",
    })
  }

  // Handle print generated bill
  const handlePrintGeneratedBill = async (generatedBill: any) => {
    try {
      const response = await fetch(`/api/billing/generate-bill/${generatedBill.id}`)
      
      if (response.ok) {
        const htmlContent = await response.text()
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          
          // Wait for content to load then print
          printWindow.onload = () => {
            printWindow.print()
            // Close the window after printing
            setTimeout(() => {
              printWindow.close()
            }, 1000)
          }
        } else {
          toast({
            title: "Error",
            description: "Please allow popups to print the bill",
            variant: "destructive"
          })
        }
      } else {
        throw new Error('Failed to generate bill for printing')
      }
    } catch (error) {
      console.error('Error printing bill:', error)
      toast({
        title: "Error",
        description: "Failed to print bill",
        variant: "destructive"
      })
    }
  }

  // Handle download generated bill
  const handleDownloadGeneratedBill = async (generatedBill: any) => {
    try {
      const response = await fetch(`/api/billing/generate-bill/${generatedBill.id}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const blob = await response.blob()
        
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
        // Determine file extension based on content type
        const isPDF = contentType?.includes('application/pdf')
        const fileExtension = isPDF ? 'pdf' : 'html'
        const fileName = `bill-${generatedBill.invoiceNumber}.${fileExtension}`
        
        if (isMobile) {
          // For mobile devices, use a more reliable approach
          const url = window.URL.createObjectURL(blob)
          
          try {
            // Method 1: Try to create a download link with proper attributes
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.style.display = 'none'
            a.setAttribute('target', '_blank')
            a.setAttribute('rel', 'noopener noreferrer')
            
            // Add to DOM and trigger
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            
            // Clean up after a delay
            setTimeout(() => {
              window.URL.revokeObjectURL(url)
            }, 2000)
            
          } catch (error) {
            console.log('Primary mobile download method failed, trying fallback...')
            
            // Method 2: Fallback - open in new tab
            try {
              window.open(url, '_blank')
            } catch (fallbackError) {
              console.error('Fallback method also failed:', fallbackError)
              
              // Method 3: Last resort - create a visible download link
              const fallbackLink = document.createElement('a')
              fallbackLink.href = url
              fallbackLink.download = fileName
              fallbackLink.textContent = `Click here to download ${fileExtension.toUpperCase()}`
              fallbackLink.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #007bff;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                text-decoration: none;
                z-index: 10000;
                font-size: 16px;
                font-weight: bold;
              `
              document.body.appendChild(fallbackLink)
              
              // Remove the link after 10 seconds
              setTimeout(() => {
                if (document.body.contains(fallbackLink)) {
                  document.body.removeChild(fallbackLink)
                }
                window.URL.revokeObjectURL(url)
              }, 10000)
            }
          }
        } else {
          // Desktop download (original implementation)
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
        
        toast({
          title: "Success",
          description: isMobile 
            ? `Bill ${isPDF ? 'opened in new tab' : 'downloaded as HTML'}` 
            : `${fileExtension.toUpperCase()} downloaded successfully`
        })
      } else {
        throw new Error('Failed to download bill')
      }
    } catch (error) {
      console.error('Error downloading bill:', error)
      toast({
        title: "Error",
        description: "Failed to download bill",
        variant: "destructive"
      })
    }
  }

  // Handle download invoice
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/bookings/${invoice.bookingId}/pdf`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const blob = await response.blob()
        
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
        // Determine file extension based on content type
        const isPDF = contentType?.includes('application/pdf')
        const fileExtension = isPDF ? 'pdf' : 'html'
        const fileName = `booking-invoice-${invoice.invoiceNumber}.${fileExtension}`
        
        if (isMobile) {
          // For mobile devices, use a more reliable approach
          const url = window.URL.createObjectURL(blob)
          
          try {
            // Method 1: Try to create a download link with proper attributes
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.style.display = 'none'
            a.setAttribute('target', '_blank')
            a.setAttribute('rel', 'noopener noreferrer')
            
            // Add to DOM and trigger
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            
            // Clean up after a delay
            setTimeout(() => {
              window.URL.revokeObjectURL(url)
            }, 2000)
            
          } catch (error) {
            console.log('Primary mobile download method failed, trying fallback...')
            
            // Method 2: Fallback - open in new tab
            try {
              window.open(url, '_blank')
            } catch (fallbackError) {
              console.error('Fallback method also failed:', fallbackError)
              
              // Method 3: Last resort - create a visible download link
              const fallbackLink = document.createElement('a')
              fallbackLink.href = url
              fallbackLink.download = fileName
              fallbackLink.textContent = `Click here to download ${fileExtension.toUpperCase()}`
              fallbackLink.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #007bff;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                text-decoration: none;
                z-index: 10000;
                font-size: 16px;
                font-weight: bold;
              `
              document.body.appendChild(fallbackLink)
              
              // Remove the link after 10 seconds
              setTimeout(() => {
                if (document.body.contains(fallbackLink)) {
                  document.body.removeChild(fallbackLink)
                }
                window.URL.revokeObjectURL(url)
              }, 10000)
            }
          }
        } else {
          // Desktop download (original implementation)
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
        
        toast({
          title: "Success",
          description: isMobile 
            ? `Invoice ${isPDF ? 'opened in new tab' : 'downloaded as HTML'}` 
            : `${fileExtension.toUpperCase()} downloaded successfully`
        })
      } else {
        throw new Error('Failed to download invoice')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive"
      })
    }
  }

  // Handle view bill
  const handleViewBill = (invoice: Invoice) => {
    setSelectedBillInvoice(invoice)
    setIsViewBillModalOpen(true)
  }

  // Handle generate bill from booking
  const handleGenerateBill = (booking: Booking) => {
    // Check if bill already exists for this booking
    const existingBill = invoices.find(invoice => invoice.bookingId === booking.id && invoice.status === 'paid')
    
    if (existingBill) {
      toast({
        title: "Bill Already Exists",
        description: `A bill has already been generated for booking ${booking.id}. Use the View/Edit buttons to manage the existing bill.`,
        variant: "destructive",
      })
      return
    }
    
    setSelectedBooking(booking)
    setBillFormData({
      extraServiceCharge: 0,
      paymentMode: 'cash',
      collectedBy: '',
      notes: ''
    })
    setIsBillModalOpen(true)
  }

  // Handle generate invoice (before payment)
  const handleGenerateInvoiceEnhanced = async (booking: Booking) => {
    // Check if invoice already exists for this booking
    const existingInvoice = invoices.find(invoice => invoice.bookingId === booking.id)
    
    if (existingInvoice) {
      toast({
        title: "Invoice Already Exists",
        description: `An invoice has already been generated for booking ${booking.id}. Use the View/Edit buttons to manage the existing invoice.`,
        variant: "destructive",
      })
      return
    }
    
    setSelectedInvoiceBooking(booking)
    setInvoiceFormData({
      extraCharges: [
        { item: '', amount: 0, description: '', gstApplicable: false, gstPercentage: 18 }
      ],
      paymentMode: 'cash',
      referenceId: '',
      collectedBy: '',
      notes: '',
      emailIds: ['']
    })
    setIsInvoiceModalOpen(true)
    
    // Calculate taxes after modal opens
    setTimeout(() => {
      calculateInvoiceTaxes()
    }, 100)
  }

  // Handle generate bill/invoice (combined function)
  const handleGenerateBillInvoice = (booking: Booking) => {
    // Check if invoice already exists for this booking
    const existingInvoice = invoices.find(invoice => invoice.bookingId === booking.id)
    
    if (existingInvoice) {
      toast({
        title: "Invoice Already Exists",
        description: `An invoice has already been generated for booking ${booking.id}. Use the View/Edit buttons to manage the existing invoice.`,
        variant: "destructive",
      })
      return
    }
    
    // Auto-fetch existing extra charges from booking's billItems with proper GST breakdown
    const existingExtraCharges = booking.billItems?.map(item => {
      // Calculate GST amount for each item based on the final amount
      const itemBaseAmount = item.finalAmount / (1 + (hotelInfo.gstPercentage || 18) / 100)
      const itemGSTAmount = item.finalAmount - itemBaseAmount
      
      return {
        item: item.itemName,
        amount: itemBaseAmount, // Store base amount (without GST)
        description: item.description || '',
        gstApplicable: true, // Default to true for existing items
        gstPercentage: hotelInfo.gstPercentage || 18, // Use hotel GST percentage
        gstAmount: itemGSTAmount, // Store calculated GST amount
        finalAmount: item.finalAmount // Store final amount (with GST)
      }
    }) || []
    
    setSelectedBooking(booking)
    setCurrentStep(1)
    setBillGenerationData({
      type: 'bill',
      paymentMethod: 'cash',
      referenceId: '',
      collectedBy: '',
      notes: '',
      extraCharges: existingExtraCharges
    })
    setGeneratedBill(null)
    setIsMultiStepModalOpen(true)
  }

  // Handle view booking details - show bill/invoice format
  const handleViewBooking = (booking: Booking) => {
    // Check if booking has any invoices
    const hasInvoice = booking.invoices && booking.invoices.length > 0;
    
    if (!hasInvoice) {
      toast({
        title: "No Bill/Invoice Generated",
        description: "Bill/Invoice not generated yet for this booking. Please generate a bill or invoice first.",
        variant: "destructive",
      });
      return;
    }
    
    // Get the latest invoice for this booking
    const latestInvoice = booking.invoices?.[0]; // Assuming invoices are sorted by creation date
    
    if (!latestInvoice) {
      toast({
        title: "Error",
        description: "No invoice found for this booking",
        variant: "destructive",
      });
      return;
    }
    
    setViewBookingData(booking)
    setViewInvoiceData(latestInvoice) // Add this state to store the actual invoice
    setIsViewBookingModalOpen(true)
  }

  // Handle edit booking
  const handleEditBooking = (booking: Booking) => {
    toast({
      title: "Info",
      description: "Edit booking functionality will be implemented soon",
    })
  }

  // Handle add extra charge item
  const handleAddExtraCharge = () => {
    setInvoiceFormData({
      ...invoiceFormData,
      extraCharges: [...invoiceFormData.extraCharges, { item: '', amount: 0, description: '', gstApplicable: false, gstPercentage: 18 }]
    })
  }

  // Handle remove extra charge item
  const handleRemoveExtraCharge = (index: number) => {
    const newExtraCharges = invoiceFormData.extraCharges.filter((_, i) => i !== index)
    setInvoiceFormData({
      ...invoiceFormData,
      extraCharges: newExtraCharges
    })
  }

  // Handle update extra charge
  const handleUpdateExtraCharge = async (index: number, field: string, value: string | number) => {
    const newExtraCharges = [...invoiceFormData.extraCharges]
    newExtraCharges[index] = { ...newExtraCharges[index], [field]: value }
    setInvoiceFormData({
      ...invoiceFormData,
      extraCharges: newExtraCharges
    })
    
    // Recalculate taxes when amount changes
    if (field === 'amount') {
      setTimeout(() => {
        calculateInvoiceTaxes()
      }, 100)
    }
  }

  // Handle add email
  const handleAddEmail = () => {
    setInvoiceFormData({
      ...invoiceFormData,
      emailIds: [...invoiceFormData.emailIds, '']
    })
  }

  // Handle remove email
  const handleRemoveEmail = (index: number) => {
    const newEmailIds = invoiceFormData.emailIds.filter((_, i) => i !== index)
    setInvoiceFormData({
      ...invoiceFormData,
      emailIds: newEmailIds
    })
  }

  // Handle update email
  const handleUpdateEmail = (index: number, value: string) => {
    const newEmailIds = [...invoiceFormData.emailIds]
    newEmailIds[index] = value
    setInvoiceFormData({
      ...invoiceFormData,
      emailIds: newEmailIds
    })
  }

  // Calculate total extra charges
  const calculateTotalExtraCharges = () => {
    return invoiceFormData.extraCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0)
  }

  // Multi-step modal helper functions
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCloseModal = () => {
    setIsMultiStepModalOpen(false)
    setCurrentStep(1)
    setSelectedBooking(null)
    setGeneratedBill(null)
  }

  const handleTypeSelection = (type: 'bill' | 'invoice') => {
    setBillGenerationData({
      ...billGenerationData,
      type
    })
  }

  const handlePaymentMethodChange = (method: string) => {
    setBillGenerationData({
      ...billGenerationData,
      paymentMethod: method,
      referenceId: method === 'cash' ? '' : billGenerationData.referenceId
    })
  }

  const handleAddBillExtraCharge = () => {
    setBillGenerationData({
      ...billGenerationData,
      extraCharges: [...billGenerationData.extraCharges, { 
        item: '', 
        amount: 0, 
        description: '', 
        gstApplicable: true, // Default to true for new charges
        gstPercentage: hotelInfo.gstPercentage || 18 // Use hotel GST percentage
      }]
    })
  }

  const handleRemoveBillExtraCharge = (index: number) => {
    const newExtraCharges = billGenerationData.extraCharges.filter((_, i) => i !== index)
    setBillGenerationData({
      ...billGenerationData,
      extraCharges: newExtraCharges
    })
  }

  const handleUpdateBillExtraCharge = (index: number, field: string, value: string | number | boolean) => {
    const newExtraCharges = [...billGenerationData.extraCharges]
    newExtraCharges[index] = { ...newExtraCharges[index], [field]: value }
    setBillGenerationData({
      ...billGenerationData,
      extraCharges: newExtraCharges
    })
  }

  const calculateBillTotal = () => {
    if (!selectedBooking) return 0
    
    // Base room amount (without taxes) - use actual room price, not stored baseAmount
    const roomBaseAmount = selectedBooking.room.roomType.price * selectedBooking.nights
    
    // GST on room base amount (always applicable)
    const roomGSTAmount = (roomBaseAmount * (hotelInfo.gstPercentage || 18)) / 100
    
    // Calculate extra charges with GST
    const extraChargesWithGST = billGenerationData.extraCharges.reduce((sum, charge) => {
      const chargeAmount = charge.amount || 0
      if (charge.gstApplicable) {
        // Use pre-calculated GST amount if available (for existing items)
        const gstAmount = charge.gstAmount || (chargeAmount * (charge.gstPercentage || hotelInfo.gstPercentage || 18)) / 100
        return sum + chargeAmount + gstAmount
      }
      return sum + chargeAmount
    }, 0)
    
    // Total = Base Amount + GST on Base + Extra Charges (with GST if applicable)
    const total = roomBaseAmount + roomGSTAmount + extraChargesWithGST
    return total
  }

  // Helper function to calculate GST breakdown
  const calculateGSTBreakdown = () => {
    if (!selectedBooking) return { subtotal: 0, gstAmount: 0, total: 0, roomGSTAmount: 0, extraChargesGSTAmount: 0 }
    
    // Use actual room price, not stored baseAmount which includes extra charges
    const roomBaseAmount = (selectedBooking.room.roomType.price || 0) * selectedBooking.nights
    const extraChargesSubtotal = billGenerationData.extraCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0)
    
    // Calculate GST on room base amount (always applicable)
    const roomGSTAmount = (roomBaseAmount * (hotelInfo.gstPercentage || 18)) / 100
    
    // Calculate GST on applicable extra charges
    const extraChargesGSTAmount = billGenerationData.extraCharges.reduce((sum, charge) => {
      if (charge.gstApplicable) {
        // Use pre-calculated GST amount if available (for existing items)
        return sum + (charge.gstAmount || ((charge.amount || 0) * (charge.gstPercentage || hotelInfo.gstPercentage || 18)) / 100)
      }
      return sum
    }, 0)
    
    const totalGSTAmount = roomGSTAmount + extraChargesGSTAmount
    const subtotal = roomBaseAmount + extraChargesSubtotal
    const total = subtotal + totalGSTAmount
    
    return { 
      subtotal, 
      gstAmount: totalGSTAmount, 
      roomGSTAmount,
      extraChargesGSTAmount,
      total 
    }
  }

  const generateBillOrInvoice = async () => {
    if (!selectedBooking) return

    try {
      setGeneratingEnhancedInvoice(true)
      
      // Base room amount (without taxes) - use actual room price, not stored baseAmount
      const roomBaseAmount = (selectedBooking.room.roomType.price || 0) * selectedBooking.nights
      
      // GST on room base amount (always applicable)
      const roomGSTAmount = (roomBaseAmount * (hotelInfo.gstPercentage || 18)) / 100
      
      // Calculate extra charges base amounts and GST
      const extraChargesBreakdown = billGenerationData.extraCharges.map(charge => {
        const chargeAmount = charge.amount || 0
        const gstAmount = charge.gstApplicable ? (charge.gstAmount || (chargeAmount * (charge.gstPercentage || hotelInfo.gstPercentage || 18)) / 100) : 0
        const finalAmount = chargeAmount + gstAmount
        
        return {
          baseAmount: chargeAmount,
          gstAmount: gstAmount,
          finalAmount: finalAmount
        }
      })
      
      // Calculate overall totals
      const extraChargesBaseTotal = extraChargesBreakdown.reduce((sum, item) => sum + item.baseAmount, 0)
      const extraChargesGSTTotal = extraChargesBreakdown.reduce((sum, item) => sum + item.gstAmount, 0)
      const extraChargesFinalTotal = extraChargesBreakdown.reduce((sum, item) => sum + item.finalAmount, 0)
      
      // Overall totals for the entire invoice
      const overallSubtotal = roomBaseAmount + extraChargesBaseTotal
      const overallGSTTotal = roomGSTAmount + extraChargesGSTTotal
      const overallGrandTotal = roomBaseAmount + roomGSTAmount + extraChargesFinalTotal
      
      const status = billGenerationData.type === 'bill' ? 'paid' : 'pending'
      
      // Prepare extra charges details for the invoice
      const extraChargesDetails = billGenerationData.extraCharges.map((charge, index) => {
        const breakdown = extraChargesBreakdown[index]
        
        return {
          itemName: charge.item,
          description: charge.description,
          quantity: 1,
          unitPrice: charge.amount || 0,
          totalPrice: breakdown.baseAmount,
          discount: 0,
          taxRate: charge.gstApplicable ? (charge.gstPercentage || hotelInfo.gstPercentage || 18) : 0,
          taxAmount: breakdown.gstAmount,
          finalAmount: breakdown.finalAmount
        }
      })
      
      // Prepare payment details if it's a bill
      const paymentDetails = billGenerationData.type === 'bill' ? [{
        amount: overallGrandTotal,
        paymentMethod: billGenerationData.paymentMethod,
        paymentDate: new Date().toISOString(),
        status: 'completed',
        paymentReference: billGenerationData.referenceId,
        receivedBy: billGenerationData.collectedBy
      }] : []
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          guestName: selectedBooking.guestName,
          guestEmail: selectedBooking.guestEmail,
          guestPhone: selectedBooking.guestPhone,
          checkIn: selectedBooking.checkIn,
          checkOut: selectedBooking.checkOut,
          nights: selectedBooking.nights,
          adults: selectedBooking.adults,
          children: selectedBooking.children,
          roomTypeName: selectedBooking.room.roomType.name,
          roomNumber: selectedBooking.room.roomNumber,
          baseAmount: roomBaseAmount, // Room base amount only (not including extra charges)
          discountAmount: 0,
          gstAmount: overallGSTTotal, // Overall GST total (room + extra charges GST)
          serviceTaxAmount: 0,
          otherTaxAmount: 0,
          totalTaxAmount: overallGSTTotal,
          totalAmount: overallGrandTotal, // Overall grand total
          status: status,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          terms: billGenerationData.notes || 'Payment due upon receipt',
          notes: `Extra Charges: ${formatCurrency(extraChargesBaseTotal)}\nPayment Mode: ${billGenerationData.paymentMethod}\nCollected By: ${billGenerationData.collectedBy}${billGenerationData.referenceId ? `\nReference ID: ${billGenerationData.referenceId}` : ''}\n\nExtra Charge Details:\n${billGenerationData.extraCharges.map(charge => `${charge.item}: ${formatCurrency(charge.amount)}${charge.gstApplicable ? ` + GST ${charge.gstPercentage}%` : ''} - ${charge.description}`).join('\n')}`,
          invoiceItems: extraChargesDetails // Include extra charges as invoice items
        }),
      })

      if (response.ok) {
        const newInvoice = await response.json()
        setGeneratedBill(newInvoice)
        setInvoices([newInvoice, ...invoices])
        // Show the generated bill immediately instead of staying on step 3
        setCurrentStep(4) // New step to show generated bill
        toast({
          title: "Success",
          description: `${billGenerationData.type === 'bill' ? 'Bill' : 'Invoice'} generated successfully!`,
        })
      } else {
        throw new Error('Failed to generate bill/invoice')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bill/invoice",
        variant: "destructive",
      })
    } finally {
      setGeneratingEnhancedInvoice(false)
    }
  }

  // Handle enhanced invoice generation
  const handleEnhancedInvoiceGeneration = async () => {
    if (!selectedInvoiceBooking) return

    try {
      setGeneratingEnhancedInvoice(true)
      
      const totalExtraCharges = calculateTotalExtraCharges()
      const baseAmount = ((selectedInvoiceBooking as any).baseAmount || (selectedInvoiceBooking.room.roomType.price * selectedInvoiceBooking.nights) || 0) + totalExtraCharges
      
      // Use tax breakdown if available, otherwise calculate without taxes
      const finalTaxBreakdown = taxBreakdown || {
        baseAmount,
        gst: 0,
        serviceTax: 0,
        otherTax: 0,
        totalTax: 0,
        totalAmount: baseAmount,
        taxes: []
      }
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedInvoiceBooking.id,
          guestName: selectedInvoiceBooking.guestName,
          guestEmail: selectedInvoiceBooking.guestEmail,
          guestPhone: selectedInvoiceBooking.guestPhone,
          checkIn: selectedInvoiceBooking.checkIn,
          checkOut: selectedInvoiceBooking.checkOut,
          nights: selectedInvoiceBooking.nights,
          adults: selectedInvoiceBooking.adults,
          children: selectedInvoiceBooking.children,
          roomTypeName: selectedInvoiceBooking.room.roomType.name,
          roomNumber: selectedInvoiceBooking.room.roomNumber,
          baseAmount: finalTaxBreakdown.baseAmount,
          discountAmount: 0,
          gstAmount: finalTaxBreakdown.gst,
          serviceTaxAmount: finalTaxBreakdown.serviceTax,
          otherTaxAmount: finalTaxBreakdown.otherTax,
          totalTaxAmount: finalTaxBreakdown.totalTax,
          totalAmount: finalTaxBreakdown.totalAmount,
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          terms: invoiceFormData.notes || 'Payment due upon receipt',
          notes: `Extra Charges: ${formatCurrency(totalExtraCharges)}\nPayment Mode: ${invoiceFormData.paymentMode}\nCollected By: ${invoiceFormData.collectedBy}${invoiceFormData.referenceId ? `\nReference ID: ${invoiceFormData.referenceId}` : ''}\n\nExtra Charge Details:\n${invoiceFormData.extraCharges.map(charge => `${charge.item}: ${formatCurrency(charge.amount)} - ${charge.description}`).join('\n')}`
        }),
      })

      if (response.ok) {
        const newInvoice = await response.json()
        setInvoices([newInvoice, ...invoices])
        setIsInvoiceModalOpen(false)
        setSelectedInvoiceBooking(null)
        toast({
          title: "Success",
          description: `Invoice generated successfully for booking ${selectedInvoiceBooking.id}`,
        })
        // Refresh bookings to update invoice status
        fetchBookings()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to generate invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      })
    } finally {
      setGeneratingEnhancedInvoice(false)
    }
  }

  // Handle send invoice via email
  const handleSendInvoiceEmail = async (invoice: Invoice) => {
    try {
      setSendingInvoice(true)
      
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailIds: invoiceFormData.emailIds.filter(email => email.trim() !== '')
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invoice sent successfully via email",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      })
    } finally {
      setSendingInvoice(false)
    }
  }

  // Handle bill generation
  const handleBillGeneration = async () => {
    if (!selectedBooking) return

    try {
      setGeneratingBill(true)
      
      // Use baseAmount if available, otherwise calculate from room price
      const roomBaseAmount = (selectedBooking as any).baseAmount || (selectedBooking.room.roomType.price * selectedBooking.nights) || 0
      const totalAmount = roomBaseAmount + billFormData.extraServiceCharge
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          guestName: selectedBooking.guestName,
          guestEmail: selectedBooking.guestEmail,
          guestPhone: selectedBooking.guestPhone,
          checkIn: selectedBooking.checkIn,
          checkOut: selectedBooking.checkOut,
          nights: selectedBooking.nights,
          adults: selectedBooking.adults,
          children: selectedBooking.children,
          roomTypeName: selectedBooking.room.roomType.name,
          roomNumber: selectedBooking.room.roomNumber,
          baseAmount: roomBaseAmount,
          discountAmount: 0,
          gstAmount: 0,
          serviceTaxAmount: 0,
          otherTaxAmount: 0,
          totalTaxAmount: 0,
          totalAmount: totalAmount,
          status: 'paid',
          dueDate: new Date(),
          terms: billFormData.notes || 'Payment due upon receipt',
          notes: `Extra Service Charge: ${formatCurrency(billFormData.extraServiceCharge)}\nPayment Mode: ${billFormData.paymentMode}\nCollected By: ${billFormData.collectedBy}`
        }),
      })

      if (response.ok) {
        const newInvoice = await response.json()
        setInvoices([newInvoice, ...invoices])
        setIsBillModalOpen(false)
        setSelectedBooking(null)
        toast({
          title: "Success",
          description: `Bill generated successfully for booking ${selectedBooking.id}`,
        })
        // Refresh bookings to update invoice status
        fetchBookings()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to generate bill",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating bill:', error)
      toast({
        title: "Error",
        description: "Failed to generate bill",
        variant: "destructive",
      })
    } finally {
      setGeneratingBill(false)
    }
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesQuery = 
      invoice.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
      invoice.guestName.toLowerCase().includes(query.toLowerCase()) ||
      invoice.guestEmail.toLowerCase().includes(query.toLowerCase()) ||
      invoice.roomNumber.toLowerCase().includes(query.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || getDisplayStatus(invoice) === statusFilter
    
    return matchesQuery && matchesStatus
  })

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesQuery = 
      booking.id.toLowerCase().includes(query.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(query.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(query.toLowerCase()) ||
      booking.room.roomNumber.toLowerCase().includes(query.toLowerCase())
    
    return matchesQuery
  })

  // Calculate summary statistics
  const totalInvoices = filteredInvoices.length
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === 'pending' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
  const overdueAmount = filteredInvoices
    .filter(inv => isOverdue(inv))
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  // Calculate booking statistics
  const totalBookings = filteredBookings.length
  const bookingsWithInvoices = filteredBookings.filter(booking => booking.invoices && booking.invoices.length > 0).length
  const bookingsWithoutInvoices = totalBookings - bookingsWithInvoices

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Billing & Invoice Management</h1>
            <p className="text-[10px] sm:text-sm text-gray-600">Professional billing system with streamlined invoice generation and payment processing. Manage bookings, add extra charges, and generate bills all in one place.</p>
          </div>
          <Button onClick={() => console.log('Generate Invoice')} className="h-8 w-8 sm:h-auto sm:w-auto sm:px-3 flex items-center justify-center">
            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 text-gray-600" />
            <span className="hidden sm:inline text-gray-600">Generate Invoice</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Total Invoices</p>
                <p className="text-sm sm:text-2xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
              <FileText className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Total Amount</p>
                <p className="text-sm sm:text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-4 w-4 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Ready for Billing</p>
                <p className="text-sm sm:text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <Calendar className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">With Extra Charges</p>
                <p className="text-sm sm:text-2xl font-bold text-purple-600">{bookings.filter(b => b.billItems && b.billItems.length > 0).length}</p>
              </div>
              <Plus className="h-4 w-4 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alerts Summary */}
      {filteredInvoices.filter(inv => isOverdue(inv)).length > 0 && (
        <Card className="border border-red-200 bg-red-50 rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-red-800">Overdue Invoices Alert</h3>
                <p className="text-[10px] sm:text-sm text-red-700">
                  {filteredInvoices.filter(inv => isOverdue(inv)).length} invoice(s) overdue • 
                  Total overdue amount: {formatCurrency(overdueAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Bookings Ready for Billing ({totalBookings})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
            Generated Invoices ({totalInvoices})
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <Input
            placeholder={activeTab === 'invoices' ? "Search invoices by number, guest name, email, or room..." : "Search bookings by ID, guest name, email, or room..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 sm:pl-10 h-8 sm:h-9 text-[10px] sm:text-sm"
          />
        </div>
        {activeTab === 'invoices' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 sm:w-48 h-8 sm:h-9 text-[10px] sm:text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tables */}
      {(loading && activeTab === 'invoices') || (bookingsLoading && activeTab === 'bookings') ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {activeTab === 'invoices' ? (
            /* Invoices Table */
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Invoice #</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Guest Details</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Room</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Stay Period</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Amount</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Status</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Due Date</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-b border-gray-100">
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="font-medium text-[10px] sm:text-sm text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-[9px] sm:text-xs text-gray-500">
                        {new Date(invoice.issuedDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-[10px] sm:text-sm text-gray-900">{invoice.guestName}</div>
                        <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          {invoice.guestPhone}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          {invoice.guestEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-[10px] sm:text-sm text-gray-900">{invoice.roomNumber}</div>
                        <div className="text-[9px] sm:text-xs text-gray-600">{invoice.roomTypeName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="text-[10px] sm:text-sm text-gray-900">
                          {formatDate(invoice.checkIn)} → {formatDate(invoice.checkOut)}
                        </div>
                        <div className="text-[9px] sm:text-xs text-gray-600">{invoice.nights} night(s)</div>
                        
                        {/* Overdue indicator */}
                        {isOverdue(invoice) && (
                          <div className="flex items-center gap-1 text-red-600 text-[9px] sm:text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{getDaysOverdue(invoice)} day(s) overdue</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-[10px] sm:text-sm text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
                        {invoice.discountAmount > 0 && (
                          <div className="text-[9px] sm:text-xs text-green-600">
                            -{formatCurrency(invoice.discountAmount)} discount
                          </div>
                        )}
                        {invoice.payments.length > 0 && (
                          <div className="text-[9px] sm:text-xs text-blue-600">
                            {formatCurrency(invoice.payments.reduce((sum, p) => sum + p.amount, 0))} paid
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="space-y-1">
                        <select
                          value={invoice.status}
                          onChange={(e) => console.log('Status changed:', e.target.value)}
                          className={`px-2 py-1 rounded text-[9px] sm:text-xs font-medium border-0 focus:ring-2 focus:ring-amber-500 ${statusColors[getDisplayStatus(invoice)] || 'bg-gray-100 text-gray-800'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="sent">Sent</option>
                          <option value="partially_paid">Partially Paid</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        
                        {/* Overdue indicator */}
                        {isOverdue(invoice) && (
                          <div className="flex items-center gap-1 text-red-600 text-[9px] sm:text-xs mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                      <div className="text-[10px] sm:text-sm text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                      {isOverdue(invoice) && (
                        <div className="text-[9px] sm:text-xs text-red-600">
                          {getDaysOverdue(invoice)} day(s) late
                        </div>
                      )}
                    </TableCell>
                                         <TableCell className="px-2 sm:px-3 py-3 sm:py-4">
                       <div className="flex gap-1">
                                                 <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoiceAsBill(invoice)}
                          title="View Bill/Invoice Format"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleEditInvoice(invoice)}
                           title="Edit Invoice"
                           className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                         >
                           <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleSendInvoice(invoice)}
                           title="Send Invoice"
                           disabled={invoice.emailSent}
                           className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                         >
                           <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                         </Button>
                                                   <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBill(invoice)}
                            title="View Bill"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            disabled={deleting === invoice.id}
                            title="Delete Invoice"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting === invoice.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                       </div>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Bookings Table */
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Booking ID</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Guest Details</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Room</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Stay Period</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Base Amount</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Extra Charges</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Total Amount</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-200">Status</TableHead>
                  <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 sm:py-4 px-2 sm:px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const hasInvoice = booking.invoices && booking.invoices.length > 0;
                  return (
                    <TableRow key={booking.id} className="border-b border-gray-100">
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="font-medium text-[10px] sm:text-sm text-gray-900">{booking.id}</div>
                        <div className="text-[9px] sm:text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-[10px] sm:text-sm text-gray-900">{booking.guestName}</div>
                          <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            {booking.guestPhone}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-600">
                            <Mail className="h-3 w-3" />
                            {booking.guestEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-[10px] sm:text-sm text-gray-900">{booking.room.roomNumber}</div>
                          <div className="text-[9px] sm:text-xs text-gray-600">{booking.room.roomType.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="space-y-1">
                          <div className="text-[10px] sm:text-sm text-gray-900">
                            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                          </div>
                          <div className="text-[9px] sm:text-xs text-gray-600">{booking.nights} night(s)</div>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="font-medium text-[10px] sm:text-sm text-gray-900">{formatCurrency((booking as any).baseAmount || (booking.room.roomType.price * booking.nights))}</div>
                        <div className="text-[9px] sm:text-xs text-gray-600">Base room rate</div>
                        {((booking as any).gstAmount || 0) > 0 && (
                          <div className="text-[9px] sm:text-xs text-green-600">
                            +{formatCurrency((booking as any).gstAmount || 0)} GST
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="space-y-1">
                          {booking.billItems && booking.billItems.length > 0 ? (
                            <div className="space-y-1">
                              {booking.billItems.map((item) => (
                                <div key={item.id} className="text-[9px] sm:text-xs">
                                  <div className="font-medium text-[10px] sm:text-sm text-gray-900">{item.itemName}</div>
                                  <div className="text-[9px] sm:text-xs text-gray-600">{formatCurrency(item.finalAmount)}</div>
                                </div>
                              ))}
                              <div className="text-[9px] sm:text-xs font-medium text-blue-600">
                                Total: {formatCurrency(booking.billItems.reduce((sum, item) => sum + item.finalAmount, 0))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] sm:text-xs text-gray-500">No extra charges</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="font-medium text-[10px] sm:text-sm text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div className="text-[9px] sm:text-xs text-gray-600">
                          {booking.billItems && booking.billItems.length > 0 && (
                            <span className="text-blue-600">
                              +{formatCurrency(booking.billItems.reduce((sum, item) => sum + item.finalAmount, 0))} extra
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 px-2 sm:px-3 py-3 sm:py-4">
                        <div className="space-y-1">
                          <Badge className={`${statusColors[booking.status] || 'bg-gray-100 text-gray-800'} text-[9px] sm:text-xs px-2 py-1`}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {hasInvoice && (
                            <div className="text-[9px] sm:text-xs text-green-600">
                              Invoice generated
                            </div>
                          )}
                        </div>
                      </TableCell>
                                                                   <TableCell className="px-2 sm:px-3 py-3 sm:py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateBillInvoice(booking)}
                            title="Generate Bill"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 h-8 sm:h-9 text-[10px] sm:text-xs"
                          >
                            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Generate Bill
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBooking(booking)}
                            title="View Booking Details"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                            title="Edit Booking"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
                 </div>
       )}

       {/* Invoice Detail Modal */}
       <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-xl font-semibold text-gray-900">
               Invoice Details - {selectedInvoice?.invoiceNumber}
             </DialogTitle>
             <DialogDescription>
               Complete invoice information and payment details
             </DialogDescription>
           </DialogHeader>
           {selectedInvoice && (
             <div className="space-y-6">
               {/* Guest Information */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Guest Information</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Guest Name</Label>
                       <p className="text-sm text-gray-900">{selectedInvoice.guestName}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Email</Label>
                       <p className="text-sm text-gray-900">{selectedInvoice.guestEmail}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Phone</Label>
                       <p className="text-sm text-gray-900">{selectedInvoice.guestPhone}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Room</Label>
                       <p className="text-sm text-gray-900">{selectedInvoice.roomNumber} - {selectedInvoice.roomTypeName}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Stay Details */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Stay Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Check-in</Label>
                       <p className="text-sm text-gray-900">{new Date(selectedInvoice.checkIn).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Check-out</Label>
                       <p className="text-sm text-gray-900">{new Date(selectedInvoice.checkOut).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Nights</Label>
                       <p className="text-sm text-gray-900">{selectedInvoice.nights}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Payment Details */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Payment Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Base Amount</Label>
                       <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.baseAmount)}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Discount</Label>
                       <p className="text-sm text-green-600">-{formatCurrency(selectedInvoice.discountAmount)}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Taxes</Label>
                       <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.totalTaxAmount)}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                       <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedInvoice.totalAmount)}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Invoice Status */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Invoice Status</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Status</Label>
                       <Badge className={`${statusColors[getDisplayStatus(selectedInvoice)]} text-xs px-2 py-1`}>
                         {selectedInvoice.status.toUpperCase()}
                       </Badge>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                       <p className="text-sm text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Issued Date</Label>
                       <p className="text-sm text-gray-900">{new Date(selectedInvoice.issuedDate).toLocaleDateString()}</p>
                     </div>
                     {selectedInvoice.paidDate && (
                       <div>
                         <Label className="text-sm font-medium text-gray-700">Paid Date</Label>
                         <p className="text-sm text-gray-900">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Edit Invoice Modal */}
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="text-xl font-semibold text-gray-900">
               Edit Invoice - {editingInvoice?.invoiceNumber}
             </DialogTitle>
             <DialogDescription>
               Update invoice status and details
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="status">Status</Label>
               <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select status" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="pending">Pending</SelectItem>
                   <SelectItem value="sent">Sent</SelectItem>
                   <SelectItem value="partially_paid">Partially Paid</SelectItem>
                   <SelectItem value="paid">Paid</SelectItem>
                   <SelectItem value="cancelled">Cancelled</SelectItem>
                   <SelectItem value="refunded">Refunded</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div>
               <Label htmlFor="notes">Notes</Label>
               <Textarea
                 id="notes"
                 value={editFormData.notes}
                 onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                 placeholder="Add any additional notes..."
                 rows={3}
               />
             </div>
             <div>
               <Label htmlFor="terms">Terms</Label>
               <Textarea
                 id="terms"
                 value={editFormData.terms}
                 onChange={(e) => setEditFormData({...editFormData, terms: e.target.value})}
                 placeholder="Payment terms..."
                 rows={2}
               />
             </div>
             <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                 Cancel
               </Button>
               <Button onClick={handleUpdateInvoice} disabled={updating}>
                 {updating ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                 Update Invoice
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Generate Bill Modal */}
       <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-xl font-semibold text-gray-900">
               Generate Bill - {selectedBooking?.id}
             </DialogTitle>
             <DialogDescription>
               Create a comprehensive bill with extra charges and payment details
             </DialogDescription>
           </DialogHeader>
           {selectedBooking && (
             <div className="space-y-6">
               {/* Booking Details */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Booking Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Guest Name</Label>
                       <p className="text-sm text-gray-900">{selectedBooking.guestName}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Phone</Label>
                       <p className="text-sm text-gray-900">{selectedBooking.guestPhone}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Room</Label>
                       <p className="text-sm text-gray-900">{selectedBooking.room.roomNumber} - {selectedBooking.room.roomType.name}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Stay Period</Label>
                       <p className="text-sm text-gray-900">
                         {formatDate(selectedBooking.checkIn)} → {formatDate(selectedBooking.checkOut)} ({selectedBooking.nights} nights)
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Bill Calculation */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Bill Calculation</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Base Amount</Label>
                       <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedBooking.totalAmount)}</p>
                     </div>
                     <div>
                       <Label htmlFor="extraServiceCharge" className="text-sm font-medium text-gray-700">Extra Service Charge</Label>
                       <Input
                         id="extraServiceCharge"
                         type="number"
                         value={billFormData.extraServiceCharge}
                         onChange={(e) => setBillFormData({...billFormData, extraServiceCharge: parseFloat(e.target.value) || 0})}
                         placeholder="0"
                         className="mt-1"
                       />
                     </div>
                   </div>
                   <div className="border-t pt-4">
                     <div className="flex justify-between items-center">
                       <Label className="text-lg font-semibold text-gray-900">Total Bill Amount</Label>
                       <p className="text-2xl font-bold text-blue-600">
                         {formatCurrency((selectedBooking as any).baseAmount || (selectedBooking.room.roomType.price * selectedBooking.nights) || 0 + billFormData.extraServiceCharge)}
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Payment Details */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Payment Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="paymentMode">Payment Mode</Label>
                       <Select value={billFormData.paymentMode} onValueChange={(value) => setBillFormData({...billFormData, paymentMode: value})}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select payment mode" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="cash">Cash</SelectItem>
                           <SelectItem value="card">Card</SelectItem>
                           <SelectItem value="upi">UPI</SelectItem>
                           <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                           <SelectItem value="cheque">Cheque</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="collectedBy">Collected By</Label>
                       <Input
                         id="collectedBy"
                         value={billFormData.collectedBy}
                         onChange={(e) => setBillFormData({...billFormData, collectedBy: e.target.value})}
                         placeholder="Staff name"
                       />
                     </div>
                   </div>
                   <div>
                     <Label htmlFor="notes">Additional Notes</Label>
                     <Textarea
                       id="notes"
                       value={billFormData.notes}
                       onChange={(e) => setBillFormData({...billFormData, notes: e.target.value})}
                       placeholder="Any additional notes or special instructions..."
                       rows={3}
                     />
                   </div>
                 </CardContent>
               </Card>

               {/* Action Buttons */}
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setIsBillModalOpen(false)}>
                   Cancel
                 </Button>
                 <Button onClick={handleBillGeneration} disabled={generatingBill} className="bg-green-600 hover:bg-green-700">
                   {generatingBill ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Receipt className="h-4 w-4 mr-2" />}
                   Generate Bill
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* View Bill Modal */}
       <Dialog open={isViewBillModalOpen} onOpenChange={setIsViewBillModalOpen}>
         <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
           {selectedBillInvoice && (
             <div className="bg-white">
                               {/* Bill Header */}
                <div className="border-b-2 border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-gray-900">TAX INVOICE</h1>
                      <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">BOOKING ID:</span>
                          <span className="ml-2 text-gray-900">{selectedBillInvoice.bookingId}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">DATE:</span>
                          <span className="ml-2 text-gray-900">{new Date(selectedBillInvoice.issuedDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">DOCUMENT TYPE:</span>
                          <span className="ml-2 text-gray-900">Invoice</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">PLACE OF SUPPLY:</span>
                          <span className="ml-2 text-gray-900">Maharashtra</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center justify-end space-x-4">
                        <div className="text-sm">
                          <div><span className="font-semibold text-gray-700">INVOICE NO.:</span> <span className="text-gray-900">{selectedBillInvoice.invoiceNumber}</span></div>
                          <div><span className="font-semibold text-gray-700">TRANSACTIONAL TYPE/CATEGORY:</span> <span className="text-gray-900">REG/B2C</span></div>
                          <div><span className="font-semibold text-gray-700">TRANSACTION DETAIL:</span> <span className="text-gray-900">RG</span></div>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                          {hotelInfo.logo ? (
                            <div className="w-20 h-12 flex items-center justify-center">
                              <img 
                                src={hotelInfo.logo} 
                                alt={hotelInfo.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">
                                {hotelInfo.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                                                     <div className="bg-gray-100 p-2 rounded">
                             <div className="text-xs text-gray-500 text-center">QR Code</div>
                             {selectedBillInvoice.qrCode ? (
                               <img 
                                 src={selectedBillInvoice.qrCode} 
                                 alt="QR Code"
                                 className="w-16 h-16 rounded"
                               />
                             ) : (
                               <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                 <span className="text-xs text-gray-500">QR</span>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                               {/* Hotel and Customer Information */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {hotelInfo.logo ? (
                          <div className="w-16 h-16 flex items-center justify-center">
                            <img 
                              src={hotelInfo.logo} 
                              alt={hotelInfo.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {hotelInfo.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                                                 <div>
                           {/* Hotel name and tagline removed - only logo shown */}
                         </div>
                      </div>
                      {hotelInfo.address && (
                        <p className="text-sm text-gray-600">{hotelInfo.address}</p>
                      )}
                      <p className="text-sm text-gray-600">Stay Period: {new Date(selectedBillInvoice.checkIn).toLocaleDateString()} - {new Date(selectedBillInvoice.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-700">CUSTOMER NAME</div>
                        <div className="text-gray-900">{selectedBillInvoice.guestName}</div>
                      </div>
                    </div>
                  </div>
                </div>

               {/* Payment Breakup */}
               <div className="p-6">
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">PAYMENT BREAKUP</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-700">Accommodation charges (including applicable hotel taxes) collected on behalf of hotel</span>
                       <span className="font-semibold text-gray-900">{formatCurrency(selectedBillInvoice.baseAmount)}</span>
                     </div>
                     
                     {/* Extra Items Section */}
                     {selectedBillInvoice.invoiceItems && selectedBillInvoice.invoiceItems.length > 0 && (
                       <>
                         <div className="border-t border-gray-300 pt-3">
                           <h4 className="font-semibold text-gray-800 mb-2">Extra Items:</h4>
                           {selectedBillInvoice.invoiceItems.map((item, index) => (
                             <div key={index} className="space-y-1 mb-2 p-2 bg-white rounded border">
                               <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-gray-700">{item.itemName}</span>
                                 <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</span>
                               </div>
                               {item.description && (
                                 <div className="text-xs text-gray-600">{item.description}</div>
                               )}
                               {item.taxAmount > 0 && (
                                 <div className="flex justify-between text-xs text-green-600">
                                   <span>GST ({item.taxRate}%)</span>
                                   <span>{formatCurrency(item.taxAmount)}</span>
                                 </div>
                               )}
                               <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                 <span>Total</span>
                                 <span className="text-blue-600">{formatCurrency(item.finalAmount)}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       </>
                     )}
                     
                     {selectedBillInvoice.discountAmount > 0 && (
                       <div className="flex justify-between items-center">
                         <span className="text-sm text-gray-700">Effective discount</span>
                         <span className="font-semibold text-red-600">-{formatCurrency(selectedBillInvoice.discountAmount)}</span>
                       </div>
                     )}
                     {selectedBillInvoice.totalTaxAmount > 0 && (
                       <div className="flex justify-between items-center">
                         <span className="text-sm text-gray-700">GST & Service Tax</span>
                         <span className="font-semibold text-gray-900">{formatCurrency(selectedBillInvoice.totalTaxAmount)}</span>
                       </div>
                     )}
                     <div className="border-t border-gray-300 pt-3">
                       <div className="flex justify-between items-center">
                         <span className="font-semibold text-gray-900">Total Booking Amount</span>
                         <span className="font-bold text-gray-900">{formatCurrency(selectedBillInvoice.totalAmount)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="font-semibold text-gray-900">Grand Total</span>
                         <span className="font-bold text-xl text-gray-900">{formatCurrency(selectedBillInvoice.totalAmount)}</span>
                       </div>
                     </div>
                   </div>
                   <div className="text-center text-xs text-gray-500 mt-4">
                     This is a computer generated Invoice and does not require Signature/Stamp.
                   </div>
                 </div>
               </div>

               {/* Important Notes */}
               <div className="p-6 border-t border-gray-200">
                 <div className="space-y-3 text-sm text-gray-700">
                   <div>
                     <span className="font-semibold">GST Credit Note:</span> GST credit charged by the hotel is only available against the invoice issued by the respective hotel. If you are looking for the hotel GST invoice, please collect from the hotel.
                   </div>
                   <div>
                     <span className="font-semibold">Travel Document Disclaimer:</span> This is not a valid travel document
                   </div>
                 </div>
               </div>

                               {/* Company Information */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      {hotelInfo.gstNumber && (
                        <div><span className="font-semibold text-gray-700">GST Number:</span> <span className="text-gray-900">{hotelInfo.gstNumber}</span></div>
                      )}
                      
                    </div>
                    <div>
                      <div><span className="font-semibold text-gray-700">HSN/SAC:</span> <span className="text-gray-900">998552</span></div>
                      <div><span className="font-semibold text-gray-700">SERVICE DESCRIPTION:</span></div>
                      <div className="text-gray-900">Reservation service for accommodation</div>
                    </div>
                    <div>
                      {hotelInfo.serviceTaxPercentage && hotelInfo.serviceTaxPercentage > 0 && (
                        <div><span className="font-semibold text-gray-700">Service Tax %:</span> <span className="text-gray-900">{hotelInfo.serviceTaxPercentage}%</span></div>
                      )}
                      {hotelInfo.otherTaxes && hotelInfo.otherTaxes.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-700">Other Taxes:</span>
                          {hotelInfo.otherTaxes.map((tax, index) => (
                            <div key={index} className="text-gray-900 ml-2">{tax.name}: {tax.percentage}%</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="font-semibold text-gray-700">{hotelInfo.name} Address:</div>
                    {hotelInfo.address && (
                      <div className="text-gray-900">{hotelInfo.address}</div>
                    )}
                    <div className="text-gray-900">
                      {hotelInfo.primaryPhone && `Phone: ${hotelInfo.primaryPhone}`}
                      {hotelInfo.primaryPhone && hotelInfo.primaryEmail && ' | '}
                      {hotelInfo.primaryEmail && `Email: ${hotelInfo.primaryEmail}`}
                    </div>
                    {hotelInfo.whatsappPhone && (
                      <div className="text-gray-900">WhatsApp: {hotelInfo.whatsappPhone}</div>
                    )}
                    {hotelInfo.reservationEmail && (
                      <div className="text-gray-900">Reservations: {hotelInfo.reservationEmail}</div>
                    )}
                  </div>
                  {hotelInfo.emergencyContact && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="font-semibold text-gray-700">Emergency Contact:</div>
                      <div className="text-gray-900">{hotelInfo.emergencyContact}</div>
                    </div>
                  )}
                </div>

               {/* Action Buttons */}
               <div className="p-6 border-t border-gray-200 bg-white">
                 <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setIsViewBillModalOpen(false)}>
                     Close
                   </Button>
                   <Button onClick={() => handleDownloadInvoice(selectedBillInvoice)} className="bg-blue-600 hover:bg-blue-700">
                     <Download className="h-4 w-4 mr-2" />
                     Download PDF
                   </Button>
                 </div>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Enhanced Invoice Modal */}
       <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
         <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-xl font-semibold text-gray-900">
               Generate Invoice - {selectedInvoiceBooking?.id}
             </DialogTitle>
             <DialogDescription>
               Create a professional invoice with extra charges and payment details (Before Payment)
             </DialogDescription>
           </DialogHeader>
           {selectedInvoiceBooking && (
             <div className="space-y-6">
               {/* Booking Details */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Booking Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Guest Name</Label>
                       <p className="text-sm text-gray-900">{selectedInvoiceBooking.guestName}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Phone</Label>
                       <p className="text-sm text-gray-900">{selectedInvoiceBooking.guestPhone}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Room</Label>
                       <p className="text-sm text-gray-900">{selectedInvoiceBooking.room.roomNumber} - {selectedInvoiceBooking.room.roomType.name}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-gray-700">Stay Period</Label>
                       <p className="text-sm text-gray-900">
                         {formatDate(selectedInvoiceBooking.checkIn)} → {formatDate(selectedInvoiceBooking.checkOut)} ({selectedInvoiceBooking.nights} nights)
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Extra Charges */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <div className="flex justify-between items-center">
                     <CardTitle className="text-lg font-semibold text-gray-900">Extra Charges</CardTitle>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleAddExtraCharge}
                       className="text-blue-600 hover:text-blue-700"
                     >
                       <Plus className="h-4 w-4 mr-1" />
                       Add Item
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {invoiceFormData.extraCharges.map((charge, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                       <div>
                         <Label className="text-sm font-medium text-gray-700">Item</Label>
                         <Input
                           value={charge.item}
                                                              onChange={(e) => handleUpdateBillExtraCharge(index, 'item', e.target.value)}
                           placeholder="e.g., Water Bottle, Food"
                         />
                       </div>
                       <div>
                         <Label className="text-sm font-medium text-gray-700">Amount</Label>
                         <Input
                           type="number"
                           value={charge.amount}
                                                              onChange={(e) => handleUpdateBillExtraCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                           placeholder="0"
                         />
                       </div>
                       <div>
                         <Label className="text-sm font-medium text-gray-700">Description</Label>
                         <Input
                           value={charge.description}
                                                              onChange={(e) => handleUpdateBillExtraCharge(index, 'description', e.target.value)}
                           placeholder="Optional description"
                         />
                       </div>
                       <div>
                         <Button
                           variant="outline"
                           size="sm"
                                                              onClick={() => handleRemoveBillExtraCharge(index)}
                           className="text-red-600 hover:text-red-700"
                           disabled={invoiceFormData.extraCharges.length === 1}
                         >
                           <Trash2 className="h-4 w-4 text-red-600" />
                         </Button>
                       </div>
                     </div>
                   ))}
                   <div className="border-t pt-4">
                     <div className="flex justify-between items-center">
                       <Label className="text-sm font-medium text-gray-700">Total Extra Charges</Label>
                       <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculateTotalExtraCharges())}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Payment Details */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-semibold text-gray-900">Payment Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="paymentMode">Payment Mode</Label>
                       <Select value={invoiceFormData.paymentMode} onValueChange={(value) => setInvoiceFormData({...invoiceFormData, paymentMode: value})}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select payment mode" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="cash">Cash</SelectItem>
                           <SelectItem value="card">Card</SelectItem>
                           <SelectItem value="upi">UPI</SelectItem>
                           <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                           <SelectItem value="cheque">Cheque</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     {invoiceFormData.paymentMode !== 'cash' && (
                       <div>
                         <Label htmlFor="referenceId">Reference ID</Label>
                         <Input
                           id="referenceId"
                           value={invoiceFormData.referenceId}
                           onChange={(e) => setInvoiceFormData({...invoiceFormData, referenceId: e.target.value})}
                           placeholder="Transaction reference"
                         />
                       </div>
                     )}
                     <div>
                       <Label htmlFor="collectedBy">Collected By</Label>
                       <Select value={invoiceFormData.collectedBy} onValueChange={(value) => setInvoiceFormData({...invoiceFormData, collectedBy: value})}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select staff member" />
                         </SelectTrigger>
                         <SelectContent>
                           {users.map((user) => (
                             <SelectItem key={user.id} value={user.name}>
                               {user.name} ({user.email})
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <div>
                     <Label htmlFor="notes">Additional Notes</Label>
                     <Textarea
                       id="notes"
                       value={invoiceFormData.notes}
                       onChange={(e) => setInvoiceFormData({...invoiceFormData, notes: e.target.value})}
                       placeholder="Any additional notes or special instructions..."
                       rows={3}
                     />
                   </div>
                 </CardContent>
               </Card>

               {/* Email Configuration */}
               <Card className="border border-gray-200 shadow-sm">
                 <CardHeader className="pb-3">
                   <div className="flex justify-between items-center">
                     <CardTitle className="text-lg font-semibold text-gray-900">Email Configuration (Optional)</CardTitle>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleAddEmail}
                       className="text-blue-600 hover:text-blue-700"
                     >
                       <Plus className="h-4 w-4 mr-1" />
                       Add Email
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {invoiceFormData.emailIds.map((email, index) => (
                     <div key={index} className="flex gap-2">
                       <Input
                         type="email"
                         value={email}
                         onChange={(e) => handleUpdateEmail(index, e.target.value)}
                         placeholder="Enter email address"
                         className="flex-1"
                       />
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleRemoveEmail(index)}
                         className="text-red-600 hover:text-red-700"
                         disabled={invoiceFormData.emailIds.length === 1}
                       >
                         <Trash2 className="h-4 w-4 text-red-600" />
                       </Button>
                     </div>
                   ))}
                   <p className="text-xs text-gray-500">
                     Add email addresses to automatically send the invoice after generation
                   </p>
                 </CardContent>
               </Card>

               {/* Total Calculation */}
               <Card className="border border-blue-200 bg-blue-50">
                 <CardContent className="p-4">
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <Label className="text-sm font-medium text-gray-700">Base Amount</Label>
                       <p className="text-sm text-gray-900">{formatCurrency(selectedInvoiceBooking.totalAmount)}</p>
                     </div>
                     <div className="flex justify-between items-center">
                       <Label className="text-sm font-medium text-gray-700">Extra Charges</Label>
                       <p className="text-sm text-gray-900">{formatCurrency(calculateTotalExtraCharges())}</p>
                     </div>
                     <div className="flex justify-between items-center">
                       <Label className="text-sm font-medium text-gray-700">Subtotal</Label>
                       <p className="text-sm text-gray-900">{formatCurrency(((selectedInvoiceBooking as any).baseAmount || (selectedInvoiceBooking.room.roomType.price * selectedInvoiceBooking.nights) || 0) + calculateTotalExtraCharges())}</p>
                     </div>
                     
                     {/* Tax Breakdown */}
                     {taxBreakdown && taxBreakdown.taxes.length > 0 && (
                       <>
                         {taxBreakdown.taxes.map((tax, index) => (
                           <div key={index} className="flex justify-between items-center">
                             <Label className="text-sm font-medium text-gray-700">{tax.name} ({tax.percentage}%)</Label>
                             <p className="text-sm text-gray-900">{formatCurrency(tax.amount)}</p>
                           </div>
                         ))}
                         <div className="flex justify-between items-center">
                           <Label className="text-sm font-medium text-gray-700">Total Tax</Label>
                           <p className="text-sm text-gray-900">{formatCurrency(taxBreakdown.totalTax)}</p>
                         </div>
                       </>
                     )}
                     
                     <div className="border-t pt-2">
                       <div className="flex justify-between items-center">
                         <Label className="text-lg font-semibold text-gray-900">Total Invoice Amount</Label>
                         <p className="text-2xl font-bold text-blue-600">
                           {formatCurrency(taxBreakdown ? taxBreakdown.totalAmount : ((selectedInvoiceBooking as any).baseAmount || (selectedInvoiceBooking.room.roomType.price * selectedInvoiceBooking.nights) || 0) + calculateTotalExtraCharges())}
                         </p>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Action Buttons */}
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
                   Cancel
                 </Button>
                 <Button onClick={handleEnhancedInvoiceGeneration} disabled={generatingEnhancedInvoice} className="bg-blue-600 hover:bg-blue-700">
                   {generatingEnhancedInvoice ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                   Generate Invoice
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Tax Invoice Modal */}
       <Dialog open={isTaxInvoiceModalOpen} onOpenChange={setIsTaxInvoiceModalOpen}>
         <DialogContent className="max-w-7xl max-h-[98vh] overflow-y-auto p-0">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg">
             <DialogHeader className="text-white">
               <DialogTitle className="text-2xl font-bold">
                 Tax Invoice
               </DialogTitle>
             </DialogHeader>
           </div>
           
           {selectedTaxInvoiceBooking && (
             <div className="p-6 space-y-6">
               {/* Booking Summary */}
               <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-blue-200">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="text-center">
                     <span className="text-sm font-medium text-gray-600 block">Booking ID</span>
                     <span className="text-lg font-bold text-gray-900">{selectedTaxInvoiceBooking.id}</span>
                   </div>
                   <div className="text-center">
                     <span className="text-sm font-medium text-gray-600 block">Guest Name</span>
                     <span className="text-lg font-semibold text-gray-900">{selectedTaxInvoiceBooking.guestName}</span>
                   </div>
                   <div className="text-center">
                     <span className="text-sm font-medium text-gray-600 block">Room</span>
                     <span className="text-lg font-semibold text-gray-900">{selectedTaxInvoiceBooking.room.roomNumber}</span>
                   </div>
                   <div className="text-center">
                     <span className="text-sm font-medium text-gray-600 block">Total Amount</span>
                     <span className="text-lg font-bold text-green-600">
                       {formatCurrency(selectedTaxInvoiceBooking.totalAmount * 1.18)}
                     </span>
                   </div>
                 </div>
               </div>

               {/* Tax Invoice Preview */}
               <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                 <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-b border-gray-200">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-gray-900 flex items-center">
                       <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                       Tax Invoice Preview
                     </h3>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                       <span>Generated on:</span>
                       <span className="font-medium">{new Date().toLocaleDateString('en-IN')}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="p-4">
                   <InvoicePDF invoiceData={{
                     invoiceNumber: `INV-${selectedTaxInvoiceBooking.id}`,
                     invoiceDate: new Date().toISOString().split('T')[0],
                     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                     terms: 'Due on Receipt',
                     company: {
                       name: hotelInfo.name,
                       address: hotelInfo.address ? hotelInfo.address.split('\n') : [
                         'Hotel Address Line 1',
                         'Hotel Address Line 2',
                         'City, State ZIP',
                         'Country'
                       ],
                                            logo: hotelInfo.logo || undefined,
                     contact: hotelInfo.primaryPhone || undefined
                     },
                     billTo: {
                       name: selectedTaxInvoiceBooking.guestName,
                       address: [
                         selectedTaxInvoiceBooking.guestEmail,
                         selectedTaxInvoiceBooking.guestPhone,
                         `Room: ${selectedTaxInvoiceBooking.room.roomNumber}`,
                         `${selectedTaxInvoiceBooking.room.roomType.name}`
                       ]
                     },
                     shipTo: {
                       address: [
                         selectedTaxInvoiceBooking.guestEmail,
                         selectedTaxInvoiceBooking.guestPhone,
                         `Room: ${selectedTaxInvoiceBooking.room.roomNumber}`,
                         `${selectedTaxInvoiceBooking.room.roomType.name}`
                       ]
                     },
                     items: [
                       {
                         id: 1,
                         name: `Room Stay - ${selectedTaxInvoiceBooking.room.roomType.name}`,
                         description: `${formatDate(selectedTaxInvoiceBooking.checkIn)} to ${formatDate(selectedTaxInvoiceBooking.checkOut)} (${selectedTaxInvoiceBooking.nights} nights)`,
                         quantity: selectedTaxInvoiceBooking.nights,
                         unit: 'nights',
                         rate: selectedTaxInvoiceBooking.room.roomType.price,
                         amount: selectedTaxInvoiceBooking.room.roomType.price * selectedTaxInvoiceBooking.nights
                       },
                       ...(selectedTaxInvoiceBooking.billItems || []).map((item, index) => ({
                         id: index + 2,
                         name: item.itemName,
                         description: item.description || '',
                         quantity: item.quantity,
                         unit: 'pcs',
                         rate: item.unitPrice,
                         amount: item.finalAmount
                       }))
                     ],
                     subtotal: selectedTaxInvoiceBooking.totalAmount,
                     taxRate: 18, // 18% GST
                     total: selectedTaxInvoiceBooking.totalAmount * 1.18,
                     currency: 'INR'
                   }}>
                     <Invoice data={{
                       invoiceNumber: `INV-${selectedTaxInvoiceBooking.id}`,
                       invoiceDate: new Date().toISOString().split('T')[0],
                       dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                       terms: 'Due on Receipt',
                       company: {
                         name: hotelInfo.name,
                         address: hotelInfo.address ? hotelInfo.address.split('\n') : [
                           'Hotel Address Line 1',
                           'Hotel Address Line 2',
                           'City, State ZIP',
                           'Country'
                         ],
                         logo: hotelInfo.logo || undefined,
                         contact: hotelInfo.primaryPhone || undefined
                       },
                       billTo: {
                         name: selectedTaxInvoiceBooking.guestName,
                         address: [
                           selectedTaxInvoiceBooking.guestEmail,
                           selectedTaxInvoiceBooking.guestPhone,
                           `Room: ${selectedTaxInvoiceBooking.room.roomNumber}`,
                           `${selectedTaxInvoiceBooking.room.roomType.name}`
                         ]
                       },
                       shipTo: {
                         address: [
                           selectedTaxInvoiceBooking.guestEmail,
                           selectedTaxInvoiceBooking.guestPhone,
                           `Room: ${selectedTaxInvoiceBooking.room.roomNumber}`,
                           `${selectedTaxInvoiceBooking.room.roomType.name}`
                         ]
                       },
                       items: [
                         {
                           id: 1,
                           name: `Room Stay - ${selectedTaxInvoiceBooking.room.roomType.name}`,
                           description: `${formatDate(selectedTaxInvoiceBooking.checkIn)} to ${formatDate(selectedTaxInvoiceBooking.checkOut)} (${selectedTaxInvoiceBooking.nights} nights)`,
                           quantity: selectedTaxInvoiceBooking.nights,
                           unit: 'nights',
                           rate: selectedTaxInvoiceBooking.room.roomType.price,
                           amount: selectedTaxInvoiceBooking.room.roomType.price * selectedTaxInvoiceBooking.nights
                         },
                         ...(selectedTaxInvoiceBooking.billItems || []).map((item, index) => ({
                           id: index + 2,
                           name: item.itemName,
                           description: item.description || '',
                           quantity: item.quantity,
                           unit: 'pcs',
                           rate: item.unitPrice,
                           amount: item.finalAmount
                         }))
                       ],
                       subtotal: selectedTaxInvoiceBooking.totalAmount,
                       taxRate: 18, // 18% GST
                       total: selectedTaxInvoiceBooking.totalAmount * 1.18,
                       currency: 'INR'
                     }} />
                   </InvoicePDF>
                 </div>
               </div>

               {/* Professional Action Bar */}
               <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                     <div className="flex items-center space-x-2">
                  </div>
                   
                   <div className="flex flex-wrap items-center gap-3">
                     <Button 
                       variant="outline" 
                       onClick={() => setIsTaxInvoiceModalOpen(false)}
                       className="border-gray-300 text-gray-700 hover:bg-gray-50"
                     >
                       Cancel
                     </Button>
                     
                     <Button 
                       onClick={() => {
                         toast({
                           title: "Success",
                           description: "Professional tax invoice generated successfully!",
                         })
                         setIsTaxInvoiceModalOpen(false)
                       }} 
                       className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                     >
                       <FileText className="h-4 w-4 mr-2" />
                       Generate & Save Invoice
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           )}
                 </DialogContent>
      </Dialog>

            {/* Multi-Step Bill Generation Modal */}
      <Dialog open={isMultiStepModalOpen} onOpenChange={setIsMultiStepModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {billGenerationData.type === 'bill' ? 'Generate Bill' : 'Generate Invoice'} - Step {currentStep} of 4
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Type Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Select Bill/Invoice Type</h3>
                    <p className="text-gray-600">Choose whether to generate a bill (payment received) or invoice (payment pending)</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        billGenerationData.type === 'bill' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTypeSelection('bill')}
                    >
                      <CardContent className="p-6 text-center">
                        <Receipt className="h-12 w-12 mx-auto mb-4 text-green-600" />
                        <h4 className="text-lg font-semibold mb-2">Bill</h4>
                        <p className="text-sm text-gray-600">Payment received - Generate receipt</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        billGenerationData.type === 'invoice' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTypeSelection('invoice')}
                    >
                      <CardContent className="p-6 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                        <h4 className="text-lg font-semibold mb-2">Invoice</h4>
                        <p className="text-sm text-gray-600">Payment pending - Send for collection</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNextStep} disabled={!billGenerationData.type}>
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Booking Details and Extra Charges */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {billGenerationData.type === 'bill' 
                        ? 'Enter payment information and any additional charges' 
                        : 'Review booking details and add any extra charges'}
                    </h3>
                  </div>

                  {/* Booking Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Guest</p>
                          <p className="font-semibold">{selectedBooking.guestName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Room</p>
                          <p className="font-semibold">{selectedBooking.room.roomNumber} - {selectedBooking.room.roomType.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Stay Period</p>
                          <p className="font-semibold">{formatDate(selectedBooking.checkIn)} → {formatDate(selectedBooking.checkOut)} ({selectedBooking.nights} nights)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Base Amount</p>
                          <p className="font-semibold">{formatCurrency(selectedBooking.room.roomType.price * selectedBooking.nights)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Extra Charges */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Extra Charges</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleAddBillExtraCharge}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Charge
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {billGenerationData.extraCharges.length > 0 ? (
                        <div className="space-y-4">
                          {billGenerationData.extraCharges.map((charge, index) => {
                            const chargeAmount = charge.amount || 0
                            const gstPercentage = charge.gstPercentage || hotelInfo.gstPercentage || 18
                            const gstAmount = charge.gstApplicable ? (charge.gstAmount || (chargeAmount * gstPercentage / 100)) : 0
                            const finalAmount = chargeAmount + gstAmount
                            
                            return (
                              <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg bg-gray-50">
                                <div className="col-span-3">
                                  <Label>Item Name</Label>
                                  <Input
                                    placeholder="Item name"
                                    value={charge.item}
                                    onChange={(e) => handleUpdateBillExtraCharge(index, 'item', e.target.value)}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Base Amount</Label>
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={charge.amount}
                                    onChange={(e) => handleUpdateBillExtraCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>GST Amount</Label>
                                  <div className="text-sm font-medium text-green-600">
                                    {formatCurrency(gstAmount)}
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <Label>Total Amount</Label>
                                  <div className="text-sm font-bold text-blue-600">
                                    {formatCurrency(finalAmount)}
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <Label>Description</Label>
                                  <Input
                                    placeholder="Description"
                                    value={charge.description}
                                    onChange={(e) => handleUpdateBillExtraCharge(index, 'description', e.target.value)}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={charge.gstApplicable}
                                      onCheckedChange={(checked) => handleUpdateBillExtraCharge(index, 'gstApplicable', checked)}
                                    />
                                    <span className="text-sm">GST</span>
                                  </div>
                                </div>
                                <div className="col-span-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleRemoveBillExtraCharge(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                          
                          {/* Extra Charges Summary */}
                          <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Total Base Amount</Label>
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(billGenerationData.extraCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0))}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Total GST</Label>
                                <div className="text-lg font-semibold text-green-600">
                                  {formatCurrency(billGenerationData.extraCharges.reduce((sum, charge) => {
                                    if (charge.gstApplicable) {
                                      const chargeAmount = charge.amount || 0
                                      const gstAmount = charge.gstAmount || (chargeAmount * (charge.gstPercentage || hotelInfo.gstPercentage || 18)) / 100
                                      return sum + gstAmount
                                    }
                                    return sum
                                  }, 0))}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Total Extra Charges</Label>
                                <div className="text-lg font-bold text-blue-600">
                                  {formatCurrency(billGenerationData.extraCharges.reduce((sum, charge) => {
                                    const chargeAmount = charge.amount || 0
                                    if (charge.gstApplicable) {
                                      const gstAmount = charge.gstAmount || (chargeAmount * (charge.gstPercentage || hotelInfo.gstPercentage || 18)) / 100
                                      return sum + chargeAmount + gstAmount
                                    }
                                    return sum + chargeAmount
                                  }, 0))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No extra charges added</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Information (only for bills) */}
                  {billGenerationData.type === 'bill' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select 
                              value={billGenerationData.paymentMethod} 
                              onValueChange={handlePaymentMethodChange}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="collectedBy">Collected By</Label>
                            <Select 
                              value={billGenerationData.collectedBy} 
                              onValueChange={(value) => setBillGenerationData(prev => ({ ...prev, collectedBy: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff member" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.name}>
                                    {user.name} ({user.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {billGenerationData.paymentMethod !== 'cash' && (
                            <div className="col-span-2">
                              <Label htmlFor="referenceId">Reference ID</Label>
                              <Input
                                placeholder="Transaction/Reference ID"
                                value={billGenerationData.referenceId}
                                onChange={(e) => setBillGenerationData(prev => ({ ...prev, referenceId: e.target.value }))}
                              />
                            </div>
                          )}

                          <div className="col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              placeholder="Additional notes..."
                              value={billGenerationData.notes}
                              onChange={(e) => setBillGenerationData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNextStep} 
                      disabled={billGenerationData.type === 'bill' && (!billGenerationData.collectedBy || !billGenerationData.paymentMethod)}
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review and Generate */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Review and Generate</h3>
                    <p className="text-gray-600">Please review all details before generating the {billGenerationData.type}</p>
                  </div>

                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Base Amount (Room Stay)</span>
                          <span>{formatCurrency(selectedBooking.room.roomType.price * selectedBooking.nights)}</span>
                        </div>
                        
                        {billGenerationData.extraCharges.length > 0 && (
                          <>
                            <div className="border-t pt-2">
                              <p className="font-semibold mb-2">Extra Charges:</p>
                              {billGenerationData.extraCharges.map((charge, index) => {
                                const chargeAmount = charge.amount || 0
                                const gstAmount = charge.gstApplicable ? (charge.gstAmount || (chargeAmount * (charge.gstPercentage || hotelInfo.gstPercentage || 18)) / 100) : 0
                                const finalAmount = chargeAmount + gstAmount
                                
                                return (
                                  <div key={index} className="space-y-1 mb-2 p-2 bg-gray-50 rounded">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium">{charge.item}</span>
                                      <span>{formatCurrency(chargeAmount)}</span>
                                    </div>
                                    {charge.gstApplicable && (
                                      <div className="flex justify-between text-xs text-green-600">
                                        <span>GST ({charge.gstPercentage || hotelInfo.gstPercentage || 18}%)</span>
                                        <span>{formatCurrency(gstAmount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                      <span>Total</span>
                                      <span>{formatCurrency(finalAmount)}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                        
                        <div className="border-t pt-2">
                          {(() => {
                            const breakdown = calculateGSTBreakdown()
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span>{formatCurrency(breakdown.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST on Room ({hotelInfo.gstPercentage || 18}%)</span>
                                  <span>{formatCurrency(breakdown.roomGSTAmount)}</span>
                                </div>
                                {billGenerationData.extraCharges.length > 0 && (
                                  <div className="flex justify-between">
                                    <span>GST on Extra Items ({hotelInfo.gstPercentage || 18}%)</span>
                                    <span>{formatCurrency(breakdown.extraChargesGSTAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-semibold">
                                  <span>Total GST</span>
                                  <span>{formatCurrency(breakdown.gstAmount)}</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                        
                        <div className="border-t pt-2 font-semibold text-lg">
                          {(() => {
                            const breakdown = calculateGSTBreakdown()
                            return (
                              <div className="flex justify-between">
                                <span>Total Amount</span>
                                <span>{formatCurrency(breakdown.total)}</span>
                              </div>
                            )
                          })()}
                        </div>

                        {billGenerationData.type === 'bill' && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="font-semibold text-green-800">Payment Details:</p>
                            <p className="text-sm text-green-700">Method: {billGenerationData.paymentMethod}</p>
                            <p className="text-sm text-green-700">Collected by: {billGenerationData.collectedBy}</p>
                            {billGenerationData.referenceId && (
                              <p className="text-sm text-green-700">Reference: {billGenerationData.referenceId}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button 
                      onClick={generateBillOrInvoice} 
                      disabled={generatingEnhancedInvoice}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {generatingEnhancedInvoice ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate {billGenerationData.type === 'bill' ? 'Bill' : 'Invoice'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Generated Bill/Invoice Display */}
              {currentStep === 4 && generatedBill && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2 text-green-600">
                      {billGenerationData.type === 'bill' ? 'Bill' : 'Invoice'} Generated Successfully!
                    </h3>
                    <p className="text-gray-600">Your {billGenerationData.type === 'bill' ? 'bill' : 'invoice'} has been created and is ready for download or sharing.</p>
                  </div>

                  {/* Detailed GST and Total Calculation Breakdown */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Detailed GST & Total Calculation Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Room Stay Details */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Room Stay Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nights:</span>
                              <span className="font-medium">{generatedBill.nights} nights</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rate/Night:</span>
                              <span className="font-medium">{formatCurrency(selectedBooking?.room.roomType.price || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Base Amount:</span>
                              <span className="font-medium">{formatCurrency((selectedBooking?.room.roomType.price || 0) * generatedBill.nights)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">GST ({hotelInfo.gstPercentage || 18}%):</span>
                              <span className="font-medium text-green-600">{formatCurrency(((selectedBooking?.room.roomType.price || 0) * generatedBill.nights * (hotelInfo.gstPercentage || 18)) / 100)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-medium text-blue-600 font-semibold">{formatCurrency(((selectedBooking?.room.roomType.price || 0) * generatedBill.nights) + (((selectedBooking?.room.roomType.price || 0) * generatedBill.nights * (hotelInfo.gstPercentage || 18)) / 100))}</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <div>Room Type: {generatedBill.roomTypeName}</div>
                            <div>Room Number: {generatedBill.roomNumber}</div>
                            <div>Stay Period: {formatDate(generatedBill.checkIn)} to {formatDate(generatedBill.checkOut)}</div>
                          </div>
                        </div>

                        {/* Extra Services & Charges */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                            Extra Services & Charges
                          </h4>
                          {generatedBill.invoiceItems && generatedBill.invoiceItems.length > 1 ? (
                            <>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 px-2 font-medium text-gray-700">Quantity</th>
                                      <th className="text-left py-2 px-2 font-medium text-gray-700">Unit Price</th>
                                      <th className="text-left py-2 px-2 font-medium text-gray-700">Base Amount</th>
                                      <th className="text-left py-2 px-2 font-medium text-gray-700">GST Amount</th>
                                      <th className="text-left py-2 px-2 font-medium text-gray-700">Total Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {generatedBill.invoiceItems.slice(1).map((item, index) => {
                                      const baseAmount = item.totalPrice;
                                      return (
                                        <tr key={index} className="border-b border-gray-100">
                                          <td className="py-2 px-2">{item.quantity} pcs</td>
                                          <td className="py-2 px-2">{formatCurrency(item.unitPrice)}</td>
                                          <td className="py-2 px-2">{formatCurrency(baseAmount)}</td>
                                          <td className="py-2 px-2 text-green-600">{formatCurrency(item.taxAmount)}</td>
                                          <td className="py-2 px-2 text-blue-600 font-semibold">{formatCurrency(item.finalAmount)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-3 text-xs text-gray-500">
                                {generatedBill.invoiceItems.slice(1).map((item, index) => (
                                  <div key={index}>Item: {item.itemName}</div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <div className="text-sm">No extra services or charges</div>
                            </div>
                          )}
                        </div>

                        {/* GST Calculation Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            GST Calculation Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Room Stay Base Amount:</span>
                              <span className="font-medium">{formatCurrency((selectedBooking?.room.roomType.price || 0) * generatedBill.nights)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Room Stay GST ({hotelInfo.gstPercentage || 18}%):</span>
                              <span className="font-medium text-green-600">{formatCurrency(((selectedBooking?.room.roomType.price || 0) * generatedBill.nights * (hotelInfo.gstPercentage || 18)) / 100)}</span>
                            </div>
                            {generatedBill.invoiceItems && generatedBill.invoiceItems.length > 1 && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Extra Charges Base Amount:</span>
                                  <span className="font-medium">{formatCurrency(generatedBill.invoiceItems.slice(1).reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Extra Charges GST:</span>
                                  <span className="font-medium text-green-600">{formatCurrency(generatedBill.invoiceItems.slice(1).reduce((sum, item) => sum + item.taxAmount, 0))}</span>
                                </div>
                              </>
                            )}
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-semibold">
                                <span className="text-gray-900">Total GST Amount:</span>
                                <span className="text-green-600">{formatCurrency((generatedBill.invoiceItems?.[0]?.taxAmount || 0) + (generatedBill.invoiceItems?.slice(1).reduce((sum, item) => sum + item.taxAmount, 0) || 0))}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Final Total Calculation */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                            Final Total Calculation
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Sub Total (Base Amounts):</span>
                              <span className="font-medium">{formatCurrency((generatedBill.invoiceItems?.[0]?.totalPrice || 0) + (generatedBill.invoiceItems?.slice(1).reduce((sum, item) => sum + item.totalPrice, 0) || 0))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Total GST Amount:</span>
                              <span className="font-medium text-green-600">{formatCurrency((generatedBill.invoiceItems?.[0]?.taxAmount || 0) + (generatedBill.invoiceItems?.slice(1).reduce((sum, item) => sum + item.taxAmount, 0) || 0))}</span>
                            </div>
                            <div className="border-t-2 border-blue-300 pt-2">
                              <div className="flex justify-between text-lg font-bold text-blue-900">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(generatedBill.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                            Invoice Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Invoice Number:</span>
                              <span className="font-medium ml-2">{generatedBill.invoiceNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="font-medium ml-2 capitalize">{generatedBill.status}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Generated Date:</span>
                              <span className="font-medium ml-2">{new Date(generatedBill.issuedDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due Date:</span>
                              <span className="font-medium ml-2">{new Date(generatedBill.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generated Bill/Invoice Preview */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Final Invoice Preview</h4>
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-green-600 mb-2">
                          Bill Generated Successfully!
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Your bill has been created and is ready for download or sharing.
                        </p>
                      </div>
                      
                      {/* Invoice Summary */}
                      <div className="bg-white rounded-lg border p-4 mb-4 text-left">
                        <h4 className="font-semibold text-gray-900 mb-3">Invoice Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Invoice Number:</span>
                            <span className="font-medium ml-2">{generatedBill.invoiceNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium ml-2 capitalize">{generatedBill.status}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Generated Date:</span>
                            <span className="font-medium ml-2">{new Date(generatedBill.issuedDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium ml-2">{new Date(generatedBill.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-bold text-lg ml-2 text-green-600">₹{generatedBill.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button 
                          onClick={() => handleDownloadGeneratedBill(generatedBill)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Bill
                        </Button>
                        <Button 
                          onClick={() => handlePrintGeneratedBill(generatedBill)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Bill
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsMultiStepModalOpen(false)
                            setGeneratedBill(null)
                            setCurrentStep(1)
                          }}
                        >
                          Close
                        </Button>
                        <Button 
                          onClick={() => {
                            // Reset and start over
                            setGeneratedBill(null)
                            setCurrentStep(1)
                            setBillGenerationData({
                              type: 'bill',
                              extraCharges: [],
                              paymentMethod: 'cash',
                              collectedBy: '',
                              referenceId: '',
                              notes: ''
                            })
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Another {billGenerationData.type === 'bill' ? 'Bill' : 'Invoice'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      


      {/* View Booking Bill/Invoice Modal */}
      <Dialog open={isViewBookingModalOpen} onOpenChange={setIsViewBookingModalOpen}>
         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
           
           {viewBookingData && viewInvoiceData && (
             <div className="space-y-6">

               {/* Generated Bill/Invoice Display */}
               <div className="text-center mb-4">
                 <h3 className="text-lg font-semibold mb-2 text-green-600">
                   Generated {viewInvoiceData.status === 'paid' ? 'Bill' : 'Invoice'}
                 </h3>
                 <p className="text-gray-600">Invoice #{viewInvoiceData.invoiceNumber} - {viewInvoiceData.status}</p>
               </div>



               {/* Bill/Invoice Display */}
               <InvoicePDF 
                 invoiceData={{
                   invoiceNumber: viewInvoiceData.invoiceNumber,
                   invoiceDate: viewInvoiceData.issuedDate,
                   dueDate: viewInvoiceData.dueDate,
                   terms: viewInvoiceData.terms,
                   company: {
                     name: hotelInfo.name,
                     address: hotelInfo.address ? hotelInfo.address.split('\n') : [
                       'Hotel Address Line 1',
                       'Hotel Address Line 2',
                       'City, State ZIP',
                       'Country'
                     ],
                     logo: hotelInfo.logo || undefined,
                     contact: hotelInfo.primaryPhone || undefined
                   },
                   billTo: {
                     name: viewBookingData.guestName,
                     address: [
                       viewBookingData.guestEmail,
                       viewBookingData.guestPhone,
                       `Room: ${viewBookingData.room.roomNumber}`,
                       `${viewBookingData.room.roomType.name}`
                     ]
                   },
                   shipTo: {
                     address: [
                       viewBookingData.guestEmail,
                       viewBookingData.guestPhone,
                       `Room: ${viewBookingData.room.roomNumber}`,
                       `${viewBookingData.room.roomType.name}`
                     ]
                   },
                   items: viewInvoiceData.invoiceItems?.map((item, index) => ({
                     id: index + 1,
                     name: item.itemName,
                     description: item.description || '',
                     quantity: item.quantity,
                     unit: 'pcs',
                     rate: item.unitPrice,
                     amount: item.finalAmount
                   })) || [],
                   subtotal: viewInvoiceData.baseAmount,
                   taxRate: viewInvoiceData.gstAmount / viewInvoiceData.baseAmount * 100,
                   total: viewInvoiceData.totalAmount,
                   currency: 'INR',
                   paymentInfo: viewInvoiceData.payments?.[0] ? {
                     method: viewInvoiceData.payments[0].paymentMethod,
                     referenceId: viewInvoiceData.payments[0].paymentReference || undefined,
                     collectedBy: viewInvoiceData.payments[0].receivedBy || 'Staff',
                     status: viewInvoiceData.payments[0].status
                   } : undefined
                 }}
                 filename={`${viewInvoiceData.status === 'paid' ? 'bill' : 'invoice'}-${viewInvoiceData.invoiceNumber}.pdf`}
               >
                 <Invoice data={{
                   invoiceNumber: viewInvoiceData.invoiceNumber,
                   invoiceDate: viewInvoiceData.issuedDate,
                   dueDate: viewInvoiceData.dueDate,
                   terms: viewInvoiceData.terms,
                   company: {
                     name: hotelInfo.name,
                     address: hotelInfo.address ? hotelInfo.address.split('\n') : [
                       'Hotel Address Line 1',
                       'Hotel Address Line 2',
                       'City, State ZIP',
                       'Country'
                     ],
                     logo: hotelInfo.logo || undefined,
                     contact: hotelInfo.primaryPhone || undefined
                   },
                   billTo: {
                     name: viewBookingData.guestName,
                     address: [
                       viewBookingData.guestEmail,
                       viewBookingData.guestPhone,
                       `Room: ${viewBookingData.room.roomNumber}`,
                       `${viewBookingData.room.roomType.name}`
                     ]
                   },
                   shipTo: {
                     address: [
                       viewBookingData.guestEmail,
                       viewBookingData.guestPhone,
                       `Room: ${viewBookingData.room.roomNumber}`,
                       `${viewBookingData.room.roomType.name}`
                     ]
                   },
                   items: viewInvoiceData.invoiceItems?.map((item, index) => ({
                     id: index + 1,
                     name: item.itemName,
                     description: item.description || '',
                     quantity: item.quantity,
                     unit: 'pcs',
                     rate: item.unitPrice,
                     amount: item.finalAmount
                   })) || [],
                   subtotal: viewInvoiceData.baseAmount,
                   taxRate: viewInvoiceData.gstAmount / viewInvoiceData.baseAmount * 100,
                   total: viewInvoiceData.totalAmount,
                   currency: 'INR',
                   paymentInfo: viewInvoiceData.payments?.[0] ? {
                     method: viewInvoiceData.payments[0].paymentMethod,
                     referenceId: viewInvoiceData.payments[0].paymentReference || undefined,
                     collectedBy: viewInvoiceData.payments[0].receivedBy || 'Staff',
                     status: viewInvoiceData.payments[0].status
                   } : undefined,
                   breakdown: {
                     roomDetails: {
                       roomType: viewInvoiceData.roomTypeName,
                       roomNumber: viewInvoiceData.roomNumber,
                       nights: viewInvoiceData.nights,
                       ratePerNight: viewInvoiceData.baseAmount / viewInvoiceData.nights,
                       baseAmount: viewInvoiceData.baseAmount,
                       gstAmount: viewInvoiceData.gstAmount,
                       gstPercentage: hotelInfo.gstPercentage || 18,
                       checkIn: viewInvoiceData.checkIn,
                       checkOut: viewInvoiceData.checkOut
                     },
                     extraCharges: {
                       items: viewInvoiceData.invoiceItems && viewInvoiceData.invoiceItems.length > 1 
                         ? viewInvoiceData.invoiceItems.slice(1).map(item => ({
                             name: item.itemName,
                             description: item.description || '',
                             quantity: item.quantity,
                             unitPrice: item.unitPrice,
                             taxAmount: item.taxAmount,
                             finalAmount: item.finalAmount
                           }))
                         : [],
                       totalExtraCharges: viewInvoiceData.invoiceItems && viewInvoiceData.invoiceItems.length > 1
                         ? viewInvoiceData.invoiceItems.slice(1).reduce((sum, item) => sum + item.finalAmount, 0)
                         : 0
                     }
                   }
                 }} />
               </InvoicePDF>

               <div className="flex justify-center space-x-4">
                 <Button 
                   variant="outline" 
                   onClick={() => setIsViewBookingModalOpen(false)}
                 >
                   Close
                 </Button>
                 <Button 
                   onClick={() => {
                     setIsViewBookingModalOpen(false)
                     setSelectedBooking(viewBookingData)
                     setIsMultiStepModalOpen(true)
                   }}
                   className="bg-blue-600 hover:bg-blue-700"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Generate New Bill/Invoice
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>


       {/* Delete Confirmation Modal */}
       <DeleteConfirmationModal
         isOpen={deleteConfirmation.isOpen}
         onClose={deleteConfirmation.onClose}
         onConfirm={deleteConfirmation.onConfirm}
         title={deleteConfirmation.title}
         description={deleteConfirmation.description}
         itemName={deleteConfirmation.itemName}
         isLoading={deleteConfirmation.isLoading}
         variant={deleteConfirmation.variant}
       />

     </div>
   )
 }

