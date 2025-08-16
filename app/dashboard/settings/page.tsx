"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, 
  Lock, 
  Camera, 
  Edit3,
  Save,
  Loader,
  Eye,
  EyeOff,
  Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  avatar?: string
  coverImage?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function DashboardSettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otp, setOtp] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "Product designer with 5+ years of experience in creating user-centered digital solutions. Passionate about solving complex problems through simple and elegant designs."
  })
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(" ") || ["", ""]
      setProfileData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email || "",
        phone: "+1 (555) 123-4567", // Default placeholder
        avatar: "https://i.pravatar.cc/100?img=68"
      }))
    }
  }, [session])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
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

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === 'avatar') {
        setProfileData(prev => ({ ...prev, avatar: result }))
      } else {
        setProfileData(prev => ({ ...prev, coverImage: result }))
      }
      
      toast({
        title: "Success",
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover image'} updated successfully!`,
        variant: "default",
      })
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

      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${email}`,
        variant: "default",
      })
      setOtpSent(true)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      })
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
          email: isChangingEmail ? newEmail : profileData.email, 
          otp,
          type: isChangingEmail ? 'email' : 'password'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid OTP')
      }

      toast({
        title: "Success",
        description: "OTP verified successfully!",
        variant: "default",
      })
      setOtpVerified(true)
      setOtp("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid OTP",
        variant: "destructive",
      })
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail.trim() || newEmail === profileData.email) {
      toast({
        title: "Error",
        description: "Please enter a different email address",
        variant: "destructive",
      })
      return
    }

    if (!newEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsChangingEmail(true)
    // Send OTP to current email first
    await sendOTP(profileData.email, 'email')
  }

  const handlePasswordReset = async () => {
    setIsChangingPassword(true)
    await sendOTP(profileData.email, 'password')
  }

  const handleSave = async () => {
    // Basic validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!profileData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          bio: profileData.bio,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      })
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
      setNewEmail("")
      setOtpVerified(false)
      setOtpSent(false)
      setIsChangingEmail(false)
      
      toast({
        title: "Success",
        description: "Email updated successfully!",
        variant: "default",
      })
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

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
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

  const navigationItems = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ]

  const displayName = session?.user?.name || "Alex Johnson"
  const initials = (displayName || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'avatar')}
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'cover')}
      />

      {/* Cover Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-20 overflow-hidden">
        {profileData.coverImage && (
          <img 
            src={profileData.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80" />
        
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/90 hover:bg-white"
            onClick={() => coverFileInputRef.current?.click()}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>
      </div>

      {/* Profile Avatar - Positioned below cover */}
      <div className="px-8 mb-8">
        <div className="flex items-end gap-6">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profileData.avatar} alt={displayName} />
              <AvatarFallback className="text-2xl font-semibold bg-gray-200">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute bottom-2 right-2 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile picture"
            >
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{displayName}</h1>
            <p className="text-gray-600">Senior Product Designer</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          activeTab === item.id
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            placeholder="Enter your first name"
                            className={cn(
                              "transition-colors",
                              !profileData.firstName.trim() && "border-red-300 focus:border-red-500"
                            )}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            placeholder="Enter your last name"
                            className={cn(
                              "transition-colors",
                              !profileData.lastName.trim() && "border-red-300 focus:border-red-500"
                            )}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              disabled
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={handleEmailChange}
                              disabled={isChangingEmail}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Change
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      {/* Email Change OTP Section */}
                      {isChangingEmail && (
                        <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                          <h3 className="font-semibold text-blue-900 mb-3">Change Email Address</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newEmail">New Email Address</Label>
                              <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email address"
                                className="mt-1"
                              />
                            </div>
                            
                            {otpSent && (
                              <div>
                                <Label htmlFor="otp">Enter OTP</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="flex-1"
                                  />
                                  <Button onClick={verifyOTP} disabled={!otp.trim()}>
                                    Verify
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  OTP sent to your current email address
                                </p>
                              </div>
                            )}
                            
                            {otpVerified && (
                              <Button 
                                onClick={handleEmailUpdate}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {loading ? (
                                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Update Email
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2 mt-6">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                      
                      <div className="flex justify-end mt-6">
                        <Button 
                          onClick={handleSave} 
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? (
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                    
                    {/* Password Change Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handlePasswordReset}
                          disabled={isChangingPassword}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </div>

                      {isChangingPassword && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <h3 className="font-semibold text-blue-900 mb-3">Change Password</h3>
                          
                          {!otpSent ? (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600">
                                Click "Send OTP" to receive a verification code on your email
                              </p>
                              <Button 
                                onClick={handlePasswordReset}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send OTP
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="otp">Enter OTP</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="flex-1"
                                  />
                                  <Button onClick={verifyOTP} disabled={!otp.trim()}>
                                    Verify
                                  </Button>
                                </div>
                              </div>

                              {otpVerified && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                      <Input
                                        id="currentPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                                        placeholder="Enter current password"
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                      <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                        placeholder="Enter new password"
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                      >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                      <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                        placeholder="Confirm new password"
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  <Button 
                                    onClick={handlePasswordUpdate}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
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
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


