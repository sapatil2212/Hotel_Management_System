"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Lock, 
  Camera, 
  Edit3,
  Save,
  Loader,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Upload,
  X,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchUserData, updateUserProfile, updateUserAvatar } from "@/lib/slices/userSlice"

interface ProfileData {
  name: string
  email: string
  phone: string
  avatar?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string; percentage: number } => {
  if (password.length === 0) return { strength: 'weak', color: 'bg-gray-200', percentage: 0 }
  
  let score = 0
  if (password.length >= 8) score += 20
  if (/(?=.*[a-z])/.test(password)) score += 20
  if (/(?=.*[A-Z])/.test(password)) score += 20
  if (/(?=.*\d)/.test(password)) score += 20
  if (/(?=.*[@$!%*?&])/.test(password)) score += 20
  
  if (score <= 40) return { strength: 'weak', color: 'bg-red-500', percentage: score }
  if (score <= 80) return { strength: 'medium', color: 'bg-yellow-500', percentage: score }
  return { strength: 'strong', color: 'bg-green-500', percentage: score }
}

export default function EnhancedSettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const { currentUser, loading: reduxLoading } = useAppSelector((state: any) => state.user)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)
  const [newEmail, setNewEmail] = useState("")
  
  // Form states
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] })
  
  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
  })
  
  // Password data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user data from database using Redux
  const loadUserData = async () => {
    if (!session?.user?.id) return

    try {
      setLoadingUser(true)
      await dispatch(fetchUserData(session.user.id))
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData()
    }
  }, [session])

  // Update profile data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      })
    }
  }, [currentUser])

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  // Check for changes
  useEffect(() => {
    if (currentUser) {
      const hasProfileChanges = 
        profileData.name !== currentUser.name ||
        profileData.phone !== currentUser.phone
      
      setHasChanges(hasProfileChanges)
    }
  }, [profileData, currentUser])

  // Password validation effect
  useEffect(() => {
    if (passwordData.newPassword) {
      const validation = validatePassword(passwordData.newPassword)
      setPasswordValidation(validation)
    } else {
      setPasswordValidation({ isValid: false, errors: [] })
    }
  }, [passwordData.newPassword])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Name validation
    if (!profileData.name.trim()) {
      errors.name = "Name is required"
    } else if (profileData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long"
    }
    
    // Email validation
    if (!profileData.email.trim()) {
      errors.email = "Email is required"
    } else if (!validateEmail(profileData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Phone validation (optional but validate if provided)
    if (profileData.phone.trim() && !validatePhone(profileData.phone)) {
      errors.phone = "Please enter a valid phone number"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingAvatar(true)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const result = e.target?.result as string
      
      try {
        // Upload avatar using Redux
        await dispatch(updateUserAvatar(result))
        
        // Update session with new avatar
        await updateSession({
          user: {
            ...session?.user,
            image: result,
          }
        })
        
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
          variant: "default",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload profile picture",
          variant: "destructive",
        })
      } finally {
        setUploadingAvatar(false)
      }
    }
    
    reader.readAsDataURL(file)
  }

  const sendOTP = async (email: string, type: 'email' | 'password') => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send OTP')
      }

      setOtpTimer(300) // 5 minutes
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      })
      throw error
    }
  }

  const verifyOTP = async () => {
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter OTP",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: profileData.email,
          otp,
          type: isChangingEmail ? 'email' : 'password'
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Invalid OTP')
      }

      toast({
        title: "Success",
        description: "OTP verified successfully!",
        variant: "default",
      })
      setOtpVerified(true)
      setOtp("")
    } catch (error) {
      console.error('OTP verification error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid OTP",
        variant: "destructive",
      })
    }
  }

  const handleEmailChange = async () => {
    setIsChangingEmail(true)
    setNewEmail("")
    setOtp("")
    setOtpVerified(false)
    setOtpSent(false)
  }

  const handleSendEmailOtp = async () => {
    if (!newEmail.trim() || newEmail === profileData.email) {
      toast({
        title: "Error",
        description: "Please enter a different email address",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(newEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      await sendOTP(profileData.email, 'email')
      setOtpSent(true)
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${profileData.email}`,
        variant: "default",
      })
    } catch (error) {
      // Error is already handled in sendOTP function
    }
  }

  const handlePasswordReset = async () => {
    setIsChangingPassword(true)
    try {
      await sendOTP(profileData.email, 'password')
      setOtpSent(true)
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${profileData.email}`,
        variant: "default",
      })
    } catch (error) {
      // Error is already handled in sendOTP function
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await dispatch(updateUserProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
      }))
      
      // Update session with new user data
      await updateSession({
        user: {
          ...session?.user,
          name: profileData.name.trim(),
          email: profileData.email.trim(),
        }
      })
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      })
      
      // Refresh user data after successful update
      await loadUserData()
      setHasChanges(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailUpdate = async () => {
    if (!otpVerified) {
      toast({
        title: "Error",
        description: "Please verify OTP first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail,
          otp,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update email')
      }

      setProfileData(prev => ({ ...prev, email: newEmail }))
      
      // Update session with new email
      await updateSession({
        user: {
          ...session?.user,
          email: newEmail,
        }
      })
      
      setNewEmail("")
      setOtpVerified(false)
      setOtpSent(false)
      setIsChangingEmail(false)
      
      toast({
        title: "Success",
        description: "Email updated successfully!",
        variant: "default",
      })
      
      // Refresh user data after successful update
      await loadUserData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!otpVerified) {
      toast({
        title: "Error",
        description: "Please verify OTP first",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (!passwordValidation.isValid) {
      toast({
        title: "Error",
        description: "Password does not meet security requirements",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          otp,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update password')
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setOtpVerified(false)
      setOtpSent(false)
      setIsChangingPassword(false)
      
      toast({
        title: "Success",
        description: "Password updated successfully!",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const displayName = currentUser?.name || profileData.name || session?.user?.name || "User"
  const initials = (displayName || "U")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Account Settings
          </h1>
          <p className="text-gray-600 text-lg">Manage your account information and security settings</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Avatar Section */}
          <div className="xl:col-span-1">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <div className="relative inline-block group">
                  <Avatar className="h-36 w-36 border-4 border-white ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all duration-300">
                    <AvatarImage 
                      src={currentUser?.avatarUrl || profileData.avatar || "https://i.pravatar.cc/100?img=68"} 
                      alt={displayName} 
                    />
                    <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    className="absolute bottom-3 right-3 h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="Upload profile picture"
                  >
                    {uploadingAvatar ? (
                      <Loader className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4 font-medium">
                  Click the camera icon to update your profile picture
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border border-gray-200 bg-white shadow-sm mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Info className="h-5 w-5 text-green-600" />
                  </div>
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">Role</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {currentUser?.role?.toLowerCase() || 'User'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Member Since</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Last Updated</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {currentUser?.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form Section */}
          <div className="xl:col-span-3 space-y-6">
            {/* Personal Information Card */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className={cn(
                        "h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200",
                        validationErrors.name && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        className={cn(
                          "h-12 pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200",
                          validationErrors.phone && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        )}
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address *
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="h-12 pl-10 border-gray-200 bg-gray-50 text-gray-600"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleEmailChange}
                      disabled={isChangingEmail}
                      className="h-12 px-6 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Email Change OTP Section */}
                {isChangingEmail && (
                  <div className="p-6 border border-blue-200 rounded-xl bg-blue-50/50">
                    <h3 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Change Email Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newEmail" className="text-sm font-semibold text-gray-700">
                          New Email Address
                        </Label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                          className="mt-2 h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        />
                      </div>
                      
                      {!otpSent ? (
                        <Button 
                          onClick={handleSendEmailOtp}
                          disabled={!newEmail.trim() || newEmail === profileData.email || !validateEmail(newEmail)}
                          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Verification OTP
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              OTP sent to <strong>{profileData.email}</strong>
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              Please check your current email and enter the verification code below.
                            </p>
                            {otpTimer > 0 && (
                              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time remaining: {formatTime(otpTimer)}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                              Verification Code
                            </Label>
                            <div className="flex gap-3 mt-2">
                              <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="flex-1 h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                                maxLength={6}
                              />
                              <Button 
                                onClick={verifyOTP} 
                                disabled={!otp.trim() || otp.length < 6}
                                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                          
                          {otpVerified && (
                            <Button 
                              onClick={handleEmailUpdate}
                              disabled={loading}
                              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                            >
                              {loading ? (
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              Update Email Address
                            </Button>
                          )}
                          
                          <div className="flex gap-3">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setOtpSent(false)
                                setOtp("")
                                setOtpVerified(false)
                                setOtpTimer(0)
                              }}
                              className="h-10 px-4"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={handleSendEmailOtp}
                              disabled={otpTimer > 0}
                              className="h-10 px-4"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : 'Resend OTP'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings Card */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Password</h3>
                    <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handlePasswordReset}
                    disabled={isChangingPassword}
                    className="h-12 px-6 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                {isChangingPassword && (
                  <div className="p-6 border border-green-200 rounded-xl bg-green-50/50">
                    <h3 className="font-semibold text-green-900 mb-4 text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </h3>
                    
                    {!otpSent ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            We'll send a verification code to your email address
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            Email: <strong>{profileData.email}</strong>
                          </p>
                        </div>
                        <Button 
                          onClick={handlePasswordReset}
                          className="h-12 px-6 bg-green-600 hover:bg-green-700 transition-all duration-200"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Verification Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-4 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Verification code sent to <strong>{profileData.email}</strong>
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            Please check your email and enter the 6-digit code below.
                          </p>
                          {otpTimer > 0 && (
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Time remaining: {formatTime(otpTimer)}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                            Verification Code
                          </Label>
                          <div className="flex gap-3 mt-2">
                            <Input
                              id="otp"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="Enter 6-digit code"
                              className="flex-1 h-12 border-green-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                              maxLength={6}
                            />
                            <Button 
                              onClick={verifyOTP} 
                              disabled={!otp.trim() || otp.length < 6}
                              className="h-12 px-6 bg-green-600 hover:bg-green-700 transition-all duration-200"
                            >
                              Verify
                            </Button>
                          </div>
                        </div>

                        {otpVerified && (
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                                New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  type={showNewPassword ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                  placeholder="Enter new password"
                                  className="h-12 border-green-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 pr-12"
                                />
                                <button
                                  type="button"
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                              
                              {/* Password strength indicator */}
                              {passwordData.newPassword && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Password strength:</span>
                                    <span className={cn(
                                      "font-medium",
                                      passwordStrength.strength === 'weak' && "text-red-600",
                                      passwordStrength.strength === 'medium' && "text-yellow-600",
                                      passwordStrength.strength === 'strong' && "text-green-600"
                                    )}>
                                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={cn("h-2 rounded-full transition-all duration-300", passwordStrength.color)}
                                      style={{ width: `${passwordStrength.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {/* Password validation errors */}
                              {passwordData.newPassword && passwordValidation.errors.length > 0 && (
                                <div className="space-y-1">
                                  {passwordValidation.errors.map((error, index) => (
                                    <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                                      <AlertCircle className="h-4 w-4" />
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                                Confirm New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                  placeholder="Confirm new password"
                                  className={cn(
                                    "h-12 border-green-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 pr-12",
                                    passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                  )}
                                />
                                <button
                                  type="button"
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  Passwords do not match
                                </p>
                              )}
                            </div>

                            <Button 
                              onClick={handlePasswordUpdate}
                              disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword || !passwordValidation.isValid}
                              className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200"
                            >
                              {loading ? (
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              Update Password
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setOtpSent(false)
                              setOtp("")
                              setOtpVerified(false)
                              setOtpTimer(0)
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: ""
                              })
                            }}
                            className="h-10 px-4"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={handlePasswordReset}
                            disabled={otpTimer > 0}
                            className="h-10 px-4"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : 'Resend Code'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSave} 
                disabled={loading || reduxLoading || !hasChanges}
                className="h-14 px-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 text-lg font-semibold disabled:opacity-50 disabled:transform-none"
                size="lg"
              >
                {loading || reduxLoading ? (
                  <Loader className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-3" />
                )}
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
