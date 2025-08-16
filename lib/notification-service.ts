import { prisma } from './prisma'
import { notification_type, reference_type } from '@prisma/client'

export interface CreateNotificationData {
  title: string
  message: string
  type?: notification_type
  userId?: string
  referenceId?: string
  referenceType?: reference_type
}

export class NotificationService {
  // Create a new notification
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          userId: data.userId,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
        },
      })
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Get notifications for a user (including system-wide notifications)
  static async getUserNotifications(userId: string, limit = 50) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          OR: [
            { userId: userId },
            { userId: null } // System-wide notifications
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
      return notifications
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      throw error
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          isRead: false,
          OR: [
            { userId: userId },
            { userId: null } // System-wide notifications
          ]
        }
      })
      return count
    } catch (error) {
      console.error('Error fetching unread count:', error)
      throw error
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      })
      return notification
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          isRead: false,
          OR: [
            { userId: userId },
            { userId: null } // System-wide notifications
          ]
        },
        data: { isRead: true }
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string) {
    try {
      await prisma.notification.delete({
        where: { id: notificationId }
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  // Create booking notification
  static async createBookingNotification(bookingId: string, guestName: string, action: 'created' | 'updated' | 'cancelled' | 'checked_in' | 'checked_out') {
    const messages = {
      created: `New booking received from ${guestName}`,
      updated: `Booking updated for ${guestName}`,
      cancelled: `Booking cancelled for ${guestName}`,
      checked_in: `${guestName} has checked in`,
      checked_out: `${guestName} has checked out`
    }

    return this.createNotification({
      title: `Booking ${action.replace('_', ' ')}`,
      message: messages[action],
      type: 'booking',
      referenceId: bookingId,
      referenceType: 'booking'
    })
  }

  // Create payment notification
  static async createPaymentNotification(paymentId: string, amount: number, paymentMethod: string, action: 'received' | 'refunded') {
    const messages = {
      received: `Payment of ₹${amount} received via ${paymentMethod}`,
      refunded: `Refund of ₹${amount} processed via ${paymentMethod}`
    }

    return this.createNotification({
      title: `Payment ${action}`,
      message: messages[action],
      type: 'payment',
      referenceId: paymentId,
      referenceType: 'payment'
    })
  }

  // Create revenue notification
  static async createRevenueNotification(amount: number, source: string) {
    return this.createNotification({
      title: 'Revenue Added',
      message: `₹${amount} revenue added from ${source}`,
      type: 'revenue',
      referenceType: 'booking'
    })
  }

  // Create expense notification
  static async createExpenseNotification(expenseId: string, amount: number, description: string) {
    return this.createNotification({
      title: 'Expense Recorded',
      message: `Expense of ₹${amount} recorded: ${description}`,
      type: 'expense',
      referenceId: expenseId,
      referenceType: 'expense'
    })
  }

  // Create bill/invoice notification
  static async createBillNotification(billId: string, guestName: string, amount: number, action: 'generated' | 'paid') {
    const messages = {
      generated: `Bill generated for ${guestName} - ₹${amount}`,
      paid: `Bill paid for ${guestName} - ₹${amount}`
    }

    return this.createNotification({
      title: `Bill ${action}`,
      message: messages[action],
      type: action === 'paid' ? 'payment' : 'info',
      referenceId: billId,
      referenceType: 'invoice'
    })
  }

  // Create system notification
  static async createSystemNotification(title: string, message: string, type: notification_type = 'info') {
    return this.createNotification({
      title,
      message,
      type
    })
  }
}
