"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Users, Bed, Bath, Square, IndianRupee } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/ui/image-upload"
import Image from "next/image"
import { toast } from "sonner"

// Mock data - replace with actual API calls
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Super Deluxe Room",
    slug: "super-deluxe-room",
    price: 4500,
    originalPrice: 5000,
    size: "180 sq.ft (17 sq.mt)",
    bedType: "2 Single Beds",
    bathroomCount: 1,
    maxGuests: 3,
    totalRooms: 5,
    available: true,
    isPromoted: true,
    discountPercent: 10,
    images: ["https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg"],
    shortDescription: "Elegant room with modern amenities and city view",
    description: "Experience the perfect blend of comfort and luxury in our Super Deluxe Room. This elegantly appointed accommodation features modern amenities, sophisticated décor, and stunning city views.",
    highlights: "• Panoramic city views from floor-to-ceiling windows\n• Premium Egyptian cotton bedding\n• Marble bathroom with rainfall shower\n• Complimentary high-speed WiFi",
    amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV", "Safe"],
    features: ["City View", "Non-Smoking", "Soundproof"]
  },
  {
    id: "2",
    name: "Presidential Suite",
    slug: "presidential-suite",
    price: 12000,
    originalPrice: 15000,
    size: "500 sq.ft (46 sq.mt)",
    bedType: "1 King Bed",
    bathroomCount: 2,
    maxGuests: 4,
    totalRooms: 2,
    available: true,
    isPromoted: false,
    discountPercent: 20,
    images: ["https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg"],
    shortDescription: "Luxurious suite with separate living area and premium amenities",
    description: "Experience unparalleled luxury in our Presidential Suite. This spacious accommodation features a separate living and dining area, premium amenities, and breathtaking panoramic views.",
    highlights: "• Separate living and dining area\n• Premium amenities and butler service\n• Panoramic views\n• Marble bathroom with jacuzzi",
    amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV", "Safe", "Jacuzzi", "Butler Service"],
    features: ["Ocean View", "Non-Smoking", "Soundproof", "Balcony"]
  }
]

interface Room {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  size: string
  bedType: string
  bathroomCount: number
  maxGuests: number
  totalRooms: number
  available: boolean
  isPromoted: boolean
  discountPercent?: number | null
  images: string[]
  shortDescription: string
  description: string
  highlights?: string
  amenities: string[]
  features: string[]
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    size: "",
    bedType: "",
    bathroomCount: "1",
    maxGuests: "2",
    totalRooms: "1",
    shortDescription: "",
    description: "",
    highlights: "",
    amenities: [] as string[],
    features: [] as string[],
    available: true,
    isPromoted: false,
    discountPercent: "",
    images: [] as string[]
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      } else {
        console.error('Failed to fetch rooms')
        // Fallback to mock data if API fails
        setRooms(mockRooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      // Fallback to mock data if API fails
      setRooms(mockRooms)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const roomData = {
        name: formData.name,
        price: parseInt(formData.price),
        originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
        size: formData.size,
        bedType: formData.bedType,
        bathroomCount: parseInt(formData.bathroomCount),
        maxGuests: parseInt(formData.maxGuests),
        totalRooms: parseInt(formData.totalRooms),
        shortDescription: formData.shortDescription,
        description: formData.description,
        highlights: formData.highlights,
        available: formData.available,
        isPromoted: formData.isPromoted,
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : null,
        images: formData.images,
        amenities: formData.amenities || [],
        features: formData.features || [],
        cancellationFree: true,
        instantBooking: true
      }

      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms'
      const method = editingRoom ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      })

      if (response.ok) {
        // Refresh the rooms list
        fetchRooms()
        setIsDialogOpen(false)
        resetForm()
        toast.success(editingRoom ? 'Room updated successfully!' : 'Room created successfully!')
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving room:', error)
      toast.error('Failed to save room. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      size: "",
      bedType: "",
      bathroomCount: "1",
      maxGuests: "2",
      totalRooms: "1",
      shortDescription: "",
      description: "",
      highlights: "",
      amenities: [] as string[],
      features: [] as string[],
      available: true,
      isPromoted: false,
      discountPercent: "",
      images: [] as string[]
    })
    setEditingRoom(null)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      price: room.price.toString(),
      originalPrice: room.originalPrice?.toString() || "",
      size: room.size,
      bedType: room.bedType,
      bathroomCount: room.bathroomCount.toString(),
      maxGuests: room.maxGuests.toString(),
      totalRooms: room.totalRooms.toString(),
      shortDescription: room.shortDescription,
      description: room.description,
      highlights: room.highlights || "",
      amenities: room.amenities || [],
      features: room.features || [],
      available: room.available,
      isPromoted: room.isPromoted,
      discountPercent: room.discountPercent?.toString() || "",
      images: room.images
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (roomId: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(`/api/rooms/${roomId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Refresh the rooms list
          fetchRooms()
          toast.success('Room deleted successfully!')
        } else {
          const errorData = await response.json()
          toast.error(`Error: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Error deleting room:', error)
        toast.error('Failed to delete room. Please try again.')
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">Manage your hotel room types and inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Room Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room Type"}</DialogTitle>
              <DialogDescription>
                {editingRoom ? "Update room information" : "Create a new room type for your hotel"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Super Deluxe Room"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price per Night (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="4500"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="size">Room Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    placeholder="180 sq.ft (17 sq.mt)"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedType">Bed Configuration</Label>
                  <Select value={formData.bedType} onValueChange={(value) => setFormData({...formData, bedType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 King Bed">1 King Bed</SelectItem>
                      <SelectItem value="1 Queen Bed">1 Queen Bed</SelectItem>
                      <SelectItem value="2 Single Beds">2 Single Beds</SelectItem>
                      <SelectItem value="1 Double Bed">1 Double Bed</SelectItem>
                      <SelectItem value="2 Double Beds">2 Double Beds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bathroomCount">Bathrooms</Label>
                  <Select value={formData.bathroomCount} onValueChange={(value) => setFormData({...formData, bathroomCount: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="3">3 Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Select value={formData.maxGuests} onValueChange={(value) => setFormData({...formData, maxGuests: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4 Guests</SelectItem>
                      <SelectItem value="5">5 Guests</SelectItem>
                      <SelectItem value="6">6 Guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="totalRooms">Total Rooms Available</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    value={formData.totalRooms}
                    onChange={(e) => setFormData({...formData, totalRooms: e.target.value})}
                    min="1"
                    required
                  />
                </div>
                
                <div>
                                     <Label htmlFor="discountPercent">Discount Percentage</Label>
                   <Input
                     id="discountPercent"
                     type="number"
                     value={formData.discountPercent}
                     onChange={(e) => setFormData({...formData, discountPercent: e.target.value})}
                     placeholder="No discount"
                     min="0"
                     max="100"
                   />
                   <p className="text-sm text-muted-foreground mt-1">Leave empty for no discount</p>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                    placeholder="Brief description of the room"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed room description for the room details page"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="highlights">Key Features/Highlights</Label>
                  <Textarea
                    id="highlights"
                    value={formData.highlights || ''}
                    onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                    placeholder="• Premium Egyptian cotton bedding&#10;• Panoramic city views&#10;• Marble bathroom with rainfall shower&#10;• Complimentary high-speed WiFi"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use bullet points (•) to highlight key room features
                  </p>
                </div>
                
                {/* Room Amenities Section */}
                <div className="md:col-span-2">
                  <Label>Room Amenities</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity (e.g., Free WiFi, Air Conditioning)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value && !formData.amenities?.includes(value)) {
                              setFormData({
                                ...formData,
                                amenities: [...(formData.amenities || []), value]
                              })
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input')
                          if (input) {
                            const value = input.value.trim()
                            if (value && !formData.amenities?.includes(value)) {
                              setFormData({
                                ...formData,
                                amenities: [...(formData.amenities || []), value]
                              })
                              input.value = ''
                            }
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Quick Add Common Amenities */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Quick add common amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV", "Safe", "Hair Dryer", "Coffee/Tea Maker", "Telephone", "Daily Housekeeping"].map((amenity) => (
                          <Button
                            key={amenity}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              if (!formData.amenities?.includes(amenity)) {
                                setFormData({
                                  ...formData,
                                  amenities: [...(formData.amenities || []), amenity]
                                })
                              }
                            }}
                            disabled={formData.amenities?.includes(amenity)}
                          >
                            + {amenity}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {formData.amenities?.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {amenity}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                amenities: (formData.amenities || []).filter((_, i) => i !== index)
                              })
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Room Features Section */}
                <div className="md:col-span-2">
                  <Label>Room Features</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add feature (e.g., City View, Non-Smoking, Balcony)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value && !formData.features?.includes(value)) {
                              setFormData({
                                ...formData,
                                features: [...(formData.features || []), value]
                              })
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input')
                          if (input) {
                            const value = input.value.trim()
                            if (value && !formData.features?.includes(value)) {
                              setFormData({
                                ...formData,
                                features: [...(formData.features || []), value]
                              })
                              input.value = ''
                            }
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Quick Add Common Features */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Quick add common features:</p>
                      <div className="flex flex-wrap gap-1">
                        {["City View", "Ocean View", "Mountain View", "Non-Smoking", "Soundproof", "Balcony", "Modern Décor", "Premium Bedding", "Work Desk", "Sitting Area"].map((feature) => (
                          <Button
                            key={feature}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              if (!formData.features?.includes(feature)) {
                                setFormData({
                                  ...formData,
                                  features: [...(formData.features || []), feature]
                                })
                              }
                            }}
                            disabled={formData.features?.includes(feature)}
                          >
                            + {feature}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {formData.features?.map((feature, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {feature}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                features: (formData.features || []).filter((_, i) => i !== index)
                              })
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                    <Label>Room Images</Label>
                    <ImageUpload
                      value={formData.images}
                      onChange={(images) => setFormData({...formData, images})}
                      maxImages={6}
                    />
                  </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({...formData, available: checked as boolean})}
                  />
                  <Label htmlFor="available">Available for booking</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPromoted"
                    checked={formData.isPromoted}
                    onCheckedChange={(checked) => setFormData({...formData, isPromoted: checked as boolean})}
                  />
                  <Label htmlFor="isPromoted">Promoted room</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : (editingRoom ? "Update Room" : "Create Room")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Room Types</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((sum, room) => sum + room.totalRooms, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Types</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(room => room.available).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-12 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-gray-200 animate-pulse rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <div className="text-4xl mb-2">🏨</div>
                      <div className="text-lg font-medium">No rooms found</div>
                      <div className="text-sm">Start by adding your first room type</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-16 rounded overflow-hidden">
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {room.shortDescription}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{formatPrice(room.price)}</span>
                      {room.originalPrice && room.originalPrice > room.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(room.originalPrice)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        {room.size}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {room.bedType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {room.bathroomCount} Bathroom{room.bathroomCount > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Max {room.maxGuests} Guests
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {room.totalRooms} rooms
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={room.available ? "default" : "secondary"}>
                        {room.available ? "Available" : "Unavailable"}
                      </Badge>
                      {room.isPromoted && (
                        <Badge variant="outline" className="text-xs">
                          Promoted
                        </Badge>
                      )}
                      {room.discountPercent && room.discountPercent > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {room.discountPercent}% OFF
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(room)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(room.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
