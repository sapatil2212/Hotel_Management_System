"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Menu, Bell } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Sidebar from "./sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Topbar() {
  const { data: session } = useSession()
  const displayName = session?.user?.name || session?.user?.email || "User"
  const initials = (displayName || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return (
    <div className="sticky top-0 z-20 h-16 border-b bg-white/70 dark:bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/40">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <Sidebar isInDrawer />
              </SheetContent>
            </Sheet>
          </div>
          <div>
<<<<<<< HEAD
            {/* Dashboard text and Bookings Management badge removed */}
=======
            <div className="text-xl font-bold">Dashboard</div>
            <Badge variant="secondary" className="hidden sm:inline-flex">Bookings Management</Badge>
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Search bookings, guests..." />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="User menu" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={"https://i.pravatar.cc/100?img=68"} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{displayName}</span>
                  {session?.user?.email && (
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}


