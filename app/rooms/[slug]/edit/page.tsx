"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import Head from "next/head"

interface Room {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  currency: string
  description: string
  shortDescription: string
  highlights?: string
  images: string[]
  amenities: string[]
  maxGuests: number
  size: string
  bedType: string
  bathroomCount: number
  available: boolean
  features: string[]
  totalRooms: number
  roomNumber?: string
  floorNumber?: number
  viewType?: string
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  discountPercent?: number
  isPromoted: boolean
  cancellationFree: boolean
  instantBooking: boolean
  categoryId?: string
}

export default function EditRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchRoom()
  }, [params.slug])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rooms`)
      if (response.ok) {
        const rooms = await response.json()
        const currentRoom = rooms.find((r: any) => r.slug === params.slug)
        if (currentRoom) {
          setRoom(currentRoom)
        } else {
          toast.error('Room not found')
          router.push('/rooms')
        }
      } else {
        toast.error('Failed to fetch room data')
      }
    } catch (error) {
      console.error('Error fetching room:', error)
      toast.error('Failed to fetch room data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!room) return

    try {
      setSaving(true)
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      })

      if (response.ok) {
        toast.success('Room updated successfully!')
        router.push(`/rooms/${room.slug}`)
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving room:', error)
      toast.error('Failed to save room. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!room) return
    
    if (!confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Room deleted successfully!')
        router.push('/rooms')
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Failed to delete room. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const updateRoom = (field: keyof Room, value: any) => {
    setRoom(prev => prev ? {
      ...prev,
      [field]: value
    } : null)
  }

  const addAmenity = (amenity: string) => {
    if (room && amenity.trim() && !room.amenities.includes(amenity.trim())) {
      updateRoom('amenities', [...room.amenities, amenity.trim()])
    }
  }

  const removeAmenity = (index: number) => {
    if (room) {
      updateRoom('amenities', room.amenities.filter((_, i) => i !== index))
    }
  }

  const addFeature = (feature: string) => {
    if (room && feature.trim() && !room.features.includes(feature.trim())) {
      updateRoom('features', [...room.features, feature.trim()])
    }
  }

  const removeFeature = (index: number) => {
    if (room) {
      updateRoom('features', room.features.filter((_, i) => i !== index))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
          <p className="text-muted-foreground mb-4">The room you're trying to edit doesn't exist.</p>
          <Button asChild>
            <Link href="/rooms">Back to Rooms</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Edit {room.name} | Grand Luxe Hotel Admin</title>
        <meta name="description" content={`Edit details for ${room.name}`} />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
<<<<<<< HEAD
          <div className="container mx-auto px-6 py-3">
=======
          <div className="container mx-auto px-6 py-4">
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/rooms/${room.slug}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
<<<<<<< HEAD
                    Back
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Edit Room</h1>
                  <p className="text-sm text-muted-foreground">{room.name}</p>
=======
                    Back to Details
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Edit Room</h1>
                  <p className="text-muted-foreground">{room.name}</p>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
<<<<<<< HEAD
                  size="sm"
=======
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Room
                    </>
                  )}
                </Button>
<<<<<<< HEAD
                <Button size="sm" onClick={handleSave} disabled={saving}>
=======
                <Button onClick={handleSave} disabled={saving}>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="container mx-auto px-6 py-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
=======
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details & Content</TabsTrigger>
              <TabsTrigger value="amenities">Amenities & Features</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="seo">SEO & Settings</TabsTrigger>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
<<<<<<< HEAD
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label htmlFor="name" className="text-sm font-medium">Room Name</Label>
=======
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Room Name</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="name"
                        value={room.name}
                        onChange={(e) => updateRoom('name', e.target.value)}
<<<<<<< HEAD
                        placeholder="Deluxe King Room"
                        className="h-9 text-sm"
=======
                        placeholder="e.g., Super Deluxe Room"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="price" className="text-sm font-medium">Price per Night (₹)</Label>
=======
                      <Label htmlFor="price">Price per Night (₹)</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="price"
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoom('price', parseInt(e.target.value))}
<<<<<<< HEAD
                        placeholder="5000"
                        className="h-9 text-sm"
=======
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="originalPrice" className="text-sm font-medium">Original Price (₹)</Label>
=======
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="originalPrice"
                        type="number"
                        value={room.originalPrice || ''}
                        onChange={(e) => updateRoom('originalPrice', e.target.value ? parseInt(e.target.value) : undefined)}
<<<<<<< HEAD
                        placeholder="6000"
                        className="h-9 text-sm"
=======
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="size" className="text-sm font-medium">Room Size</Label>
=======
                      <Label htmlFor="size">Room Size</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="size"
                        value={room.size}
                        onChange={(e) => updateRoom('size', e.target.value)}
<<<<<<< HEAD
                        placeholder="45 sq m"
                        className="h-9 text-sm"
=======
                        placeholder="180 sq.ft (17 sq.mt)"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="bedType" className="text-sm font-medium">Bed Configuration</Label>
                      <Select value={room.bedType} onValueChange={(value) => updateRoom('bedType', value)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="King Bed" />
=======
                      <Label htmlFor="bedType">Bed Configuration</Label>
                      <Select value={room.bedType} onValueChange={(value) => updateRoom('bedType', value)}>
                        <SelectTrigger>
                          <SelectValue />
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
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
<<<<<<< HEAD
                      <Label htmlFor="bathroomCount" className="text-sm font-medium">Bathrooms</Label>
                      <Select value={room.bathroomCount.toString()} onValueChange={(value) => updateRoom('bathroomCount', parseInt(value))}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="1 Bathroom" />
=======
                      <Label htmlFor="bathroomCount">Bathrooms</Label>
                      <Select value={room.bathroomCount.toString()} onValueChange={(value) => updateRoom('bathroomCount', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bathroom</SelectItem>
                          <SelectItem value="2">2 Bathrooms</SelectItem>
                          <SelectItem value="3">3 Bathrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="maxGuests" className="text-sm font-medium">Max Guests</Label>
                      <Select value={room.maxGuests.toString()} onValueChange={(value) => updateRoom('maxGuests', parseInt(value))}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="2 Guests" />
=======
                      <Label htmlFor="maxGuests">Max Guests</Label>
                      <Select value={room.maxGuests.toString()} onValueChange={(value) => updateRoom('maxGuests', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
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
<<<<<<< HEAD
                      <Label htmlFor="totalRooms" className="text-sm font-medium">Total Rooms Available</Label>
=======
                      <Label htmlFor="totalRooms">Total Rooms Available</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="totalRooms"
                        type="number"
                        value={room.totalRooms}
                        onChange={(e) => updateRoom('totalRooms', parseInt(e.target.value))}
<<<<<<< HEAD
                        placeholder="10"
                        min="1"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discountPercent" className="text-sm font-medium">Discount Percentage</Label>
                      <Input
                        id="discountPercent"
                        type="number"
                        value={room.discountPercent || ''}
                        onChange={(e) => updateRoom('discountPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="No discount"
                        min="0"
                        max="100"
                        className="h-9 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for no discount</p>
                    </div>
=======
                        min="1"
                      />
                    </div>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={room.available}
                        onCheckedChange={(checked) => updateRoom('available', checked)}
                      />
<<<<<<< HEAD
                      <Label htmlFor="available" className="text-sm">Available for booking</Label>
=======
                      <Label htmlFor="available">Available for booking</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPromoted"
                        checked={room.isPromoted}
                        onCheckedChange={(checked) => updateRoom('isPromoted', checked)}
                      />
<<<<<<< HEAD
                      <Label htmlFor="isPromoted" className="text-sm">Promoted room</Label>
=======
                      <Label htmlFor="isPromoted">Promoted room</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
<<<<<<< HEAD
                  <CardTitle className="text-lg">Room Details & Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shortDescription" className="text-sm font-medium">Short Description</Label>
=======
                  <CardTitle>Room Details & Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    <Textarea
                      id="shortDescription"
                      value={room.shortDescription}
                      onChange={(e) => updateRoom('shortDescription', e.target.value)}
<<<<<<< HEAD
                      placeholder="Luxury king room with city view"
                      rows={2}
                      className="text-sm"
=======
                      placeholder="Brief description for room cards"
                      rows={3}
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    />
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <Label htmlFor="description" className="text-sm font-medium">Full Description</Label>
=======
                    <Label htmlFor="description">Full Description</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    <Textarea
                      id="description"
                      value={room.description}
                      onChange={(e) => updateRoom('description', e.target.value)}
<<<<<<< HEAD
                      placeholder="Spacious deluxe room with a king-size bed, city view, and premium amenities. Perfect for business travelers and couples seeking comfort and luxury."
                      rows={4}
                      className="text-sm"
=======
                      placeholder="Detailed room description"
                      rows={6}
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    />
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <Label htmlFor="highlights" className="text-sm font-medium">Key Features/Highlights</Label>
=======
                    <Label htmlFor="highlights">Room Highlights</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    <Textarea
                      id="highlights"
                      value={room.highlights || ''}
                      onChange={(e) => updateRoom('highlights', e.target.value)}
<<<<<<< HEAD
                      placeholder="• Premium Egyptian cotton bedding&#10;• Panoramic city views&#10;• Marble bathroom with rainfall shower&#10;• Complimentary high-speed WiFi"
                      rows={4}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use bullet points (•) to highlight key room features</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="viewType" className="text-sm font-medium">View Type</Label>
=======
                      placeholder="• Key feature 1&#10;• Key feature 2&#10;• Key feature 3"
                      rows={6}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="viewType">View Type</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="viewType"
                        value={room.viewType || ''}
                        onChange={(e) => updateRoom('viewType', e.target.value)}
<<<<<<< HEAD
                        placeholder="City View, Ocean View"
                        className="h-9 text-sm"
=======
                        placeholder="e.g., City View, Ocean View"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="floorNumber" className="text-sm font-medium">Floor Number</Label>
=======
                      <Label htmlFor="floorNumber">Floor Number</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="floorNumber"
                        type="number"
                        value={room.floorNumber || ''}
                        onChange={(e) => updateRoom('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
<<<<<<< HEAD
                        className="h-9 text-sm"
=======
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                    
                    <div>
<<<<<<< HEAD
                      <Label htmlFor="roomNumber" className="text-sm font-medium">Room Number</Label>
=======
                      <Label htmlFor="roomNumber">Room Number</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      <Input
                        id="roomNumber"
                        value={room.roomNumber || ''}
                        onChange={(e) => updateRoom('roomNumber', e.target.value)}
<<<<<<< HEAD
                        placeholder="101, 205"
                        className="h-9 text-sm"
=======
                        placeholder="e.g., 101, 205"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities">
<<<<<<< HEAD
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Room Amenities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity (e.g., Free WiFi, Air Conditioning)"
=======
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Room Amenities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new amenity..."
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addAmenity(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
<<<<<<< HEAD
                        className="h-9 text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
=======
                      />
                      <Button
                        type="button"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input')
                          if (input) {
                            addAmenity(input.value)
                            input.value = ''
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
<<<<<<< HEAD
                    
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Quick add common amenities:</div>
                      <div className="flex flex-wrap gap-1">
                        {['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'TV', 'Safe', 'Hair Dryer', 'Coffee/Tea Maker', 'Telephone', 'Daily Housekeeping'].map((amenity) => (
                          <Button
                            key={amenity}
                            variant="outline"
                            size="sm"
                            onClick={() => addAmenity(amenity)}
                            className="text-xs h-7 px-2"
                          >
                            + {amenity}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer text-xs">
                          {amenity}×
                          <button
                            onClick={() => removeAmenity(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
=======
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {amenity}
                          <button
                            onClick={() => removeAmenity(index)}
                            className="ml-2 text-red-500"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
<<<<<<< HEAD
                    <CardTitle className="text-lg">Room Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add feature (e.g., City View, Non-Smoking, Balcony)"
=======
                    <CardTitle>Room Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new feature..."
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addFeature(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
<<<<<<< HEAD
                        className="h-9 text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
=======
                      />
                      <Button
                        type="button"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input')
                          if (input) {
                            addFeature(input.value)
                            input.value = ''
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
<<<<<<< HEAD
                    
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Quick add common features:</div>
                      <div className="flex flex-wrap gap-1">
                        {['City View', 'Ocean View', 'Mountain View', 'Non-Smoking', 'Soundproof', 'Balcony', 'Modern Décor', 'Premium Bedding', 'Work Desk', 'Sitting Area'].map((feature) => (
                          <Button
                            key={feature}
                            variant="outline"
                            size="sm"
                            onClick={() => addFeature(feature)}
                            className="text-xs h-7 px-2"
                          >
                            + {feature}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {room.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer text-xs">
                          {feature}×
                          <button
                            onClick={() => removeFeature(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
=======
                    <div className="flex flex-wrap gap-2">
                      {room.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {feature}
                          <button
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-red-500"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="images">
              <Card>
                <CardHeader>
<<<<<<< HEAD
                  <CardTitle className="text-lg">Room Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Upload Section */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Upload Images</div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                        <div className="text-xs text-gray-600 mb-2">
                          Drag and drop images here, or click to select files
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Supports: JPG, PNG, WebP (max 5MB each)
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Select Images
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {room.images.length}/6 uploaded
                      </div>
                    </div>
                    
                    {/* Image Preview Section */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Uploaded Images</div>
                      <div className="grid grid-cols-2 gap-2">
                        {room.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Room image ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                <Button size="sm" variant="secondary" className="h-5 w-5 p-0">
                                  <span className="text-xs">1°</span>
                                </Button>
                                <Button size="sm" variant="destructive" className="h-5 w-5 p-0">
                                  ×
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {room.images.length < 6 && (
                          <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                            <span className="text-xs">Upload {6 - room.images.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
=======
                  <CardTitle>Room Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={room.images}
                    onChange={(images) => updateRoom('images', images)}
                    maxImages={10}
                  />
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
<<<<<<< HEAD
                  <CardTitle className="text-lg">SEO & Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle" className="text-sm font-medium">Meta Title</Label>
=======
                  <CardTitle>SEO & Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    <Input
                      id="metaTitle"
                      value={room.metaTitle || ''}
                      onChange={(e) => updateRoom('metaTitle', e.target.value)}
                      placeholder="SEO page title"
<<<<<<< HEAD
                      className="h-9 text-sm"
=======
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    />
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <Label htmlFor="metaDescription" className="text-sm font-medium">Meta Description</Label>
=======
                    <Label htmlFor="metaDescription">Meta Description</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    <Textarea
                      id="metaDescription"
                      value={room.metaDescription || ''}
                      onChange={(e) => updateRoom('metaDescription', e.target.value)}
                      placeholder="SEO meta description"
<<<<<<< HEAD
                      rows={2}
                      className="text-sm"
=======
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discountPercent">Discount Percentage</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      value={room.discountPercent || ''}
                      onChange={(e) => updateRoom('discountPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min="0"
                      max="100"
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancellationFree"
                        checked={room.cancellationFree}
                        onCheckedChange={(checked) => updateRoom('cancellationFree', checked)}
                      />
<<<<<<< HEAD
                      <Label htmlFor="cancellationFree" className="text-sm">Free cancellation</Label>
=======
                      <Label htmlFor="cancellationFree">Free cancellation</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="instantBooking"
                        checked={room.instantBooking}
                        onCheckedChange={(checked) => updateRoom('instantBooking', checked)}
                      />
<<<<<<< HEAD
                      <Label htmlFor="instantBooking" className="text-sm">Instant booking</Label>
=======
                      <Label htmlFor="instantBooking">Instant booking</Label>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
