"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Filter, Edit, Trash2, Eye, Building2, CheckCircle, XCircle, Loader } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"

interface Room {
  id: string
  roomNumber: string
  roomTypeId: string
  status: "available" | "occupied" | "maintenance" | "reserved" | "cleaning"
  floorNumber?: number
  notes?: string
  availableForBooking: boolean
  roomType: {
    id: string
    name: string
    price: number
    currency: string
    amenities: any[]
    features: any[]
    size: string
    bedType: string
    maxGuests: number
  }
  _count?: {
    bookings: number
  }
}

interface RoomType {
  id: string
  name: string
  totalRooms: number
  price: number
  currency: string
  currentRoomsCount: number
  availableSlots: number
  canAddMore: boolean
}

export default function RoomManagePage() {
  const deleteConfirmation = useDeleteConfirmation()
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomTypeId: "",
    floorNumber: "",
    notes: "",
    status: "available",
    availableForBooking: true
  })

  // Fetch rooms and room types
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchRooms(), fetchRoomTypes()])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms/individual')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive"
      })
    }
  }

  const fetchRoomTypes = async () => {
    try {
      console.log('Fetching room types from /api/room-types/available...')
      const response = await fetch('/api/room-types/available')
      console.log('Room types API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Room types API response:', result)
        
        if (result.success && result.data) {
          console.log('Room types data received:', result.data)
          setRoomTypes(result.data)
        } else {
          console.error('Room types API returned error:', result.error)
          toast({
            title: "Error",
            description: result.error || "Failed to fetch room types",
            variant: "destructive"
          })
        }
      } else {
        const errorData = await response.json()
        console.error('Room types API error:', errorData)
        toast({
          title: "Error",
          description: "Failed to fetch room types",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
      toast({
        title: "Error",
        description: "Failed to fetch room types",
        variant: "destructive"
      })
    }
  }

  const handleAddRoom = async () => {
    if (!formData.roomNumber || !formData.roomTypeId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/rooms/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomNumber: formData.roomNumber,
          roomTypeId: formData.roomTypeId,
          floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
          notes: formData.notes || null,
          availableForBooking: formData.availableForBooking
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Room added successfully"
        })
        setIsAddDialogOpen(false)
        setFormData({
          roomNumber: "",
          roomTypeId: "",
          floorNumber: "",
          notes: "",
          status: "available",
          availableForBooking: true
        })
        fetchRooms()
        fetchRoomTypes()
        // Trigger a refresh of room types status in the main rooms page
        window.postMessage({ type: 'ROOMS_UPDATED' }, '*')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add room",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add room",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      floorNumber: room.floorNumber?.toString() || "",
      notes: room.notes || "",
      status: room.status,
      availableForBooking: room.availableForBooking
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateRoom = async () => {
    if (!editingRoom || !formData.roomNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/rooms/individual/${editingRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomNumber: formData.roomNumber,
          status: formData.status,
          floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
          notes: formData.notes || null,
          availableForBooking: formData.availableForBooking
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Room updated successfully"
        })
        setIsEditDialogOpen(false)
        setEditingRoom(null)
        fetchRooms()
        // Trigger a refresh of room types status in the main rooms page
        window.postMessage({ type: 'ROOMS_UPDATED' }, '*')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update room",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    deleteConfirmation.showDeleteConfirmation(
      async () => {
        try {
          const response = await fetch(`/api/rooms/individual/${roomId}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            toast({
              title: "Success",
              description: "Room deleted successfully"
            })
            fetchRooms()
            fetchRoomTypes()
            // Trigger a refresh of room types status in the main rooms page
            window.postMessage({ type: 'ROOMS_UPDATED' }, '*')
          } else {
            const error = await response.json()
            toast({
              title: "Error",
              description: error.error || "Failed to delete room",
              variant: "destructive"
            })
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete room",
            variant: "destructive"
          })
        }
      },
      {
        title: 'Delete Room',
        description: 'Are you sure you want to delete this room? This action cannot be undone.',
        itemName: room ? `Room ${room.roomNumber}` : undefined,
        variant: 'danger'
      }
    )
  }

  const handleToggleAvailableForBooking = async (roomId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/rooms/individual/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availableForBooking: !currentStatus
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Room ${!currentStatus ? 'activated' : 'deactivated'} for booking`
        })
        fetchRooms()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update room availability",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room availability",
        variant: "destructive"
      })
    }
  }

  const handleBulkToggleAvailableForBooking = async (makeAvailable: boolean) => {
    if (selectedRooms.length === 0) {
      toast({
        title: "Warning",
        description: "Please select rooms to update",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const promises = selectedRooms.map(roomId => 
        fetch(`/api/rooms/individual/${roomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            availableForBooking: makeAvailable
          })
        })
      )

      await Promise.all(promises)
      
      toast({
        title: "Success",
        description: `${selectedRooms.length} rooms ${makeAvailable ? 'activated' : 'deactivated'} for booking`
      })
      
      setSelectedRooms([])
      fetchRooms()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rooms availability",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === filteredRooms.length) {
      setSelectedRooms([])
    } else {
      setSelectedRooms(filteredRooms.map(room => room.id))
    }
  }

  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      case "cleaning":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesAvailability = availabilityFilter === "all" || 
                               (availabilityFilter === "available" && room.availableForBooking) ||
                               (availabilityFilter === "not-available" && !room.availableForBooking)
    return matchesSearch && matchesStatus && matchesAvailability
  })

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Manage your hotel room types and inventory
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>
                Add a new individual room to the hotel inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input 
                  id="roomNumber" 
                  placeholder="e.g., 101" 
                  value={formData.roomNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="roomType">Room Type *</Label>
                <Select value={formData.roomTypeId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomTypeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.filter(rt => rt.canAddMore).length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No room types available for adding rooms</p>
                        <p className="text-sm mt-1">Create room types first or check database connection</p>
                      </div>
                    ) : (
                      roomTypes.filter(rt => rt.canAddMore).map((roomType) => (
                        <SelectItem key={roomType.id} value={roomType.id}>
                          {roomType.name} ({roomType.availableSlots} slots available)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {roomTypes.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No room types found. Please create room types first.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="floor">Floor Number</Label>
                <Input 
                  id="floor" 
                  type="number" 
                  placeholder="e.g., 1" 
                  value={formData.floorNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes about this room..." 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availableForBooking"
                  checked={formData.availableForBooking}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availableForBooking: checked as boolean }))}
                />
                <Label htmlFor="availableForBooking">Available for booking</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRoom} disabled={loading}>
                {loading ? "Adding..." : "Add Room"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Room Types Overview
          </CardTitle>
          <CardDescription>
            Current room inventory status by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roomTypes.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Room Types Found</h3>
              <p className="text-gray-600 mb-4">
                No room types have been created yet. You need to create room types first before adding individual rooms.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Go to the <strong>Rooms</strong> page to create room types</p>
                <p>• Or run the database seed script to create sample room types</p>
                <p>• Check the database connection if the issue persists</p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.href = '/dashboard/rooms'}
                  variant="outline"
                >
                  Go to Rooms Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomTypes.map((roomType) => (
                <div key={roomType.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{roomType.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {roomType.currentRoomsCount} of {roomType.totalRooms} rooms created
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((roomType.currentRoomsCount / roomType.totalRooms) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(roomType.currentRoomsCount / roomType.totalRooms) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {roomType.availableSlots} slots available
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Availability Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Room Availability Statistics
          </CardTitle>
          <CardDescription>
            Overview of rooms available for booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold text-green-800">Available for Booking</h3>
              <p className="text-2xl font-bold text-green-600">
                {rooms.filter(room => room.availableForBooking).length}
              </p>
              <p className="text-sm text-green-600">
                {rooms.length > 0 ? Math.round((rooms.filter(room => room.availableForBooking).length / rooms.length) * 100) : 0}% of total rooms
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-red-50">
              <h3 className="font-semibold text-red-800">Not Available for Booking</h3>
              <p className="text-2xl font-bold text-red-600">
                {rooms.filter(room => !room.availableForBooking).length}
              </p>
              <p className="text-sm text-red-600">
                {rooms.length > 0 ? Math.round((rooms.filter(room => !room.availableForBooking).length / rooms.length) * 100) : 0}% of total rooms
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-semibold text-blue-800">Total Rooms</h3>
              <p className="text-2xl font-bold text-blue-600">{rooms.length}</p>
              <p className="text-sm text-blue-600">Individual rooms in inventory</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Rooms</CardTitle>
          <CardDescription>
            View and manage all individual rooms in the hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-48">
                <Eye className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available for Booking</SelectItem>
                <SelectItem value="not-available">Not Available for Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedRooms.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedRooms.length} room(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkToggleAvailableForBooking(true)}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate for Booking
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkToggleAvailableForBooking(false)}
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate for Booking
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {/* Header row with select all checkbox */}
            <div className="flex items-center p-4 border rounded-lg bg-gray-50">
              <Checkbox
                checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
                onCheckedChange={handleSelectAllRooms}
                className="mr-4"
              />
              <div className="flex-1">
                <h4 className="font-medium">Select All Rooms</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedRooms.length} of {filteredRooms.length} rooms selected
                </p>
              </div>
            </div>

            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedRooms.includes(room.id)}
                    onCheckedChange={() => handleSelectRoom(room.id)}
                  />
                  <div>
                    <h3 className="font-semibold">Room {room.roomNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {room.floorNumber ? `Floor ${room.floorNumber}` : 'No floor'} • {room.roomType.name}
                    </p>
                    {room.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{room.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(room.status)}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </Badge>
                    <Badge 
                      variant={room.availableForBooking ? "default" : "secondary"}
                      className={room.availableForBooking ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {room.availableForBooking ? "Available for Booking" : "Not Available for Booking"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{room.roomType.currency} {room.roomType.price}/night</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleAvailableForBooking(room.id, room.availableForBooking)}
                    title={room.availableForBooking ? "Deactivate for booking" : "Activate for booking"}
                  >
                    {room.availableForBooking ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditRoom(room)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                    <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rooms found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room details and status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editRoomNumber">Room Number *</Label>
              <Input 
                id="editRoomNumber" 
                placeholder="e.g., 101" 
                value={formData.roomNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editFloor">Floor Number</Label>
              <Input 
                id="editFloor" 
                type="number" 
                placeholder="e.g., 1" 
                value={formData.floorNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea 
                id="editNotes" 
                placeholder="Additional notes about this room..." 
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="editAvailableForBooking"
                checked={formData.availableForBooking}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availableForBooking: checked as boolean }))}
              />
              <Label htmlFor="editAvailableForBooking">Available for booking</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoom} disabled={loading}>
              {loading ? "Updating..." : "Update Room"}
            </Button>
          </div>
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
