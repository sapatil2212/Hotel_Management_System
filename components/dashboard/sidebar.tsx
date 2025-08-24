"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CalendarCheck2, BarChart3, Settings, Building, Bed, Home, Tag, Receipt, Palette, TrendingUp, CreditCard, Banknote, MessageCircle, Package, FolderOpen, Activity, ChevronDown, ChevronRight, HelpCircle, Phone, Mail } from "lucide-react"
import { useHotel } from "@/contexts/hotel-context"
import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/rooms", label: "Room Types", icon: Bed },
  { href: "/dashboard/room-manage", label: "Room Manage", icon: Home },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/dashboard/promo-codes", label: "Promo/Offers", icon: Tag },
  { href: "/dashboard/billing", label: "Billing & Invoicing", icon: Receipt },
  { href: "/dashboard/revenue-tracking", label: "Revenue Tracking", icon: TrendingUp },
  { href: "/dashboard/expenses", label: "Expenses", icon: CreditCard },
  { href: "/dashboard/accounts", label: "Account Management", icon: Banknote },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: MessageCircle },
  { href: "/dashboard/enhanced-settings", label: "Settings", icon: Settings },
  { href: "/dashboard/hotel-info", label: "Hotel Info", icon: Building },
]

const inventorySubItems = [
  { href: "/dashboard/inventory", label: "Items Management", icon: Package },
  { href: "/dashboard/inventory/categories", label: "Categories", icon: FolderOpen },
  { href: "/dashboard/inventory/transactions", label: "Transactions", icon: Activity },
]

export default function Sidebar({ isInDrawer = false, onClose }: { isInDrawer?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { hotelInfo } = useHotel()
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Check if any inventory page is active
  const isInventoryActive = pathname.startsWith('/dashboard/inventory')

  const handleMenuClick = () => {
    // Close the sidebar on mobile when a menu item is clicked
    if (isInDrawer && onClose) {
      onClose()
    }
  }

  const commonIssues = [
    {
      title: "Can't access dashboard?",
      solution: "Try refreshing the page or clearing your browser cache. If the issue persists, contact support."
    },
    {
      title: "Booking not showing up?",
      solution: "Check if the booking was saved properly. Go to Bookings section and refresh the page."
    },
    {
      title: "Payment issues?",
      solution: "Verify your payment gateway settings in the Billing section. Check if all required fields are filled."
    },
    {
      title: "Room availability not updating?",
      solution: "Ensure room status is properly set. Check Room Management section for any pending updates."
    },
    {
      title: "Can't upload images?",
      solution: "Check file size (max 5MB) and format (JPG, PNG, WebP). Ensure stable internet connection."
    },
    {
      title: "Email notifications not working?",
      solution: "Verify email settings in Hotel Info section. Check spam folder for test emails."
    }
  ]

  return (
    <aside
      className={cn(
        isInDrawer
          ? "block w-64"
          : "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 lg:h-screen lg:overflow-y-auto",
        "border-r bg-white/70 dark:bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/40"
      )}
    >
      <div className="h-16 flex items-center px-6 border-b flex-shrink-0">
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
      <nav className="p-3 flex-1 flex flex-col">
        <ul className="space-y-1 flex-1">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={handleMenuClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300",
                    isActive
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              </li>
            )
          })}

          {/* Inventory Management Section */}
          <li>
            <button
              onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}
              className={cn(
                "flex items-center justify-between w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300",
                isInventoryActive
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Package className="h-3.5 w-3.5" />
                Inventory Management
              </div>
              {isInventoryExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            
            {/* Inventory Sub-items */}
            {isInventoryExpanded && (
              <ul className="mt-1 ml-6 space-y-1">
                {inventorySubItems.map(({ href, label, icon: Icon }) => {
                  const isSubActive = pathname === href
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={handleMenuClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                          "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300",
                          isSubActive
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                            : "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        </ul>

        {/* Help & Support Section - Fixed at Bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsHelpOpen(true)}
            className={cn(
              "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300",
              "text-blue-600 dark:text-blue-400"
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Help & Support
          </button>
        </div>
      </nav>

      {/* Help & Support Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Help & Support
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Common Issues */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Common Issues & Solutions
              </h3>
              <div className="space-y-3">
                {commonIssues.map((issue, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {issue.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {issue.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Contact Support
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Call Support</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">+91 8830553868</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email Support</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">info@checkmate.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}


