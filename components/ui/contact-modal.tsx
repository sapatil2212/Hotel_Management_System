"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, Mail } from "lucide-react"

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Get in touch with our support team for assistance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Click the buttons below to get in touch with our support team
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              asChild
            >
              <a href="tel:+918830553868">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              asChild
            >
              <a href="mailto:saptechnoeditors@gmail.com">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
