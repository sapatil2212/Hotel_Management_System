"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, InlineLoader, ButtonLoader } from "@/components/ui/loader"
import { SuccessModal } from "@/components/ui/success-modal"

export function LoaderDemo() {
  const [fullscreenLoading, setFullscreenLoading] = useState(false)
  const [inlineLoading, setInlineLoading] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const simulateLoading = (setter: (value: boolean) => void, duration: number = 3000) => {
    setter(true)
    setTimeout(() => setter(false), duration)
  }

  const simulateSuccess = () => {
    simulateLoading(setButtonLoading, 2000)
    setTimeout(() => setSuccessModalOpen(true), 2000)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Loader Components Demo</h1>
        <p className="text-muted-foreground">Examples of how to use the reusable loader components</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fullscreen Loader */}
        <Card>
          <CardHeader>
            <CardTitle>Fullscreen Loader</CardTitle>
            <CardDescription>Overlay loader for major operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => simulateLoading(setFullscreenLoading)}
              className="w-full"
            >
              Show Fullscreen Loader
            </Button>
            <div className="text-sm text-muted-foreground">
              Perfect for: OTP sending, account creation, login processes
            </div>
          </CardContent>
        </Card>

        {/* Inline Loader */}
        <Card>
          <CardHeader>
            <CardTitle>Inline Loader</CardTitle>
            <CardDescription>Small loader for inline content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => simulateLoading(setInlineLoading)}
              className="w-full"
            >
              Toggle Inline Loader
            </Button>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <InlineLoader 
                show={inlineLoading} 
                message="Processing..."
                variant="primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Button Loader */}
        <Card>
          <CardHeader>
            <CardTitle>Button Loader</CardTitle>
            <CardDescription>Loader inside buttons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={simulateSuccess}
              disabled={buttonLoading}
              className="w-full"
            >
              <ButtonLoader 
                show={buttonLoading} 
                loadingText="Processing..."
              >
                Process Action
              </ButtonLoader>
            </Button>
            <div className="text-sm text-muted-foreground">
              Automatically replaces button content when loading
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loader Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Loader Variants</CardTitle>
          <CardDescription>Different styles and sizes available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <InlineLoader show={true} message="Default" />
            </div>
            <div className="text-center">
              <InlineLoader show={true} message="Primary" variant="primary" />
            </div>
            <div className="text-center">
              <InlineLoader show={true} message="Small" size="sm" />
            </div>
            <div className="text-center">
              <InlineLoader show={true} message="Large" size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Loader */}
      <Loader 
        show={fullscreenLoading} 
        message="Processing your request..."
        variant="primary"
        size="lg"
      />

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Action Completed!"
        description="Your action has been processed successfully."
        onConfirm={() => setSuccessModalOpen(false)}
        confirmText="Continue"
        showIcon={true}
      />
    </div>
  )
}
