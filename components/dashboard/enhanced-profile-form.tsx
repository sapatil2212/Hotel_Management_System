"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { User, Lock, Camera, Save, Loader, Eye, EyeOff, Mail, Phone, Shield, CheckCircle, AlertCircle, Clock, RefreshCw, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/lib/hooks"
import { updateUserEmail } from "@/lib/slices/userSlice"
import { useSession } from "next-auth/react"

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100
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

interface ProfileData {
  name: string
  email: string
  phone: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface EmailChangeData {
  newEmail: string
  otp: string
}

interface EnhancedProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    phone: string
    role: string
    avatarUrl?: string
    createdAt: string
    updatedAt: string
  }
  onUpdate: (data: ProfileData) => Promise<void>
  onAvatarUpdate: (avatarUrl: string) => Promise<void>
  onPasswordUpdate: (data: PasswordData) => Promise<void>
}

export default function EnhancedProfileForm({ user, onUpdate, onAvatarUpdate, onPasswordUpdate }: EnhancedProfileFormProps) {
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const { data: session, update: updateSession } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] })
  
  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  })
  
  // Password data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Email change modal states with persistence
  const [showEmailModal, setShowEmailModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailModalState')
      return saved ? JSON.parse(saved).showEmailModal : false
    }
    return false
  })
  
  const [emailChangeData, setEmailChangeData] = useState<EmailChangeData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailModalState')
      return saved ? JSON.parse(saved).emailChangeData : { newEmail: "", otp: "" }
    }
    return { newEmail: "", otp: "" }
  })
  
  const [otpSent, setOtpSent] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailModalState')
      return saved ? JSON.parse(saved).otpSent : false
    }
    return false
  })
  
  const [otpVerified, setOtpVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailModalState')
      return saved ? JSON.parse(saved).otpVerified : false
    }
    return false
  })
  
  const [otpTimer, setOtpTimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailModalState')
      return saved ? JSON.parse(saved).otpTimer : 0
    }
    return 0
  })
  
  // Loading states for email modal
  const [emailLoading, setEmailLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  
     // Forgot password modal states with persistence
   const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).showForgotPasswordModal : false
     }
     return false
   })
   const [forgotPasswordOtp, setForgotPasswordOtp] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).forgotPasswordOtp : ""
     }
     return ""
   })
   const [forgotPasswordOtpSent, setForgotPasswordOtpSent] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).forgotPasswordOtpSent : false
     }
     return false
   })
   const [forgotPasswordOtpVerified, setForgotPasswordOtpVerified] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).forgotPasswordOtpVerified : false
     }
     return false
   })
   const [forgotPasswordOtpTimer, setForgotPasswordOtpTimer] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).forgotPasswordOtpTimer : 0
     }
     return 0
   })
   const [sendingForgotPasswordOtp, setSendingForgotPasswordOtp] = useState(false)
   const [verifyingForgotPasswordOtp, setVerifyingForgotPasswordOtp] = useState(false)
   const [newPasswordForForgot, setNewPasswordForForgot] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).newPasswordForForgot : ""
     }
     return ""
   })
   const [confirmPasswordForForgot, setConfirmPasswordForForgot] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('forgotPasswordModalState')
       return saved ? JSON.parse(saved).confirmPasswordForForgot : ""
     }
     return ""
   })
   const [showNewPasswordForForgot, setShowNewPasswordForForgot] = useState(false)
   const [showConfirmPasswordForForgot, setShowConfirmPasswordForForgot] = useState(false)
   const [updatingPasswordForForgot, setUpdatingPasswordForForgot] = useState(false)
  
  // Debug: Log component re-renders (moved after state declarations)
  // Only log when modal is open to reduce console spam
  useEffect(() => {
    if (showEmailModal) {
      console.log('EnhancedProfileForm re-rendered', {
        showEmailModal,
        emailChangeData,
        otpSent,
        otpVerified,
        otpTimer
      })
    }
  }, [showEmailModal, emailChangeData, otpSent, otpVerified, otpTimer])

  // Function to save modal state to localStorage
  const saveModalState = (updates: Partial<{
    showEmailModal: boolean
    emailChangeData: EmailChangeData
    otpSent: boolean
    otpVerified: boolean
    otpTimer: number
  }>) => {
    if (typeof window !== 'undefined') {
      const currentState = {
        showEmailModal,
        emailChangeData,
        otpSent,
        otpVerified,
        otpTimer,
        ...updates
      }
      localStorage.setItem('emailModalState', JSON.stringify(currentState))
      
      // Log state changes for debugging
      console.log('Modal state saved:', currentState)
    }
  }

     // Function to clear modal state from localStorage
   const clearModalState = () => {
     if (typeof window !== 'undefined') {
       localStorage.removeItem('emailModalState')
     }
   }

   // Function to save forgot password modal state to localStorage
   const saveForgotPasswordModalState = (updates: Partial<{
     showForgotPasswordModal: boolean
     forgotPasswordOtp: string
     forgotPasswordOtpSent: boolean
     forgotPasswordOtpVerified: boolean
     forgotPasswordOtpTimer: number
     newPasswordForForgot: string
     confirmPasswordForForgot: string
   }>) => {
     if (typeof window !== 'undefined') {
       const currentState = {
         showForgotPasswordModal,
         forgotPasswordOtp,
         forgotPasswordOtpSent,
         forgotPasswordOtpVerified,
         forgotPasswordOtpTimer,
         newPasswordForForgot,
         confirmPasswordForForgot,
         ...updates
       }
       localStorage.setItem('forgotPasswordModalState', JSON.stringify(currentState))
       
       // Log state changes for debugging
       console.log('Forgot password modal state saved:', currentState)
     }
   }

   // Function to clear forgot password modal state from localStorage
   const clearForgotPasswordModalState = () => {
     if (typeof window !== 'undefined') {
       localStorage.removeItem('forgotPasswordModalState')
     }
   }

  // Synchronize state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailModalState')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          console.log('Restored modal state from localStorage:', parsed)
        } catch (error) {
          console.error('Error parsing saved modal state:', error)
          clearModalState()
        }
      }
    }
  }, [])

  // Prevent page refresh during form interaction
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showEmailModal && (emailChangeData.newEmail || emailChangeData.otp)) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes in the email update form. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    // Only add the event listener in production or when not in development hot reload
    if (process.env.NODE_ENV === 'production' || !window.location.href.includes('localhost')) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [showEmailModal, emailChangeData])

  // OTP timer effect - optimized to reduce re-renders
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev: number) => {
          const newTimer = prev - 1
          // Only save to localStorage every 10 seconds to reduce writes
          if (newTimer % 10 === 0) {
            saveModalState({ otpTimer: newTimer })
          }
          return newTimer
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

     // Forgot password OTP timer effect
   useEffect(() => {
     let interval: NodeJS.Timeout
     if (forgotPasswordOtpTimer > 0) {
       interval = setInterval(() => {
         setForgotPasswordOtpTimer((prev: number) => {
           const newTimer = prev - 1
           // Only save to localStorage every 10 seconds to reduce writes
           if (newTimer % 10 === 0) {
             saveForgotPasswordModalState({ forgotPasswordOtpTimer: newTimer })
           }
           return newTimer
         })
       }, 1000)
     }
     return () => clearInterval(interval)
   }, [forgotPasswordOtpTimer])

  // Check for changes (excluding email since it has its own modal)
  const checkForChanges = () => {
    const hasProfileChanges = 
      profileData.name.trim() !== (user.name || "").trim() ||
      profileData.phone.trim() !== (user.phone || "").trim()
    setHasChanges(hasProfileChanges)
  }

  // Check for changes whenever profileData or user changes
  useEffect(() => {
    checkForChanges()
  }, [profileData, user])

  // Password validation effect
  const validatePasswordField = (password: string) => {
    if (password) {
      const validation = validatePassword(password)
      setPasswordValidation(validation)
    } else {
      setPasswordValidation({ isValid: false, errors: [] })
    }
  }

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
    
    if (field === 'newPassword') {
      validatePasswordField(value)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Name validation
    if (!profileData.name.trim()) {
      errors.name = "Name is required"
    } else if (!validateName(profileData.name)) {
      errors.name = "Name must be between 2 and 100 characters"
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
    
    try {
      // Create FormData to send the file
      const formData = new FormData()
      formData.append('file', file)

      // Upload the file directly
      const response = await fetch('/api/users/enhanced-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload avatar')
      }

      const result = await response.json()
      
      // Call the onAvatarUpdate callback with the new URL
      await onAvatarUpdate(result.avatarUrl)
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSavePersonalInfo = async () => {
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
      await onUpdate({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
      })
      
      toast({
        title: "Success",
        description: "Personal information updated successfully!",
        variant: "default",
      })
      
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update personal information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
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
      // Update the password directly (current password verification is handled in the API)
      await onPasswordUpdate(passwordData)
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
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

  const handleForgotPassword = async () => {
    setForgotPasswordLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: profileData.email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send password reset OTP')
      }

             // Set all the necessary states to show the OTP input
       setForgotPasswordOtpSent(true)
       setForgotPasswordOtpTimer(60) // 1 minute timer
       setShowForgotPasswordModal(true)
       setForgotPasswordOtpVerified(false) // Reset verification state
       setNewPasswordForForgot("") // Clear any previous password data
       setConfirmPasswordForForgot("") // Clear any previous password data
       
       // Save state to localStorage
       saveForgotPasswordModalState({
         showForgotPasswordModal: true,
         forgotPasswordOtpSent: true,
         forgotPasswordOtpTimer: 60,
         forgotPasswordOtpVerified: false,
         newPasswordForForgot: "",
         confirmPasswordForForgot: ""
       })
       
       console.log('Forgot password states set:', {
         otpSent: true,
         timer: 60,
         modalOpen: true,
         verified: false
       })
      
      toast({
        title: "OTP Sent",
        description: "Password reset OTP has been sent to your email",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send password reset OTP",
        variant: "destructive",
      })
    } finally {
      setForgotPasswordLoading(false)
    }
  }

     const handleSendForgotPasswordOtp = async () => {
     setSendingForgotPasswordOtp(true)
     try {
       const response = await fetch('/api/auth/forgot-password/request-otp', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email: profileData.email }),
       })

       if (!response.ok) {
         const error = await response.json()
         throw new Error(error.error || 'Failed to send password reset OTP')
       }

       // Clear any existing OTP input when requesting a new one
       setForgotPasswordOtp("")
       setForgotPasswordOtpVerified(false)
       setForgotPasswordOtpTimer(60) // 1 minute timer
       
       // Save state to localStorage
       saveForgotPasswordModalState({
         forgotPasswordOtp: "",
         forgotPasswordOtpVerified: false,
         forgotPasswordOtpTimer: 60
       })
       
       toast({
         title: "OTP Resent",
         description: "New password reset OTP has been sent to your email",
         variant: "default",
       })
     } catch (error) {
       toast({
         title: "Error",
         description: error instanceof Error ? error.message : "Failed to send password reset OTP",
         variant: "destructive",
       })
     } finally {
       setSendingForgotPasswordOtp(false)
     }
   }

  const handleVerifyForgotPasswordOtp = async () => {
    if (!forgotPasswordOtp.trim()) {
      toast({
        title: "Error",
        description: "Please enter OTP",
        variant: "destructive",
      })
      return
    }

    setVerifyingForgotPasswordOtp(true)
    try {
      const response = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: profileData.email,
          otp: forgotPasswordOtp,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Invalid OTP')
      }

             setForgotPasswordOtpVerified(true)
       saveForgotPasswordModalState({ forgotPasswordOtpVerified: true })
       
       toast({
         title: "Success",
         description: "OTP verified successfully! You can now set your new password.",
         variant: "default",
       })
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "The verification code you entered is incorrect. Please check your email and try again.",
        variant: "destructive",
      })
      
      setForgotPasswordOtp("")
    } finally {
      setVerifyingForgotPasswordOtp(false)
    }
  }

  const handleUpdatePasswordForForgot = async () => {
    if (newPasswordForForgot !== confirmPasswordForForgot) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    const passwordValidation = validatePassword(newPasswordForForgot)
    if (!passwordValidation.isValid) {
      toast({
        title: "Error",
        description: "Password does not meet security requirements",
        variant: "destructive",
      })
      return
    }

    setUpdatingPasswordForForgot(true)
    try {
             const response = await fetch('/api/auth/forgot-password/reset-password', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ 
           email: profileData.email,
           newPassword: newPasswordForForgot,
         }),
       })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reset password')
      }

      toast({
        title: "Success",
        description: "Password reset successfully! You can now login with your new password.",
        variant: "default",
      })

             // Close modal and reset all states
       setShowForgotPasswordModal(false)
       setForgotPasswordOtp("")
       setForgotPasswordOtpSent(false)
       setForgotPasswordOtpVerified(false)
       setForgotPasswordOtpTimer(0)
       setNewPasswordForForgot("")
       setConfirmPasswordForForgot("")
       clearForgotPasswordModalState()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setUpdatingPasswordForForgot(false)
    }
  }

  // Email change modal functions
  const sendOTP = async (email: string, type: 'email' | 'password') => {
    setSendingOtp(true)
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

             setOtpTimer(60) // 1 minute
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      })
      throw error
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyOTP = async () => {
    if (!emailChangeData.otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter OTP",
        variant: "destructive",
      })
      return
    }

    setVerifyingOtp(true)
    console.log('Verifying OTP:', {
      email: profileData.email,
      otp: emailChangeData.otp,
      type: 'email'
    })

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: profileData.email,
          otp: emailChangeData.otp,
          type: 'email'
        }),
      })

      const responseData = await response.json()
      console.log('OTP verification response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Invalid OTP')
      }

      // Set OTP as verified and save state
      setOtpVerified(true)
      saveModalState({ otpVerified: true })
      
      toast({
        title: "Success",
        description: "OTP verified successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error('OTP verification error:', error)
      toast({
        title: "Invalid OTP",
        description: "The verification code you entered is incorrect. Please check your email and try again, or request a new OTP.",
        variant: "destructive",
      })
      
      // Clear the OTP input field for better UX
      setEmailChangeData(prev => ({ ...prev, otp: "" }))
      saveModalState({ emailChangeData: { ...emailChangeData, otp: "" } })
    } finally {
      setVerifyingOtp(false)
    }
  }

    const handleSendEmailOtp = async () => {
    if (!emailChangeData.newEmail.trim() || emailChangeData.newEmail === profileData.email) {
      toast({
        title: "Error",
        description: "Please enter a different email address",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(emailChangeData.newEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      // Clear any existing OTP input when requesting a new one
      setEmailChangeData(prev => ({ ...prev, otp: "" }))
      setOtpVerified(false)
      setOtpTimer(0) // Reset timer immediately
      saveModalState({ 
        emailChangeData: { ...emailChangeData, otp: "" },
        otpVerified: false,
        otpTimer: 0
      })
      
      await sendOTP(profileData.email, 'email')
      setOtpSent(true)
      saveModalState({ otpSent: true })
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${profileData.email}`,
        variant: "default",
      })
    } catch (error) {
      // Error is already handled in sendOTP function
    }
  }

    const handleEmailUpdateDirect = async () => {
    console.log('Updating email directly after OTP verification:', {
      newEmail: emailChangeData.newEmail,
      otp: emailChangeData.otp
    })

    setEmailLoading(true)
    try {
      // Use Redux action to update email
      const result = await dispatch(updateUserEmail({
        newEmail: emailChangeData.newEmail,
        otp: emailChangeData.otp,
      })).unwrap()

      console.log('Email update response:', result)

      // Update profile data immediately
      setProfileData(prev => ({ ...prev, email: emailChangeData.newEmail }))
      
      // Update NextAuth session with new email
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          email: emailChangeData.newEmail
        }
      })
      
      // Show success state
      setEmailUpdateSuccess(true)
      
      toast({
        title: "Success",
        description: "Email updated successfully!",
        variant: "default",
      })
      
      // Clear all OTP-related state after a delay
      setTimeout(() => {
        setEmailChangeData({ newEmail: "", otp: "" })
        setOtpVerified(false)
        setOtpSent(false)
        setOtpTimer(0)
        setShowEmailModal(false)
        setEmailUpdateSuccess(false)
        clearModalState()
      }, 3000) // Increased delay for better UX
    } catch (error) {
      console.error('Email update error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update email",
        variant: "destructive",
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleEmailUpdate = async () => {
    // Double-check OTP verification status
    if (!otpVerified) {
      toast({
        title: "Error",
        description: "Please verify OTP first",
        variant: "destructive",
      })
      return
    }

    // Ensure we have the required data
    if (!emailChangeData.newEmail || !emailChangeData.otp) {
      toast({
        title: "Error",
        description: "Missing required data for email update",
        variant: "destructive",
      })
      return
    }

    await handleEmailUpdateDirect()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Memoized timer display to prevent unnecessary re-renders
  const timerDisplay = React.useMemo(() => {
    if (otpTimer > 0) {
      return formatTime(otpTimer)
    }
    return null
  }, [otpTimer])

  const displayName = user?.name || "User"
  const initials = (displayName || "U")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Profile Avatar Section */}
         <Card className="border border-gray-200 bg-white shadow-sm">
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
               <div className="p-1.5 bg-blue-50 rounded-lg">
                 <User className="h-4 w-4 text-blue-600" />
               </div>
               Profile Picture
             </CardTitle>
           </CardHeader>
           <CardContent className="text-center pt-0">
             <div className="relative inline-block group">
               <Avatar className="h-28 w-28 border-4 border-white ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all duration-300 shadow-lg">
                 <AvatarImage 
                   src={user?.avatarUrl || "https://i.pravatar.cc/100?img=68"} 
                   alt={displayName} 
                 />
                 <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700">
                   {initials}
                 </AvatarFallback>
               </Avatar>
               
               {/* Upload Overlay */}
               <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                 <div className="text-center">
                   <Camera className="h-6 w-6 text-white mx-auto mb-1" />
                   <p className="text-xs text-white font-medium">Change Photo</p>
                 </div>
               </div>
               
               {/* Upload Button */}
               <button 
                 className="absolute -bottom-2 -right-2 h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 shadow-lg border-2 border-white"
                 onClick={() => fileInputRef.current?.click()}
                 disabled={uploadingAvatar}
                 title={uploadingAvatar ? "Uploading..." : "Upload profile picture"}
               >
                 {uploadingAvatar ? (
                   <Loader className="h-4 w-4 text-white animate-spin" />
                 ) : (
                   <Camera className="h-4 w-4 text-white" />
                 )}
               </button>
             </div>
             
             {/* Upload Info */}
             <div className="mt-4 space-y-2">
               <p className="text-sm text-gray-600 font-medium">
                 {displayName}
               </p>
               <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                 <div className="flex items-center gap-1">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span>JPG, PNG, GIF</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                   <span>Max 5MB</span>
                 </div>
               </div>
             </div>
             
             {/* Drag & Drop Zone */}
             <div 
               className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
               onClick={() => fileInputRef.current?.click()}
               onDragOver={(e) => {
                 e.preventDefault()
                 e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
               }}
               onDragLeave={(e) => {
                 e.preventDefault()
                 e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
               }}
               onDrop={(e) => {
                 e.preventDefault()
                 e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                 const files = e.dataTransfer.files
                 if (files.length > 0) {
                   const event = { target: { files } } as React.ChangeEvent<HTMLInputElement>
                   handleFileUpload(event)
                 }
               }}
             >
               <div className="text-center">
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                   <Camera className="h-5 w-5 text-blue-600" />
                 </div>
                 <p className="text-sm font-medium text-gray-700 mb-1">
                   Click to upload or drag and drop
                 </p>
                 <p className="text-xs text-gray-500">
                   Upload your profile picture here
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>

        {/* Personal Information Card */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={cn(
                    "h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200",
                    validationErrors.name && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  )}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className={cn(
                      "h-9 pl-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200",
                      validationErrors.phone && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    )}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              
                             <div className="space-y-2">
                 <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                   Email Address *
                 </Label>
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                     <Input
                       id="email"
                       type="email"
                       value={profileData.email}
                       disabled
                       className="h-9 pl-8 border-gray-200 bg-gray-50 text-gray-600"
                     />
                   </div>
                   <Button
                     variant="outline"
                     onClick={() => {
                       setShowEmailModal(true)
                       saveModalState({ showEmailModal: true })
                     }}
                     className="h-9 px-4 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-xs"
                   >
                    <Mail className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                 </div>
               </div>
             </div>

                           {/* Personal Information Save Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleSavePersonalInfo} 
                  disabled={loading || !hasChanges}
                  className="h-9 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 text-xs font-semibold disabled:opacity-50 w-full"
                >
                  {loading ? (
                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3 mr-1" />
                  )}
                  {loading ? 'Saving...' : (hasChanges ? 'Save Changes' : 'No Changes')}
                </Button>
              </div>
           </CardContent>
         </Card>

        {/* Security Settings Card */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <div className="p-1.5 bg-red-50 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              Security Settings
            </CardTitle>
          </CardHeader>
                     <CardContent className="space-y-4">
                           <div className="space-y-3">
                                <div className="space-y-2">
                   <Label htmlFor="currentPassword" className="text-xs font-semibold text-gray-700">
                     Current Password *
                   </Label>
                   <div className="relative">
                     <Input
                       id="currentPassword"
                       type="password"
                       value={passwordData.currentPassword}
                       onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                       placeholder="Enter current password"
                       className="h-9 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200"
                     />
                   </div>
                                       {/* Forgot Password Link */}
                    <div className="flex justify-end">
                                             <button
                         onClick={handleForgotPassword}
                         disabled={forgotPasswordLoading}
                         className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {forgotPasswordLoading ? (
                           <>
                             <Loader className="h-3 w-3 animate-spin" />
                             Sending OTP...
                           </>
                         ) : (
                           <>
                             Forgot Password?
                             <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                             </svg>
                           </>
                         )}
                       </button>
                    </div>
                 </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    className="h-9 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {passwordData.newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
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
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={cn("h-1.5 rounded-full transition-all duration-300", passwordStrength.color)}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Password validation errors */}
                {passwordData.newPassword && passwordValidation.errors.length > 0 && (
                  <div className="space-y-1">
                    {passwordValidation.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
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
                      "h-9 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 pr-10",
                      passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
              </div>

                                                                                                                       <Button 
                  onClick={handlePasswordUpdate}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword || !passwordValidation.isValid}
                  className="h-9 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs w-full"
                >
                  {loading ? (
                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3 mr-1" />
                  )}
                  {loading ? 'Verifying & Updating...' : 'Update Password'}
                </Button>
             </div>
           </CardContent>
         </Card>
             </div>

      {/* Email Change Modal */}
             <Dialog open={showEmailModal} onOpenChange={(open) => {
         setShowEmailModal(open)
         saveModalState({ showEmailModal: open })
         if (!open) {
           // Clear state when modal is closed
           clearModalState()
         }
       }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Change Email Address
            </DialogTitle>
            <DialogDescription>
              Update your email address. You'll need to verify your current email with an OTP.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEmail" className="text-sm font-semibold text-gray-700">
                New Email Address
              </Label>
                             <Input
                 id="newEmail"
                 type="email"
                 value={emailChangeData.newEmail}
                 onChange={(e) => {
                   const newData = { ...emailChangeData, newEmail: e.target.value }
                   setEmailChangeData(newData)
                   saveModalState({ emailChangeData: newData })
                 }}
                 placeholder="Enter new email address"
                 className="mt-2 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
               />
            </div>
            
                         {!otpSent ? (
               <Button 
                 onClick={handleSendEmailOtp}
                 disabled={!emailChangeData.newEmail.trim() || emailChangeData.newEmail === profileData.email || !validateEmail(emailChangeData.newEmail) || sendingOtp}
                 className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
               >
                 {sendingOtp ? (
                   <Loader className="h-4 w-4 mr-2 animate-spin" />
                 ) : (
                   <Mail className="h-4 w-4 mr-2" />
                 )}
                 {sendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}
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
                   <p className="text-xs text-blue-600 mt-1">
                     You can resend the OTP anytime if needed.
                   </p>
                                     {timerDisplay && (
                     <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                       <Clock className="h-4 w-4" />
                       OTP expires in: {timerDisplay}
                     </p>
                   )}
                </div>
                
                                 <div>
                   <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                     Verification Code
                   </Label>
                   <p className="text-xs text-gray-500 mt-1 mb-2">
                     Enter the 6-digit code sent to your email address
                   </p>
                   <div className="flex gap-3 mt-2">
                                         <Input
                       id="otp"
                       value={emailChangeData.otp}
                       onChange={(e) => {
                         const newData = { ...emailChangeData, otp: e.target.value }
                         setEmailChangeData(newData)
                         saveModalState({ emailChangeData: newData })
                       }}
                       placeholder="Enter 6-digit code"
                       className="flex-1 h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                       maxLength={6}
                     />
                                         <Button 
                       onClick={verifyOTP} 
                       disabled={!emailChangeData.otp.trim() || emailChangeData.otp.length < 6 || verifyingOtp || emailLoading}
                       className="h-12 px-6 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                     >
                       {verifyingOtp ? (
                         <Loader className="h-4 w-4 animate-spin" />
                       ) : (
                         'Verify'
                       )}
                     </Button>
                  </div>
                </div>
                
                                 {otpVerified && !emailUpdateSuccess && !emailLoading && (
                   <Button 
                     onClick={handleEmailUpdate}
                     disabled={emailLoading}
                     className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                   >
                     <Save className="h-4 w-4 mr-2" />
                     Update Email Address
                   </Button>
                 )}
                 
                 {emailLoading && (
                   <Button 
                     disabled
                     className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200"
                   >
                     <Loader className="h-4 w-4 mr-2 animate-spin" />
                     Updating Email...
                   </Button>
                 )}
                 
                 {emailUpdateSuccess && (
                   <Button 
                     disabled
                     className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 transition-all duration-200"
                   >
                     <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                     Email Updated Successfully!
                   </Button>
                 )}
                
                <div className="flex gap-3">
                                     <Button 
                     variant="outline"
                     onClick={() => {
                       setEmailChangeData({ newEmail: "", otp: "" })
                       setOtpSent(false)
                       setOtpVerified(false)
                       setOtpTimer(0)
                       setShowEmailModal(false)
                       clearModalState()
                     }}
                     className="flex-1 h-10"
                   >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                                                        <Button 
                     variant="outline"
                     onClick={handleSendEmailOtp}
                     disabled={sendingOtp}
                     className="flex-1 h-10"
                   >
                     {sendingOtp ? (
                       <Loader className="h-4 w-4 mr-2 animate-spin" />
                     ) : (
                       <RefreshCw className="h-4 w-4 mr-2" />
                     )}
                     {sendingOtp ? 'Sending...' : 'Resend OTP'}
                   </Button>
                </div>
              </div>
            )}
          </div>
                 </DialogContent>
       </Dialog>

               {/* Forgot Password Modal */}
        <Dialog open={showForgotPasswordModal} onOpenChange={(open) => {
          setShowForgotPasswordModal(open)
          if (!open) {
            // Clear state when modal is closed
            clearForgotPasswordModalState()
          }
        }}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Shield className="h-5 w-5 text-red-600" />
               Reset Password
             </DialogTitle>
             <DialogDescription>
               Enter the OTP sent to your email to reset your password.
             </DialogDescription>
           </DialogHeader>
           
                      <div className="space-y-4">
             
             {!forgotPasswordOtpSent ? (
               <div className="text-center">
                 <p className="text-sm text-gray-600 mb-4">
                   We'll send a verification code to <strong>{profileData.email}</strong>
                 </p>
                 <Button 
                   onClick={handleSendForgotPasswordOtp}
                   disabled={sendingForgotPasswordOtp}
                   className="w-full h-12 bg-red-600 hover:bg-red-700 transition-all duration-200"
                 >
                   {sendingForgotPasswordOtp ? (
                     <Loader className="h-4 w-4 mr-2 animate-spin" />
                   ) : (
                     <Mail className="h-4 w-4 mr-2" />
                   )}
                   {sendingForgotPasswordOtp ? 'Sending OTP...' : 'Send OTP'}
                 </Button>
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="p-4 bg-red-100 rounded-lg">
                   <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                     <CheckCircle className="h-4 w-4" />
                     OTP sent to <strong>{profileData.email}</strong>
                   </p>
                   <p className="text-sm text-red-700 mt-1">
                     Please check your email and enter the verification code below.
                   </p>
                   {forgotPasswordOtpTimer > 0 && (
                     <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                       <Clock className="h-4 w-4" />
                       OTP expires in: {formatTime(forgotPasswordOtpTimer)}
                     </p>
                   )}
                 </div>
                 
                 {!forgotPasswordOtpVerified ? (
                   <div>
                     <Label htmlFor="forgotPasswordOtp" className="text-sm font-semibold text-gray-700">
                       Verification Code
                     </Label>
                     <p className="text-xs text-gray-500 mt-1 mb-2">
                       Enter the 6-digit code sent to your email address
                     </p>
                     <div className="flex gap-3 mt-2">
                                               <Input
                          id="forgotPasswordOtp"
                          value={forgotPasswordOtp}
                          onChange={(e) => {
                            const newOtp = e.target.value
                            setForgotPasswordOtp(newOtp)
                            saveForgotPasswordModalState({ forgotPasswordOtp: newOtp })
                          }}
                          placeholder="Enter 6-digit code"
                          className="flex-1 h-12 border-red-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200"
                          maxLength={6}
                        />
                       <Button 
                         onClick={handleVerifyForgotPasswordOtp} 
                         disabled={!forgotPasswordOtp.trim() || forgotPasswordOtp.length < 6 || verifyingForgotPasswordOtp}
                         className="h-12 px-6 bg-red-600 hover:bg-red-700 transition-all duration-200"
                       >
                         {verifyingForgotPasswordOtp ? (
                           <Loader className="h-4 w-4 animate-spin" />
                         ) : (
                           'Verify'
                         )}
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     <div className="p-4 bg-green-100 rounded-lg">
                       <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                         <CheckCircle className="h-4 w-4" />
                         OTP verified successfully!
                       </p>
                       <p className="text-sm text-green-700 mt-1">
                         You can now set your new password.
                       </p>
                     </div>
                     
                     <div className="space-y-3">
                       <div className="space-y-2">
                         <Label htmlFor="newPasswordForForgot" className="text-sm font-semibold text-gray-700">
                           New Password
                         </Label>
                         <div className="relative">
                                                       <Input
                              id="newPasswordForForgot"
                              type={showNewPasswordForForgot ? "text" : "password"}
                              value={newPasswordForForgot}
                              onChange={(e) => {
                                const newPassword = e.target.value
                                setNewPasswordForForgot(newPassword)
                                saveForgotPasswordModalState({ newPasswordForForgot: newPassword })
                              }}
                              placeholder="Enter new password"
                              className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 pr-10"
                            />
                           <button
                             type="button"
                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                             onClick={() => setShowNewPasswordForForgot(!showNewPasswordForForgot)}
                           >
                             {showNewPasswordForForgot ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <Label htmlFor="confirmPasswordForForgot" className="text-sm font-semibold text-gray-700">
                           Confirm New Password
                         </Label>
                         <div className="relative">
                                                       <Input
                              id="confirmPasswordForForgot"
                              type={showConfirmPasswordForForgot ? "text" : "password"}
                              value={confirmPasswordForForgot}
                              onChange={(e) => {
                                const confirmPassword = e.target.value
                                setConfirmPasswordForForgot(confirmPassword)
                                saveForgotPasswordModalState({ confirmPasswordForForgot: confirmPassword })
                              }}
                              placeholder="Confirm new password"
                              className={cn(
                                "h-12 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 pr-10",
                                confirmPasswordForForgot && newPasswordForForgot !== confirmPasswordForForgot && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              )}
                            />
                           <button
                             type="button"
                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                             onClick={() => setShowConfirmPasswordForForgot(!showConfirmPasswordForForgot)}
                           >
                             {showConfirmPasswordForForgot ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                         </div>
                         {confirmPasswordForForgot && newPasswordForForgot !== confirmPasswordForForgot && (
                           <p className="text-xs text-red-600 flex items-center gap-1">
                             <AlertCircle className="h-3 w-3" />
                             Passwords do not match
                           </p>
                         )}
                       </div>
                       
                       <Button 
                         onClick={handleUpdatePasswordForForgot}
                         disabled={updatingPasswordForForgot || !newPasswordForForgot || !confirmPasswordForForgot || newPasswordForForgot !== confirmPasswordForForgot || !validatePassword(newPasswordForForgot).isValid}
                         className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200"
                       >
                         {updatingPasswordForForgot ? (
                           <Loader className="h-4 w-4 mr-2 animate-spin" />
                         ) : (
                           <Save className="h-4 w-4 mr-2" />
                         )}
                         {updatingPasswordForForgot ? 'Resetting Password...' : 'Reset Password'}
                       </Button>
                     </div>
                   </div>
                 )}
                 
                 <div className="flex gap-3">
                                       <Button 
                      variant="outline"
                      onClick={() => {
                        setShowForgotPasswordModal(false)
                        setForgotPasswordOtp("")
                        setForgotPasswordOtpSent(false)
                        setForgotPasswordOtpVerified(false)
                        setForgotPasswordOtpTimer(0)
                        setNewPasswordForForgot("")
                        setConfirmPasswordForForgot("")
                        clearForgotPasswordModalState()
                      }}
                      className="flex-1 h-10"
                    >
                     <X className="h-4 w-4 mr-2" />
                     Cancel
                   </Button>
                                       {!forgotPasswordOtpVerified && (
                      <Button 
                        variant="outline"
                        onClick={handleSendForgotPasswordOtp}
                        disabled={sendingForgotPasswordOtp}
                        className="flex-1 h-10"
                      >
                        {sendingForgotPasswordOtp ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        {sendingForgotPasswordOtp ? 'Sending...' : 'Send New OTP'}
                      </Button>
                    )}
                 </div>
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>
     </>
   )
 }
