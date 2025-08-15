"use client"

import { useState, useEffect } from "react"
import { useHotel } from "@/contexts/hotel-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Shield, FileText, AlertCircle } from "lucide-react"

interface PolicyModalProps {
  type: "privacy" | "terms"
  isOpen: boolean
  onClose: () => void
}

export function PolicyModal({ type, isOpen, onClose }: PolicyModalProps) {
  const { hotelInfo } = useHotel()
  
  const isPrivacy = type === "privacy"
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service"
  const content = isPrivacy ? hotelInfo.privacyPolicy : hotelInfo.termsOfService
  const icon = isPrivacy ? Shield : FileText
  const Icon = icon

  const defaultContent = isPrivacy 
    ? "Your privacy is important to us. We collect and use your personal information only for the purposes of providing our services and improving your experience. We do not share your information with third parties without your consent."
    : "By using our services, you agree to these terms and conditions. We reserve the right to modify these terms at any time. Please review them regularly."

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>
            {hotelInfo.name || "Grand Luxe Hotel"} - {isPrivacy ? "How we handle your personal information" : "Terms and conditions for using our services"}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {content && content.trim() ? (
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {content}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      {title} Not Configured
                    </h4>
                    <p className="text-sm text-amber-700 mb-3">
                      This {title.toLowerCase()} hasn't been set up yet. Hotel administrators can add this content in the dashboard.
                    </p>
                    <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded border border-amber-200">
                      <strong>Default {title}:</strong>
                      <div className="mt-2 whitespace-pre-wrap leading-relaxed">
                        {defaultContent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-slate-500 pt-4 border-t">
              Last updated: {new Date().toLocaleDateString()} • {hotelInfo.name || "Grand Luxe Hotel"}
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easy usage
export function usePolicyModal() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  const openPrivacy = () => setIsPrivacyOpen(true)
  const openTerms = () => setIsTermsOpen(true)
  const closePrivacy = () => setIsPrivacyOpen(false)
  const closeTerms = () => setIsTermsOpen(false)

  const PrivacyModal = () => (
    <PolicyModal type="privacy" isOpen={isPrivacyOpen} onClose={closePrivacy} />
  )
  
  const TermsModal = () => (
    <PolicyModal type="terms" isOpen={isTermsOpen} onClose={closeTerms} />
  )

  return {
    openPrivacy,
    openTerms,
    closePrivacy,
    closeTerms,
    PrivacyModal,
    TermsModal,
    isPrivacyOpen,
    isTermsOpen
  }
}
