"use client"

import { useState, useEffect } from "react"
import { Loader } from "lucide-react"

export default function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for settings page
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Configure brand, users, roles and preferences. (Coming soon)</p>
    </div>
  )
}


