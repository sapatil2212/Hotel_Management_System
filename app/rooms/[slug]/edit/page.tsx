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
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/rooms/${room.slug}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Details
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Edit Room</h1>
                  <p className="text-muted-foreground">{room.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
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
                <Button onClick={handleSave} disabled={saving}>
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

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details & Content</TabsTrigger>
              <TabsTrigger value="amenities">Amenities & Features</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="seo">SEO & Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Room Name</Label>
                      <Input
                        id="name"
                        value={room.name}
                        onChange={(e) => updateRoom('name', e.target.value)}
                        placeholder="e.g., Super Deluxe Room"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Price per Night (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoom('price', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={room.originalPrice || ''}
                        onChange={(e) => updateRoom('originalPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="size">Room Size</Label>
                      <Input
                        id="size"
                        value={room.size}
                        onChange={(e) => updateRoom('size', e.target.value)}
                        placeholder="180 sq.ft (17 sq.mt)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bedType">Bed Configuration</Label>
                      <Select value={room.bedType} onValueChange={(value) => updateRoom('bedType', value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Select value={room.bathroomCount.toString()} onValueChange={(value) => updateRoom('bathroomCount', parseInt(value))}>
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
                      <Select value={room.maxGuests.toString()} onValueChange={(value) => updateRoom('maxGuests', parseInt(value))}>
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
                        value={room.totalRooms}
                        onChange={(e) => updateRoom('totalRooms', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={room.available}
                        onCheckedChange={(checked) => updateRoom('available', checked)}
                      />
                      <Label htmlFor="available">Available for booking</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPromoted"
                        checked={room.isPromoted}
                        onCheckedChange={(checked) => updateRoom('isPromoted', checked)}
                      />
                      <Label htmlFor="isPromoted">Promoted room</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Room Details & Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={room.shortDescription}
                      onChange={(e) => updateRoom('shortDescription', e.target.value)}
                      placeholder="Brief description for room cards"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={room.description}
                      onChange={(e) => updateRoom('description', e.target.value)}
                      placeholder="Detailed room description"
                      rows={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="highlights">Room Highlights</Label>
                    <Textarea
                      id="highlights"
                      value={room.highlights || ''}
                      onChange={(e) => updateRoom('highlights', e.target.value)}
                      placeholder="• Key feature 1&#10;• Key feature 2&#10;• Key feature 3"
                      rows={6}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="viewType">View Type</Label>
                      <Input
                        id="viewType"
                        value={room.viewType || ''}
                        onChange={(e) => updateRoom('viewType', e.target.value)}
                        placeholder="e.g., City View, Ocean View"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="floorNumber">Floor Number</Label>
                      <Input
                        id="floorNumber"
                        type="number"
                        value={room.floorNumber || ''}
                        onChange={(e) => updateRoom('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="roomNumber">Room Number</Label>
                      <Input
                        id="roomNumber"
                        value={room.roomNumber || ''}
                        onChange={(e) => updateRoom('roomNumber', e.target.value)}
                        placeholder="e.g., 101, 205"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Room Amenities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new amenity..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addAmenity(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <Button
                        type="button"
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
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {amenity}
                          <button
                            onClick={() => removeAmenity(index)}
                            className="ml-2 text-red-500"
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
                    <CardTitle>Room Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new feature..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addFeature(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <Button
                        type="button"
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
                    <div className="flex flex-wrap gap-2">
                      {room.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {feature}
                          <button
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-red-500"
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
                  <CardTitle>Room Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={room.images}
                    onChange={(images) => updateRoom('images', images)}
                    maxImages={10}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={room.metaTitle || ''}
                      onChange={(e) => updateRoom('metaTitle', e.target.value)}
                      placeholder="SEO page title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={room.metaDescription || ''}
                      onChange={(e) => updateRoom('metaDescription', e.target.value)}
                      placeholder="SEO meta description"
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
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancellationFree"
                        checked={room.cancellationFree}
                        onCheckedChange={(checked) => updateRoom('cancellationFree', checked)}
                      />
                      <Label htmlFor="cancellationFree">Free cancellation</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="instantBooking"
                        checked={room.instantBooking}
                        onCheckedChange={(checked) => updateRoom('instantBooking', checked)}
                      />
                      <Label htmlFor="instantBooking">Instant booking</Label>
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
