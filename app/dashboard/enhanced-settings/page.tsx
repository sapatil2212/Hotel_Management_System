"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchUserData, updateUserProfile, updateUserAvatar } from "@/lib/slices/userSlice"
import EnhancedProfileForm from "@/components/dashboard/enhanced-profile-form"
import { Loader } from "lucide-react"

export default function EnhancedSettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const dispatch = useAppDispatch()
  const { currentUser, loading: reduxLoading } = useAppSelector((state: any) => state.user)
  const [loadingUser, setLoadingUser] = useState(true)

  // Fetch user data from database using Redux
  const loadUserData = async () => {
    if (!session?.user?.id) return

    try {
      setLoadingUser(true)
      await dispatch(fetchUserData(session.user.id))
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData()
    }
  }, [session])

  const handleProfileUpdate = async (data: { name: string; email: string; phone?: string }) => {
    await dispatch(updateUserProfile({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || "",
    }))
    
    // Update session with new user data
    await updateSession({
      user: {
        ...session?.user,
        name: data.name.trim(),
        email: data.email.trim(),
      }
    })
    
    // Refresh user data after successful update
    await loadUserData()
  }

  const handleAvatarUpdate = async (avatarUrl: string) => {
    await dispatch(updateUserAvatar(avatarUrl))
    
    // Update session with new avatar
    await updateSession({
      user: {
        ...session?.user,
        image: avatarUrl,
      }
    })
  }

  const handlePasswordUpdate = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await fetch('/api/users/update-password-direct', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update password')
    }

    // Refresh user data after successful password update
    await loadUserData()
  }

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">User not found</h2>
          <p className="text-gray-600">Unable to load user profile data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Account Settings
          </h1>
          <p className="text-gray-600 text-lg">Manage your account information and security settings</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Form Section */}
          <div className="col-span-1">
            <EnhancedProfileForm
              user={currentUser}
              onUpdate={handleProfileUpdate}
              onAvatarUpdate={handleAvatarUpdate}
              onPasswordUpdate={handlePasswordUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
