/**
 * Utility functions for handling checkout time calculations and notifications
 */

export interface CheckoutStatus {
  hasPassed: boolean
  isToday: boolean
  timeRemaining?: string
  statusMessage: string
  severity: 'info' | 'warning' | 'error'
}

/**
 * Parse time string (e.g., "11:00 AM") to hours and minutes
 */
function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const time = timeString.trim().toUpperCase()
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
  
  if (!match) {
    // Default to 11:00 AM if parsing fails
    return { hours: 11, minutes: 0 }
  }
  
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const period = match[3]
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  return { hours, minutes }
}

/**
 * Check if checkout time has passed for a given booking
 */
export function checkCheckoutStatus(
  checkoutDate: string | Date,
  hotelCheckoutTime: string = "11:00 AM"
): CheckoutStatus {
  const checkout = new Date(checkoutDate)
  const now = new Date()
  
  // Parse hotel checkout time
  const { hours: checkoutHour, minutes: checkoutMinute } = parseTimeString(hotelCheckoutTime)
  
  // Create checkout datetime
  const checkoutDateTime = new Date(checkout)
  checkoutDateTime.setHours(checkoutHour, checkoutMinute, 0, 0)
  
  // Check if it's today
  const isToday = checkout.toDateString() === now.toDateString()
  
  // Check if checkout time has passed
  const hasPassed = now > checkoutDateTime
  
  // Calculate time remaining if it's today and hasn't passed
  let timeRemaining: string | undefined
  if (isToday && !hasPassed) {
    const diff = checkoutDateTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      timeRemaining = `${hours}h ${minutes}m remaining`
    } else {
      timeRemaining = `${minutes}m remaining`
    }
  }
  
  // Determine status message and severity
  let statusMessage: string
  let severity: 'info' | 'warning' | 'error'
  
  if (hasPassed) {
    if (isToday) {
      statusMessage = `Checkout time (${hotelCheckoutTime}) has passed`
      severity = 'error'
    } else {
      statusMessage = `Checkout date has passed`
      severity = 'error'
    }
  } else if (isToday) {
    statusMessage = `Checkout today at ${hotelCheckoutTime}`
    severity = 'warning'
  } else {
    statusMessage = `Checkout on ${checkout.toLocaleDateString()} at ${hotelCheckoutTime}`
    severity = 'info'
  }
  
  return {
    hasPassed,
    isToday,
    timeRemaining,
    statusMessage,
    severity
  }
}

/**
 * Get professional checkout notification message
 */
export function getCheckoutNotificationMessage(
  checkoutDate: string | Date,
  hotelCheckoutTime: string = "11:00 AM",
  guestName?: string
): {
  message: string
  severity: 'info' | 'warning' | 'error'
  icon: string
} {
  const status = checkCheckoutStatus(checkoutDate, hotelCheckoutTime)
  
  if (status.hasPassed) {
    if (status.isToday) {
      return {
        message: guestName 
          ? `${guestName}'s checkout time (${hotelCheckoutTime}) has passed. Please contact the guest or update the booking status.`
          : `Checkout time (${hotelCheckoutTime}) has passed. Please contact the guest or update the booking status.`,
        severity: 'error',
        icon: '⚠️'
      }
    } else {
      return {
        message: guestName
          ? `${guestName}'s checkout date has passed. Please update the booking status or contact the guest.`
          : 'Checkout date has passed. Please update the booking status or contact the guest.',
        severity: 'error',
        icon: '🚨'
      }
    }
  } else if (status.isToday) {
    return {
      message: guestName
        ? `${guestName} is due for checkout today at ${hotelCheckoutTime}. ${status.timeRemaining || ''}`
        : `Checkout today at ${hotelCheckoutTime}. ${status.timeRemaining || ''}`,
      severity: 'warning',
      icon: '⏰'
    }
  } else {
    return {
      message: guestName
        ? `${guestName} will checkout on ${new Date(checkoutDate).toLocaleDateString()} at ${hotelCheckoutTime}`
        : `Checkout on ${new Date(checkoutDate).toLocaleDateString()} at ${hotelCheckoutTime}`,
      severity: 'info',
      icon: '📅'
    }
  }
}

/**
 * Format checkout time for display
 */
export function formatCheckoutTime(checkoutDate: string | Date, hotelCheckoutTime: string = "11:00 AM"): string {
  const checkout = new Date(checkoutDate)
  const today = new Date()
  
  if (checkout.toDateString() === today.toDateString()) {
    return `Today at ${hotelCheckoutTime}`
  } else {
    return `${checkout.toLocaleDateString()} at ${hotelCheckoutTime}`
  }
}
