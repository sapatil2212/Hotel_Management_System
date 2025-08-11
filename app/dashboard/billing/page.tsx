"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  Receipt,
  TrendingUp,
  TrendingDown,
  FileText
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  guestName: string
  guestEmail: string
  totalAmount: number
  status: string
  createdAt: string
  checkIn: string
  checkOut: string
  room: {
    roomType: {
      name: string
      price: number
    }
  }
  promoCode?: {
    code: string
  }
  originalAmount?: number
  discountAmount?: number
}

interface BillingStats {
  totalInvoices: number
  totalRevenue: number
  pendingPayments: number
  thisMonthRevenue: number
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<BillingStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    thisMonthRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const bookings = await response.json()
        setInvoices(bookings)
        
        // Calculate stats
        const totalRevenue = bookings.reduce((sum: number, booking: Invoice) => sum + booking.totalAmount, 0)
        const pendingPayments = bookings.filter((booking: Invoice) => booking.status === 'pending').length
        const thisMonth = new Date().getMonth()
        const thisMonthRevenue = bookings
          .filter((booking: Invoice) => new Date(booking.createdAt).getMonth() === thisMonth)
          .reduce((sum: number, booking: Invoice) => sum + booking.totalAmount, 0)

        setStats({
          totalInvoices: bookings.length,
          totalRevenue,
          pendingPayments,
          thisMonthRevenue
        })
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/bookings/${invoiceId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Invoice downloaded successfully"
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Paid', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">
            Manage all invoices and billing information
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            View and manage all booking invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by guest name, email, or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No invoices found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.guestName}</div>
                          <div className="text-sm text-muted-foreground">{invoice.guestEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.room.roomType.name}</TableCell>
                      <TableCell>{formatDate(invoice.checkIn)}</TableCell>
                      <TableCell>{formatDate(invoice.checkOut)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                        {invoice.discountAmount && invoice.discountAmount > 0 && (
                          <div className="text-sm text-green-600">
                            -{formatCurrency(invoice.discountAmount)}
                            {invoice.promoCode && ` (${invoice.promoCode.code})`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
