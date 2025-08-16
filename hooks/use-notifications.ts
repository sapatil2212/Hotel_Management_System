import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'revenue' | 'expense' | 'system'
  isRead: boolean
  createdAt: string
  referenceId?: string
  referenceType?: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    if (!session?.user?.email) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      } else {
        setError('Failed to fetch notifications')
      }
    } catch (err) {
      setError('Error fetching notifications')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.email])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}
