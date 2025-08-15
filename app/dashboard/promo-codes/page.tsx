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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Promo Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="SAVE20"
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Save 20% on all rooms"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description for the promo code"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountType">Discount Type *</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value as DiscountType }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="discountValue">
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
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
          <Input
            id="minOrderAmount"
            type="number"
            min="0"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
            placeholder="1000"
          />
        </div>
        <div>
          <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (₹)</Label>
          <Input
            id="maxDiscountAmount"
            type="number"
            min="0"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
            placeholder="500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="usageLimit">Usage Limit</Label>
        <Input
          id="usageLimit"
          type="number"
          min="1"
          value={formData.usageLimit}
          onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
          placeholder="100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Valid From *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.validFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
          <Label>Valid Until *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.validUntil && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
        <Label>Applicable Rooms</Label>
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
          <SelectTrigger>
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
          <p className="text-sm text-muted-foreground mt-1">
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
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Codes & Offers</h1>
          <p className="text-muted-foreground">Manage promotional codes and special offers</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
              <DialogDescription>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promo Codes</CardTitle>
              <CardDescription>
                Manage all your promotional codes and special offers
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promo codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <Loader className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No promo codes found
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {promo.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(promo.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{promo.title}</p>
                        {promo.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-48">
                            {promo.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discountType === 'percentage' 
                        ? `${promo.discountValue}%` 
                        : `₹${promo.discountValue}`
                      }
                      {promo.maxDiscountAmount && (
                        <p className="text-xs text-muted-foreground">
                          Max: ₹{promo.maxDiscountAmount}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{promo._count.bookings} used</p>
                        {promo.usageLimit && (
                          <p className="text-muted-foreground">
                            / {promo.usageLimit} limit
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(promo.validFrom), 'MMM dd, yyyy')}</p>
                        <p className="text-muted-foreground">
                          to {format(new Date(promo.validUntil), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promo)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                          disabled={toggling === promo.id || deleting === promo.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(promo)}
                          disabled={toggling === promo.id || deleting === promo.id}
                          className={promo.isActive ? 'text-orange-600' : 'text-green-600'}
                        >
                          {toggling === promo.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            promo.isActive ? 'Deactivate' : 'Activate'
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              disabled={toggling === promo.id || deleting === promo.id}
                            >
                              {deleting === promo.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
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
