"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2, Eye, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface Room {
  id: string
  roomNumber: string
  roomTypeId: string
  status: "available" | "occupied" | "maintenance" | "reserved" | "cleaning"
  floorNumber?: number
  notes?: string
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
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomTypeId: "",
    floorNumber: "",
    notes: "",
    status: "available"
  })

  // Fetch rooms and room types
  useEffect(() => {
    fetchRooms()
    fetchRoomTypes()
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
      const response = await fetch('/api/room-types/available')
      if (response.ok) {
        const data = await response.json()
        setRoomTypes(data)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
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
          notes: formData.notes || null
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
          status: "available"
        })
        fetchRooms()
        fetchRoomTypes()
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
      status: room.status
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
          notes: formData.notes || null
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
    if (!confirm('Are you sure you want to delete this room?')) {
      return
    }

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
    return matchesSearch && matchesStatus
  })

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
                    {roomTypes.filter(rt => rt.canAddMore).map((roomType) => (
                      <SelectItem key={roomType.id} value={roomType.id}>
                        {roomType.name} ({roomType.availableSlots} slots available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>

          <div className="grid gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold">Room {room.roomNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {room.floorNumber ? `Floor ${room.floorNumber}` : 'No floor'} • {room.roomType.name}
                    </p>
                    {room.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{room.notes}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{room.roomType.currency} {room.roomType.price}/night</span>
                  <Button variant="ghost" size="sm" onClick={() => handleEditRoom(room)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                    <Trash2 className="h-4 w-4" />
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
    </div>
  )
}
