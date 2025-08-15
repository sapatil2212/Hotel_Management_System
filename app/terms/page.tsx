"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PolicyModal } from "@/components/ui/policy-modal"

export default function TermsPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Open modal immediately when page loads
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    // Go back to previous page or home if no previous page
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fallback content in case JavaScript is disabled */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-slate-600">
              Loading terms of service... If this message persists, please enable JavaScript or contact us directly.
            </p>
          </div>
        </div>
      </div>

      {/* Modal that will show on top */}
      <PolicyModal 
        type="terms" 
        isOpen={isOpen} 
        onClose={handleClose}
      />
    </div>
  )
}
