"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CalendarCheck2, BarChart3, Settings, Building, Bed, Home, Tag, Receipt, Palette, TrendingUp, CreditCard, Banknote } from "lucide-react"
import { useHotel } from "@/contexts/hotel-context"
import Image from "next/image"

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/rooms", label: "Room Types", icon: Bed },
  { href: "/dashboard/room-manage", label: "Room Manage", icon: Home },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/dashboard/promo-codes", label: "Promo/Offers", icon: Tag },
  { href: "/dashboard/hotel-info", label: "Hotel Info", icon: Building },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/billing", label: "Billing & Invoice Management", icon: Receipt },
  { href: "/dashboard/revenue-tracking", label: "Revenue Tracking", icon: TrendingUp },
  { href: "/dashboard/expenses", label: "Expenses", icon: CreditCard },
  { href: "/dashboard/accounts", label: "Account Management", icon: Banknote },
  { href: "/dashboard/cms", label: "CMS(UI)", icon: Palette },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function Sidebar({ isInDrawer = false }: { isInDrawer?: boolean }) {
  const pathname = usePathname()
  const { hotelInfo } = useHotel()

  return (
    <aside
      className={cn(
        isInDrawer
          ? "block w-64"
          : "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 lg:h-screen lg:overflow-hidden",
        "border-r bg-white/70 dark:bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/40"
      )}
    >
      <div className="h-16 flex items-center px-6 border-b">
        {hotelInfo.logo && (
          <div className="flex items-center justify-center w-full">
            <Image
              src={hotelInfo.logo}
              alt={hotelInfo.name || "Hotel Logo"}
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
        )}
      </div>
      <nav className="p-3">
        <ul className="space-y-1">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300",
                    isActive
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}


