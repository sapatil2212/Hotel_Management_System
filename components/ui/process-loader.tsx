"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessStep {
  id: string
  label: string
  status: "pending" | "loading" | "completed" | "error"
}

interface ProcessLoaderProps {
  show: boolean
  steps: ProcessStep[]
  currentStep: string
  onComplete?: () => void
  className?: string
}

export function ProcessLoader({ show, steps, currentStep, onComplete, className }: ProcessLoaderProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    if (show && currentStep) {
      const currentIndex = steps.findIndex(step => step.id === currentStep)
      if (currentIndex > 0) {
        const newCompletedSteps = steps.slice(0, currentIndex).map(step => step.id)
        setCompletedSteps(newCompletedSteps)
      }
    }
  }, [show, currentStep, steps])

  useEffect(() => {
    if (show && completedSteps.length === steps.length) {
      setTimeout(() => {
        onComplete?.()
      }, 1000)
    }
  }, [completedSteps, steps.length, show, onComplete])

  if (!show) return null

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center", className)}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Processing Your Request</h3>
          <p className="text-sm text-gray-600">Please wait while we complete the process</p>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCurrent = step.id === currentStep
            const isCompleted = completedSteps.includes(step.id)
            const isPending = !isCompleted && !isCurrent

            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-green-700" : isCurrent ? "text-blue-700" : "text-gray-500"
                  )}>
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {currentStep && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for easy usage
export function useProcessLoader() {
  const [show, setShow] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const [steps, setSteps] = useState<ProcessStep[]>([])

  const startProcess = (processSteps: ProcessStep[]) => {
    setSteps(processSteps)
    setCurrentStep(processSteps[0]?.id || "")
    setShow(true)
  }

  const updateStep = (stepId: string) => {
    setCurrentStep(stepId)
  }

  const completeProcess = () => {
    setShow(false)
    setCurrentStep("")
    setSteps([])
  }

  return {
    show,
    currentStep,
    steps,
    startProcess,
    updateStep,
    completeProcess,
    ProcessLoader: () => (
      <ProcessLoader
        show={show}
        steps={steps}
        currentStep={currentStep}
        onComplete={completeProcess}
      />
    )
  }
}
