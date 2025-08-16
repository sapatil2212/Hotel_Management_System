"use client"

import { useState } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { data: session } = useSession()
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)



  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '🏨'
      case 'payment':
        return '💰'
      case 'revenue':
        return '📈'
      case 'expense':
        return '💸'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'border-blue-200 bg-blue-50'
      case 'payment':
        return 'border-green-200 bg-green-50'
      case 'revenue':
        return 'border-emerald-200 bg-emerald-50'
      case 'expense':
        return 'border-orange-200 bg-orange-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }



  if (!session?.user?.email) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors",
                    !notification.isRead && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className={cn(
                          "text-sm font-medium truncate",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </h5>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <span className="sr-only">Options</span>
                              <div className="h-1 w-1 bg-gray-400 rounded-full" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
