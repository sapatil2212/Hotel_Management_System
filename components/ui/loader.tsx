"use client"

import { Loader2 } from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"

type LoaderProps = {
  show: boolean
  message?: string
  fullscreen?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
  className?: string
}

export function Loader({ 
  show, 
  message, 
  fullscreen = true, 
  size = "md",
  variant = "default",
  className 
}: LoaderProps) {
  if (!show) return null

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  const variantClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary-foreground"
  }

  if (!fullscreen) {
    return (
      <div className={cn("inline-flex items-center gap-2 text-sm", variantClasses[variant], className)}>
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {message ? <span>{message}</span> : null}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-background px-8 py-6 shadow-xl">
        <Loader2 className={cn("animate-spin", sizeClasses[size], variantClasses[variant])} />
        {message && (
          <div className="text-sm text-muted-foreground text-center max-w-xs">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

// Inline loader for buttons and small areas
export function InlineLoader({ 
  show, 
  message, 
  size = "sm",
  variant = "default",
  className 
}: Omit<LoaderProps, 'fullscreen'>) {
  if (!show) return null

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  const variantClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary-foreground"
  }

  return (
    <div className={cn("inline-flex items-center gap-2", variantClasses[variant], className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}

// Button loader for form submissions
export function ButtonLoader({ 
  show, 
  children, 
  loadingText = "Loading...",
  className 
}: {
  show: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}) {
  if (!show) return <>{children}</>

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{loadingText}</span>
    </div>
  )
}


