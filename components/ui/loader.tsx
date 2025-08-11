"use client"

import { Loader2 } from "lucide-react"
import React from "react"

type LoaderProps = {
  show: boolean
  message?: string
  fullscreen?: boolean
}

export function Loader({ show, message, fullscreen = true }: LoaderProps) {
  if (!show) return null
  if (!fullscreen) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {message ? <span>{message}</span> : null}
      </div>
    )
  }
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-background px-6 py-5 shadow-xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="text-sm text-muted-foreground">
          {message || "Please wait..."}
        </div>
      </div>
    </div>
  )
}


