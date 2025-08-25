"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  User,
  Eye,
  Reply,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from "lucide-react"

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  source: string
  createdAt: string
  updatedAt: string
  assignedTo: string | null
  notes: string | null
  resolvedAt: string | null
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800"
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
}

const priorityIcons = {
  low: Clock,
  medium: AlertCircle,
  high: Star,
  urgent: AlertCircle
}

export default function EnquiriesPage() {
  const { toast } = useToast()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      const response = await fetch("/api/enquiries")
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data.enquiries)
      } else {
        throw new Error("Failed to fetch enquiries")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load enquiries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateEnquiryStatus = async (enquiryId: string, status: string) => {
    try {
      const response = await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Enquiry status updated successfully",
        })
        fetchEnquiries()
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update enquiry status",
        variant: "destructive",
      })
    }
  }

  const sendReply = async () => {
    if (!selectedEnquiry || !replyMessage.trim()) return

    setSendingReply(true)
    try {
      const response = await fetch(`/api/enquiries/${selectedEnquiry.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reply sent successfully",
        })
        setReplyMessage("")
        setSelectedEnquiry(null)
        fetchEnquiries()
      } else {
        throw new Error("Failed to send reply")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setSendingReply(false)
    }
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter
    const matchesPriority = priorityFilter === "all" || enquiry.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'new').length,
    inProgress: enquiries.filter(e => e.status === 'in_progress').length,
    resolved: enquiries.filter(e => e.status === 'resolved').length,
    urgent: enquiries.filter(e => e.priority === 'urgent').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-3xl font-bold">Enquiries</h2>
          <p className="text-[10px] sm:text-sm text-gray-600">Manage customer enquiries and support requests</p>
        </div>
        <Button onClick={fetchEnquiries} variant="outline" className="h-8 w-8 sm:h-9 sm:w-auto text-xs sm:text-sm">
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-sm sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageCircle className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-sm font-medium text-gray-600">New</p>
                <p className="text-sm sm:text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="h-4 w-4 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-2 w-2 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-sm sm:text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <div className="h-4 w-4 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-2 w-2 sm:h-4 sm:w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-sm sm:text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="h-4 w-4 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-2 w-2 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-sm sm:text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <div className="h-4 w-4 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-2 w-2 sm:h-4 sm:w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm rounded-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredEnquiries.length === 0 ? (
          <Card className="rounded-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
              <p className="text-[10px] sm:text-sm text-gray-600">No enquiries match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEnquiries.map((enquiry) => {
            const PriorityIcon = priorityIcons[enquiry.priority]
            return (
              <Card key={enquiry.id} className="hover:shadow-md transition-shadow rounded-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <PriorityIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-900 text-[10px] sm:text-sm">{enquiry.subject}</h3>
                        </div>
                        <Badge className={`${statusColors[enquiry.status]} text-[9px] sm:text-xs`}>
                          {enquiry.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${priorityColors[enquiry.priority]} text-[9px] sm:text-xs`}>
                          {enquiry.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-600">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{enquiry.name}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-600">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{enquiry.email}</span>
                        </div>
                        {enquiry.phone && (
                          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-600">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{enquiry.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-600">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-[10px] sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                        {enquiry.message}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-2 sm:ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedEnquiry(enquiry)}
                            className="h-7 w-7 sm:h-8 sm:w-auto p-0 sm:px-3"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-2">View</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="mb-3 sm:mb-6">
                            <DialogTitle className="text-base sm:text-xl">Enquiry Details</DialogTitle>
                            <DialogDescription className="text-[10px] sm:text-sm">
                              View and respond to this enquiry
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="text-[10px] sm:text-sm font-medium text-gray-700">Name</label>
                                <p className="text-[10px] sm:text-sm text-gray-900">{enquiry.name}</p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-sm font-medium text-gray-700">Email</label>
                                <p className="text-[10px] sm:text-sm text-gray-900">{enquiry.email}</p>
                              </div>
                              {enquiry.phone && (
                                <div>
                                  <label className="text-[10px] sm:text-sm font-medium text-gray-700">Phone</label>
                                  <p className="text-[10px] sm:text-sm text-gray-900">{enquiry.phone}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-[10px] sm:text-sm font-medium text-gray-700">Subject</label>
                                <p className="text-[10px] sm:text-sm text-gray-900">{enquiry.subject}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-sm font-medium text-gray-700">Message</label>
                              <p className="text-[10px] sm:text-sm text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-md">
                                {enquiry.message}
                              </p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-sm font-medium text-gray-700">Reply</label>
                              <Textarea
                                placeholder="Type your reply..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                rows={4}
                                className="mt-1 h-8 sm:h-auto text-xs sm:text-sm rounded-md"
                              />
                            </div>
                            <div className="flex gap-2 pt-3 border-t">
                              <Button
                                onClick={sendReply}
                                disabled={sendingReply || !replyMessage.trim()}
                                className="h-8 sm:h-9 text-xs sm:text-sm flex-1"
                              >
                                {sendingReply ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Reply className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Send Reply
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Select 
                        value={enquiry.status} 
                        onValueChange={(value) => updateEnquiryStatus(enquiry.id, value)}
                      >
                        <SelectTrigger className="h-7 sm:h-8 text-[10px] sm:text-xs rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
