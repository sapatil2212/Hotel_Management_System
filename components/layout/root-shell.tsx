"use client"

import { usePathname } from "next/navigation"
import Navigation from "@/components/layout/navigation"
import Footer from "@/components/layout/footer"

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")
  const isAuth = pathname?.startsWith("/auth")

  if (isDashboard || isAuth) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}


