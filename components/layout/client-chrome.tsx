"use client"

import { usePathname } from "next/navigation"

type Props = { children: React.ReactNode }

export default function ClientChrome({ children }: Props) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")
  const isAuth = pathname?.startsWith("/auth")

  // Hide wrapped content on dashboard/auth routes
  if (isDashboard || isAuth) return null
  return <>{children}</>
}



