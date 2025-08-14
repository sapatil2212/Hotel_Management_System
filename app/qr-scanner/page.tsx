"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Search, Download, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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
  roomTypeName: string
  roomNumber: string
  totalAmount: number
  status: string
  issuedDate: string
  qrCode?: string
}

export default function QRScannerPage() {
  const [scannedCode, setScannedCode] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async () => {
    if (!scannedCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR code or invoice number",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      // Extract invoice number from QR code or use the scanned code directly
      const invoiceNumber = scannedCode.includes('INV-') ? scannedCode : `INV-${scannedCode}`
      
      const response = await fetch(`/api/invoices/search?number=${invoiceNumber}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        toast({
          title: "Success",
          description: "Invoice found successfully",
        })
      } else {
        setInvoice(null)
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      toast({
        title: "Error",
        description: "Failed to scan QR code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!invoice) return
    
    // TODO: Implement actual PDF download
    toast({
      title: "Info",
      description: "Download functionality will be implemented soon",
    })
  }

  const handleEmail = () => {
    if (!invoice) return
    
    // TODO: Implement email sending
    toast({
      title: "Info",
      description: "Email functionality will be implemented soon",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
          <p className="text-gray-600">Scan QR codes to view and download bills/invoices</p>
        </div>

        {/* Scanner Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code or Enter Invoice Number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qrCode">QR Code / Invoice Number</Label>
              <div className="flex gap-2">
                <Input
                  id="qrCode"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="Enter QR code or invoice number (e.g., INV-1234567890)"
                  className="flex-1"
                />
                <Button onClick={handleScan} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        {invoice && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Details</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleEmail}>
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Invoice Number</Label>
                  <p className="text-sm text-gray-900">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Booking ID</Label>
                  <p className="text-sm text-gray-900">{invoice.bookingId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Guest Name</Label>
                  <p className="text-sm text-gray-900">{invoice.guestName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <p className="text-sm text-gray-900">{invoice.guestPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Room</Label>
                  <p className="text-sm text-gray-900">{invoice.roomNumber} - {invoice.roomTypeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Stay Period</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(invoice.checkIn).toLocaleDateString()} → {new Date(invoice.checkOut).toLocaleDateString()} ({invoice.nights} nights)
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{invoice.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <p className="text-sm text-gray-900">{invoice.status.toUpperCase()}</p>
                </div>
              </div>
              
              {invoice.qrCode && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-700">QR Code</Label>
                  <div className="mt-2">
                    <img 
                      src={invoice.qrCode} 
                      alt="QR Code"
                      className="w-32 h-32 border rounded"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Scan the QR code from any bill or invoice</li>
              <li>• Or manually enter the invoice number</li>
              <li>• View the complete invoice details</li>
              <li>• Download or email the invoice as needed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
