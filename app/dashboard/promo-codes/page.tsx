"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Edit, Trash2, Search, Filter, Copy, Loader } from 'lucide-react'
import { toast } from 'sonner'

interface PromoCode {
  id: string
  code: string
  title: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  validFrom: string
  validUntil: string
  applicableRooms?: string[]
  createdAt: string
  _count: {
    bookings: number
  }
}

interface RoomType {
  id: string
  name: string
  slug: string
}

type DiscountType = 'percentage' | 'fixed'

interface PromoFormData {
  code: string
  title: string
  description: string
  discountType: DiscountType
  discountValue: string
  minOrderAmount: string
  maxDiscountAmount: string
  usageLimit: string
  isActive: boolean
  validFrom: Date
  validUntil: Date
  applicableRooms: string[]
}

interface PromoFormProps {
  formData: PromoFormData
  setFormData: React.Dispatch<React.SetStateAction<PromoFormData>>
  roomTypes: RoomType[]
  isEdit?: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitting?: boolean
}

function PromoForm({
  formData,
  setFormData,
  roomTypes,
  isEdit = false,
  onSubmit,
  onCancel,
  submitting = false,
}: PromoFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="code" className="text-[10px] sm:text-sm">Promo Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="SAVE20"
            required
            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="title" className="text-[10px] sm:text-sm">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Save 20% on all rooms"
            required
            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-[10px] sm:text-sm">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description for the promo code"
          rows={2}
          className="text-xs sm:text-sm rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="discountType" className="text-[10px] sm:text-sm">Discount Type *</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value as DiscountType }))}
          >
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="discountValue" className="text-[10px] sm:text-sm">
            Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
          </Label>
          <Input
            id="discountValue"
            type="number"
            step="0.01"
            min="0"
            max={formData.discountType === 'percentage' ? '100' : undefined}
            value={formData.discountValue}
            onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
            placeholder={formData.discountType === 'percentage' ? '20' : '500'}
            required
            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="minOrderAmount" className="text-[10px] sm:text-sm">Minimum Order Amount (₹)</Label>
          <Input
            id="minOrderAmount"
            type="number"
            min="0"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
            placeholder="1000"
            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="maxDiscountAmount" className="text-[10px] sm:text-sm">Maximum Discount Amount (₹)</Label>
          <Input
            id="maxDiscountAmount"
            type="number"
            min="0"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
            placeholder="500"
            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="usageLimit" className="text-[10px] sm:text-sm">Usage Limit</Label>
        <Input
          id="usageLimit"
          type="number"
          min="1"
          value={formData.usageLimit}
          onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
          placeholder="100"
          className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label className="text-[10px] sm:text-sm">Valid From *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-8 sm:h-9 text-xs sm:text-sm rounded-md',
                  !formData.validFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {formData.validFrom ? format(formData.validFrom, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.validFrom}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, validFrom: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="text-[10px] sm:text-sm">Valid Until *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-8 sm:h-9 text-xs sm:text-sm rounded-md',
                  !formData.validUntil && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {formData.validUntil ? format(formData.validUntil, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.validUntil}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, validUntil: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label className="text-[10px] sm:text-sm">Applicable Rooms</Label>
        <Select
          value={formData.applicableRooms.includes('all') ? 'all' : formData.applicableRooms[0] || ''}
          onValueChange={(value) => {
            if (value === 'all') {
              setFormData(prev => ({ ...prev, applicableRooms: ['all'] }))
            } else {
              setFormData(prev => ({ ...prev, applicableRooms: [value] }))
            }
          }}
        >
          <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
            <SelectValue placeholder="Select applicable rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Room Types</SelectItem>
            {roomTypes.length > 0 ? (
              roomTypes.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                No room types available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {roomTypes.length === 0 && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            No room types found. Please create room types first.
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive" className="text-[10px] sm:text-sm">Active</Label>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-8 sm:h-9 text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="h-8 sm:h-9 text-xs sm:text-sm">
          {submitting ? (
            <>
              <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            `${isEdit ? 'Update' : 'Create'} Promo Code`
          )}
        </Button>
      </div>
    </form>
  )
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicableRooms: [] as string[]
  })

  const fetchPromoCodes = useCallback(async (search?: string, filter?: string) => {
    try {
      const params = new URLSearchParams()
      const searchValue = search !== undefined ? search : searchTerm
      const filterValue = filter !== undefined ? filter : statusFilter
      
      if (searchValue) params.append('search', searchValue)
      if (filterValue !== 'all') params.append('status', filterValue)
      
      const response = await fetch(`/api/promo-codes?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setPromoCodes(data.data)
      } else {
        toast.error('Failed to fetch promo codes')
      }
    } catch (error) {
      toast.error('Error fetching promo codes')
    } finally {
      setLoading(false)
    }
  }, []) // Remove dependencies to prevent recreation

  const fetchRoomTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/room-types')
      const data = await response.json()
      
      if (data.success) {
        setRoomTypes(data.data)
      } else {
        console.error('Failed to fetch room types:', data.error)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }, [])

  // Initial data fetch only
  useEffect(() => {
    fetchPromoCodes(searchTerm, statusFilter)
    fetchRoomTypes()
  }, [fetchPromoCodes, fetchRoomTypes]) // Add back dependencies since functions are now stable

  // Separate effect for search and filter changes with debouncing
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        fetchPromoCodes(searchTerm, statusFilter)
      }, 300) // Debounce search/filter changes

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, statusFilter, loading, fetchPromoCodes]) // Add fetchPromoCodes back but it's now stable

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applicableRooms: []
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSubmitting(true)
    
    // Client-side validation to avoid 400s
    const cleanedCode = formData.code.trim().toUpperCase()
    const cleanedTitle = formData.title.trim()
    const numericDiscount = parseFloat(formData.discountValue)
    const minAmount = formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null
    const maxAmount = formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null
    const limit = formData.usageLimit ? parseInt(formData.usageLimit) : null

    if (!cleanedCode || !cleanedTitle) {
      toast.error('Code and Title are required')
      return
    }
    if (Number.isNaN(numericDiscount) || numericDiscount <= 0) {
      toast.error('Enter a valid discount value')
      return
    }
    if (formData.discountType === 'percentage' && (numericDiscount <= 0 || numericDiscount > 100)) {
      toast.error('Percentage discount must be between 1 and 100')
      return
    }
    if (!(formData.validFrom instanceof Date) || !(formData.validUntil instanceof Date)) {
      toast.error('Please select valid dates')
      return
    }
    if (formData.validFrom >= formData.validUntil) {
      toast.error('Valid until must be after valid from')
      return
    }

    const payload = {
      ...formData,
      code: cleanedCode,
      title: cleanedTitle,
      discountValue: numericDiscount,
      minOrderAmount: minAmount,
      maxDiscountAmount: maxAmount,
      usageLimit: limit,
      applicableRooms: formData.applicableRooms.length > 0 ? formData.applicableRooms : null
    }

    try {
      const url = editingPromo ? `/api/promo-codes/${editingPromo.id}` : '/api/promo-codes'
      const method = editingPromo ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchPromoCodes()
        setCreateDialogOpen(false)
        setEditDialogOpen(false)
        resetForm()
        setEditingPromo(null)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Error saving promo code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      title: promo.title,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      minOrderAmount: promo.minOrderAmount?.toString() || '',
      maxDiscountAmount: promo.maxDiscountAmount?.toString() || '',
      usageLimit: promo.usageLimit?.toString() || '',
      isActive: promo.isActive,
      validFrom: new Date(promo.validFrom),
      validUntil: new Date(promo.validUntil),
      applicableRooms: promo.applicableRooms || []
    })
    setEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch(`/api/promo-codes/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchPromoCodes()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Error deleting promo code')
    } finally {
      setDeleting(null)
    }
  }

  const toggleStatus = async (promo: PromoCode) => {
    setToggling(promo.id)
    try {
      const response = await fetch(`/api/promo-codes/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Promo code ${promo.isActive ? 'deactivated' : 'activated'}`)
        fetchPromoCodes()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Error updating promo code status')
    } finally {
      setToggling(null)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Promo code copied to clipboard')
  }

  const getStatusBadge = (promo: PromoCode) => {
    if (!promo.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    const now = new Date()
    const validFrom = new Date(promo.validFrom)
    const validUntil = new Date(promo.validUntil)
    
    if (now < validFrom) {
      return <Badge variant="outline">Upcoming</Badge>
    } else if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-3xl font-bold">Promo Codes & Offers</h1>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Manage promotional codes and special offers</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }} className="h-8 w-8 sm:h-auto sm:w-auto sm:px-3 flex items-center justify-center">
                <Plus className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 text-gray-600" />
                <span className="hidden sm:inline text-gray-600">Create Promo Code</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader className="mb-3 sm:mb-6">
                <DialogTitle className="text-base sm:text-xl">Create New Promo Code</DialogTitle>
                <DialogDescription className="text-[10px] sm:text-sm">
                  Fill in the details to create a new promotional code.
                </DialogDescription>
              </DialogHeader>
              <PromoForm
                formData={formData}
                setFormData={setFormData}
                roomTypes={roomTypes}
                isEdit={false}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setCreateDialogOpen(false)
                  resetForm()
                }}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-sm sm:text-base">Promo Codes</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Manage all your promotional codes and special offers
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promo codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-6 sm:pl-8 w-full sm:w-64 h-8 sm:h-9 text-[10px] sm:text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 sm:h-9 min-w-[120px] sm:w-32 text-[10px] sm:text-sm">
                  <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Code</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Title</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Discount</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Usage</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Valid Period</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold py-3 sm:py-4 px-3 sm:px-4 text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 sm:py-12">
                    <div className="flex items-center justify-center">
                      <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 sm:py-8">
                    <p className="text-[10px] sm:text-sm text-muted-foreground">No promo codes found</p>
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm font-mono border">
                          {promo.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(promo.code)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                          title="Copy code"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{promo.title}</p>
                        {promo.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-32 sm:max-w-48">
                            {promo.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium">
                          {promo.discountType === 'percentage' 
                            ? `${promo.discountValue}%` 
                            : `₹${promo.discountValue}`
                          }
                        </p>
                        {promo.maxDiscountAmount && (
                          <p className="text-xs text-muted-foreground">
                            Max: ₹{promo.maxDiscountAmount}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium">{promo._count.bookings} used</p>
                        {promo.usageLimit && (
                          <p className="text-muted-foreground">
                            / {promo.usageLimit} limit
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm">
                        <p>{format(new Date(promo.validFrom), 'MMM dd, yyyy')}</p>
                        <p className="text-muted-foreground">
                          to {format(new Date(promo.validUntil), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-3 py-3 sm:py-4">
                      {getStatusBadge(promo)}
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                          disabled={toggling === promo.id || deleting === promo.id}
                          className="h-8 w-8 p-0 hover:bg-gray-200"
                          title="Edit promo code"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(promo)}
                          disabled={toggling === promo.id || deleting === promo.id}
                          className={`h-8 w-8 p-0 hover:bg-gray-200 ${promo.isActive ? 'text-orange-600' : 'text-green-600'}`}
                          title={promo.isActive ? 'Deactivate promo code' : 'Activate promo code'}
                        >
                          {toggling === promo.id ? (
                            <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <span className="text-xs">{promo.isActive ? 'Deactivate' : 'Activate'}</span>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                              disabled={toggling === promo.id || deleting === promo.id}
                              title="Delete promo code"
                            >
                              {deleting === promo.id ? (
                                <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the promo code "{promo.code}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(promo.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update the details of the promotional code.
            </DialogDescription>
          </DialogHeader>
          <PromoForm
            formData={formData}
            setFormData={setFormData}
            roomTypes={roomTypes}
            isEdit
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditDialogOpen(false)
              setEditingPromo(null)
              resetForm()
            }}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
