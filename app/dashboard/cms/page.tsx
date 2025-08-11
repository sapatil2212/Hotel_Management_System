"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  MousePointer, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Upload,
  Eye,
  Copy,
  Download
} from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/hooks/use-toast"

interface ContentItem {
  id: string
  type: 'text' | 'image' | 'button' | 'section'
  section: string
  key: string
  title: string
  content: string
  imageUrl?: string
  altText?: string
  buttonText?: string
  buttonLink?: string
  buttonStyle?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface Section {
  id: string
  name: string
  description: string
  contentCount: number
}

export default function CMSPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [formData, setFormData] = useState({
    type: 'text' as const,
    section: '',
    key: '',
    title: '',
    content: '',
    imageUrl: '',
    altText: '',
    buttonText: '',
    buttonLink: '',
    buttonStyle: 'primary',
    isActive: true,
    order: 0
  })

  // Predefined sections
  const predefinedSections = [
    { id: 'hero', name: 'Hero Section', description: 'Main banner and call-to-action' },
    { id: 'about', name: 'About Section', description: 'Hotel information and description' },
    { id: 'services', name: 'Services Section', description: 'Hotel amenities and services' },
    { id: 'rooms', name: 'Rooms Section', description: 'Room showcase and features' },
    { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews and feedback' },
    { id: 'contact', name: 'Contact Section', description: 'Contact information and form' },
    { id: 'footer', name: 'Footer', description: 'Footer links and information' }
  ]

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      // Simulate loading content from API
      const mockContent: ContentItem[] = [
        {
          id: '1',
          type: 'text',
          section: 'hero',
          key: 'hero_title',
          title: 'Hero Title',
          content: 'Welcome to Grand Luxe Hotel',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'text',
          section: 'hero',
          key: 'hero_subtitle',
          title: 'Hero Subtitle',
          content: 'Experience luxury and comfort in the heart of the city',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'button',
          section: 'hero',
          key: 'hero_cta',
          title: 'Hero CTA Button',
          content: 'Book Now',
          buttonText: 'Book Now',
          buttonLink: '/rooms',
          buttonStyle: 'primary',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          type: 'image',
          section: 'hero',
          key: 'hero_image',
          title: 'Hero Background Image',
          content: '/images/hero-bg.jpg',
          imageUrl: '/images/hero-bg.jpg',
          altText: 'Luxury hotel lobby',
          isActive: true,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      setContentItems(mockContent)
      
      // Calculate section stats
      const sectionStats = predefinedSections.map(section => ({
        ...section,
        contentCount: mockContent.filter(item => item.section === section.id).length
      }))
      
      setSections(sectionStats)
    } catch (error) {
      console.error('Error loading content:', error)
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddContent = () => {
    setFormData({
      type: 'text',
      section: '',
      key: '',
      title: '',
      content: '',
      imageUrl: '',
      altText: '',
      buttonText: '',
      buttonLink: '',
      buttonStyle: 'primary',
      isActive: true,
      order: 0
    })
    setIsAddDialogOpen(true)
  }

  const handleEditContent = (item: ContentItem) => {
    setEditingItem(item)
    setFormData({
      type: item.type as 'text' | 'image' | 'button',
      section: item.section,
      key: item.key,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      altText: item.altText || '',
      buttonText: item.buttonText || '',
      buttonLink: item.buttonLink || '',
      buttonStyle: item.buttonStyle || 'primary',
      isActive: item.isActive,
      order: item.order
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveContent = async () => {
    try {
      if (editingItem) {
        // Update existing content
        const updatedItems = contentItems.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...formData, updatedAt: new Date().toISOString() }
            : item
        )
        setContentItems(updatedItems)
        toast({
          title: "Success",
          description: "Content updated successfully"
        })
      } else {
        // Add new content
        const newItem: ContentItem = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setContentItems([...contentItems, newItem])
        toast({
          title: "Success",
          description: "Content added successfully"
        })
      }
      
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingItem(null)
      loadContent() // Refresh content
    } catch (error) {
      console.error('Error saving content:', error)
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive"
      })
    }
  }

  const handleDeleteContent = async (id: string) => {
    try {
      const updatedItems = contentItems.filter(item => item.id !== id)
      setContentItems(updatedItems)
      toast({
        title: "Success",
        description: "Content deleted successfully"
      })
      loadContent() // Refresh content
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const updatedItems = contentItems.map(item => 
        item.id === id 
          ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() }
          : item
      )
      setContentItems(updatedItems)
      toast({
        title: "Success",
        description: "Content status updated"
      })
    } catch (error) {
      console.error('Error updating content status:', error)
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive"
      })
    }
  }

  const getContentBySection = (sectionId: string) => {
    return contentItems.filter(item => item.section === sectionId).sort((a, b) => a.order - b.order)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'image': return <ImageIcon className="h-4 w-4" />
      case 'button': return <MousePointer className="h-4 w-4" />
      default: return <Palette className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      text: { label: 'Text', className: 'bg-blue-100 text-blue-800' },
      image: { label: 'Image', className: 'bg-green-100 text-green-800' },
      button: { label: 'Button', className: 'bg-purple-100 text-purple-800' },
      section: { label: 'Section', className: 'bg-orange-100 text-orange-800' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.text
    
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
          <p>Loading CMS content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management System</h1>
          <p className="text-muted-foreground">
            Manage frontend UI content, images, text, and buttons
          </p>
        </div>
        <Button onClick={handleAddContent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Content items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentItems.filter(item => item.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently visible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Type className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-muted-foreground">
              Content sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentItems.filter(item => item.type === 'image').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Image assets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="content">All Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common content management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Type className="h-6 w-6" />
                  <span>Manage Text</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <ImageIcon className="h-6 w-6" />
                  <span>Manage Images</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MousePointer className="h-6 w-6" />
                  <span>Manage Buttons</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.section}</p>
                        </div>
                      </div>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{section.name}</p>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                      <Badge variant="outline">{section.contentCount} items</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("content")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getContentBySection(section.id).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.content.substring(0, 50)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(item.type)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContent(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(item.id)}
                        >
                          {item.isActive ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {getContentBySection(section.id).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No content in this section
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Content Items</CardTitle>
              <CardDescription>
                Manage all content items across all sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Palette className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No content items found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contentItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              {getTypeBadge(item.type)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.section}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {item.type === 'image' ? (
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4" />
                                  <span className="text-sm text-muted-foreground">Image asset</span>
                                </div>
                              ) : (
                                item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '')
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.isActive ? "default" : "secondary"}>
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditContent(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(item.id)}
                              >
                                {item.isActive ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContent(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>

      {/* Add/Edit Content Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingItem(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the content item' : 'Create a new content item for the website'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData({ ...formData, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="key">Content Key</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., hero_title, about_description"
              />
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Content title for reference"
              />
            </div>

            {formData.type === 'text' && (
              <div>
                <Label htmlFor="content">Text Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the text content"
                  rows={4}
                />
              </div>
            )}

            {formData.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Enter image URL or upload image"
                  />
                </div>
                <div>
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    placeholder="Alternative text for accessibility"
                  />
                </div>
                                 <div>
                   <Label>Image Upload</Label>
                   <ImageUpload
                     value={formData.imageUrl ? [formData.imageUrl] : []}
                     onChange={(urls) => setFormData({ ...formData, imageUrl: urls[0] || '' })}
                   />
                 </div>
              </div>
            )}

            {formData.type === 'button' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Button label text"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="URL or route for button action"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonStyle">Button Style</Label>
                  <Select
                    value={formData.buttonStyle}
                    onValueChange={(value) => setFormData({ ...formData, buttonStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active (visible on website)</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setIsEditDialogOpen(false)
              setEditingItem(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent}>
              <Save className="h-4 w-4 mr-2" />
              {editingItem ? 'Update' : 'Create'} Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
