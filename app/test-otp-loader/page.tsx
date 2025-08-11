"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, ButtonLoader } from "@/components/ui/loader"
import { useToast } from "@/hooks/use-toast"

export default function TestOtpLoaderPage() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const simulateOtpRequest = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate success
    return { ok: true }
  }

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" as any })
      return
    }

    startTransition(async () => {
      try {
        await simulateOtpRequest()
        toast({ 
          title: "OTP Sent Successfully!", 
          description: `We sent a 6-digit code to ${email}` 
        })
      } catch (error) {
        toast({ 
          title: "Failed to send OTP", 
          description: "Please try again later", 
          variant: "destructive" as any 
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">OTP Loader Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              <ButtonLoader 
                show={isPending} 
                loadingText="Sending OTP..."
              >
                Request OTP
              </ButtonLoader>
            </Button>
          </form>

          <div className="text-sm text-muted-foreground text-center">
            This simulates the OTP sending process with a 3-second delay
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Loader */}
      <Loader 
        show={isPending} 
        message="Sending OTP to your email..."
        variant="primary"
        size="lg"
      />
    </div>
  )
}
