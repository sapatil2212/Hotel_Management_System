import { v2 as cloudinary } from 'cloudinary'

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary configuration missing:', {
    cloudName: cloudName ? 'set' : 'missing',
    apiKey: apiKey ? 'set' : 'missing',
    apiSecret: apiSecret ? 'set' : 'missing'
  })
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
}

export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'avatars',
  public_id?: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
          })
        } else {
          reject(new Error('Upload failed'))
        }
      }
    )

    uploadStream.end(file)
  })
}

export const deleteFromCloudinary = async (public_id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export default cloudinary
