"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 6,
  className,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      // Get Cloudinary signature
      const signatureResponse = await fetch('/api/uploads/cloudinary-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: 'uploads' }),
      })

      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature')
      }

      const { timestamp, signature, apiKey, cloudName } = await signatureResponse.json()

      // Create form data for Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('folder', 'uploads')

      // Upload directly to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text()
        throw new Error(`Cloudinary upload failed: ${errorData}`)
      }

      const result = await uploadResponse.json()
      return result.secure_url
    } catch (error) {
      console.warn('Cloudinary upload failed, falling back to local upload:', error)
      // Fallback to local upload
      return await uploadToLocal(file)
    }
  }

  const uploadToLocal = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const uploadResponse = await fetch('/api/uploads/local', {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      if (errorData.requiresCloudinary) {
        throw new Error('Cloudinary configuration required. Please contact administrator.')
      }
      throw new Error(`Local upload failed: ${errorData.error || 'Unknown error'}`)
    }

    const result = await uploadResponse.json()
    return result.url
  }

  const handleUpload = useCallback(async (files: FileList) => {
    if (disabled || files.length === 0) return
    
    setUploading(true)
    
    try {
      const newImages: string[] = []
      
      for (let i = 0; i < Math.min(files.length, maxImages - value.length); i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn(`File ${file.name} is not an image`)
          continue
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`File ${file.name} is too large (max 5MB)`)
          continue
        }
        
        try {
          const imageUrl = await uploadToCloudinary(file)
          newImages.push(imageUrl)
        } catch (error) {
          console.error('Upload failed:', error)
          // Skip this file if upload fails completely
          continue
        }
      }
      
      onChange([...value, ...newImages])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }, [value, onChange, maxImages, disabled])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleUpload(files)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const files = event.dataTransfer.files
    if (files) {
      handleUpload(files)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const canUploadMore = value.length < maxImages

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors",
            dragOver && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mb-4">
                {uploading ? (
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                )}
              </div>
                             <div className="mb-4">
                 <h3 className="text-lg font-medium mb-2">Upload Images</h3>
                 <p className="text-xs text-muted-foreground">
                   Drag and drop images here, or click to select files
                 </p>
                 <p className="text-xs text-muted-foreground mt-1">
                   Supports: JPG, PNG, WebP (max 5MB each)
                 </p>
               </div>
              
              <div className="flex items-center gap-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || uploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Select Images
                    </>
                  )}
                </Button>
                
                {value.length > 0 && (
                  <Badge variant="secondary">
                    {value.length}/{maxImages} uploaded
                  </Badge>
                )}
              </div>
              
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                
                {/* Remove button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {/* Primary badge */}
                {index === 0 && (
                  <Badge className="absolute bottom-2 left-2 bg-amber-500 hover:bg-amber-600">
                    Primary
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}


    </div>
  )
}
