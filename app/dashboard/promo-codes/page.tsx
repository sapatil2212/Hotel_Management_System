"use client"

import { useState, useEffect } from 'react'
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
import { CalendarIcon, Plus, Edit, Trash2, Search, Filter, Eye, Copy } from 'lucide-react'
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

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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
    validUntil: new Date(),
    applicableRooms: [] as string[]
  })

  const fetchPromoCodes = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
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
  }

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/room-types')
      const data = await response.json()
      
      if (data.success) {
        setRoomTypes(data.data)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  useEffect(() => {
    fetchPromoCodes()
    fetchRoomTypes()
  }, [searchTerm, statusFilter])

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
      validUntil: new Date(),
      applicableRooms: []
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
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
    }
  }

  const toggleStatus = async (promo: PromoCode) => {
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

  const PromoForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value as 'percentage' | 'fixed' }))}
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
                  "w-full justify-start text-left font-normal",
                  !formData.validFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.validFrom ? format(formData.validFrom, "PPP") : "Pick a date"}
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
                  "w-full justify-start text-left font-normal",
                  !formData.validUntil && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.validUntil ? format(formData.validUntil, "PPP") : "Pick a date"}
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
            {roomTypes.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          onClick={() => {
            if (isEdit) {
              setEditDialogOpen(false)
              setEditingPromo(null)
            } else {
              setCreateDialogOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update' : 'Create'} Promo Code
        </Button>
      </div>
    </form>
  )

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
            <PromoForm />
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
              {promoCodes.length === 0 ? (
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(promo)}
                          className={promo.isActive ? 'text-orange-600' : 'text-green-600'}
                        >
                          {promo.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
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
          <PromoForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  )
}
