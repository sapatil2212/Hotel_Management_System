# Notification System Implementation

## Overview

A comprehensive real-time notification system has been implemented for the Hotel Management System dashboard. The system provides instant notifications for various operations like bookings, payments, revenue, expenses, and bills with a red dot indicator on the bell icon.

## Features

### 🔔 Real-time Notifications
- **Bell Icon with Red Dot**: Shows unread notification count
- **Popover Interface**: Clean, modern notification panel
- **Auto-refresh**: Polls for new notifications every 30 seconds
- **Mark as Read**: Individual and bulk read operations
- **Delete Notifications**: Remove unwanted notifications

### 📱 Notification Types
- **🏨 Booking**: New bookings, updates, check-ins, check-outs
- **💰 Payment**: Payment received, refunds processed
- **📈 Revenue**: Revenue added from various sources
- **💸 Expense**: Expenses recorded and approved
- **📋 Bills/Invoices**: Bills generated and paid
- **ℹ️ System**: System-wide announcements and maintenance

### 🎨 Visual Indicators
- **Color-coded**: Different colors for different notification types
- **Icons**: Emoji icons for quick visual identification
- **Unread Badge**: Red dot with count for unread notifications
- **Time Stamps**: Relative time display (e.g., "2m ago", "1h ago")

## Database Schema

### Notifications Table
```sql
model notification {
  id          String              @id @default(cuid())
  title       String
  message     String              @db.Text
  type        notification_type   @default(info)
  isRead      Boolean             @default(false)
  userId      String?             // If null, it's a system-wide notification
  referenceId String?             // Reference to booking/invoice/payment/expense ID
  referenceType reference_type?   // Type of reference
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  user        user?               @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Notification Types Enum
```sql
enum notification_type {
  info
  success
  warning
  error
  booking
  payment
  revenue
  expense
  system
}
```

## API Endpoints

### GET /api/notifications
Fetch notifications with pagination and filtering
```typescript
// Query parameters
{
  limit?: number,      // Default: 50
  page?: number,       // Default: 1
  type?: string,       // Filter by notification type
  isRead?: boolean     // Filter by read status
}

// Response
{
  notifications: Notification[],
  unreadCount: number,
  totalCount: number,
  page: number,
  limit: number,
  totalPages: number
}
```

### POST /api/notifications
Create a new notification
```typescript
{
  title: string,
  message: string,
  type?: notification_type,
  userId?: string,
  referenceId?: string,
  referenceType?: reference_type
}
```

### POST /api/notifications/[id]/read
Mark a specific notification as read

### POST /api/notifications/mark-all-read
Mark all notifications as read for the current user

### DELETE /api/notifications/[id]
Delete a specific notification

## Components

### NotificationBell Component
Location: `components/ui/notification-bell.tsx`

Features:
- Real-time notification display
- Unread count badge
- Mark as read functionality
- Delete notifications
- Responsive design

### useNotifications Hook
Location: `hooks/use-notifications.ts`

Provides:
- Notification state management
- API integration
- Auto-refresh functionality
- Error handling

## Service Layer

### NotificationService
Location: `lib/notification-service.ts`

Methods:
- `createNotification()` - Create new notification
- `getUserNotifications()` - Fetch user notifications
- `getUnreadCount()` - Get unread count
- `markAsRead()` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification()` - Delete notification

Specialized methods:
- `createBookingNotification()` - Booking-specific notifications
- `createPaymentNotification()` - Payment notifications
- `createRevenueNotification()` - Revenue notifications
- `createExpenseNotification()` - Expense notifications
- `createBillNotification()` - Bill/invoice notifications
- `createSystemNotification()` - System-wide notifications

## Integration Points

### Automatic Notifications
The system automatically creates notifications for:

1. **Bookings** (`/api/bookings`)
   - New booking created
   - Booking updated
   - Check-in/Check-out

2. **Payments** (`/api/payments`)
   - Payment received
   - Refund processed

3. **Expenses** (`/api/expenses`)
   - Expense recorded
   - Expense approved

4. **Invoices** (`/api/invoices`)
   - Bill generated
   - Bill paid

### Manual Notifications
You can create custom notifications using:
```typescript
import { NotificationService } from '@/lib/notification-service'

// Create a custom notification
await NotificationService.createNotification({
  title: 'Custom Title',
  message: 'Custom message',
  type: 'info',
  userId: 'user-id', // Optional, null for system-wide
  referenceId: 'reference-id', // Optional
  referenceType: 'booking' // Optional
})
```

## Usage Examples

### Creating a Booking Notification
```typescript
// Automatically triggered when booking is created
await NotificationService.createBookingNotification(
  bookingId,
  guestName,
  'created'
)
```

### Creating a Payment Notification
```typescript
// Automatically triggered when payment is received
await NotificationService.createPaymentNotification(
  paymentId,
  amount,
  paymentMethod,
  'received'
)
```

### Creating a System Notification
```typescript
// For system-wide announcements
await NotificationService.createSystemNotification(
  'System Maintenance',
  'System will be under maintenance from 2-4 AM',
  'warning'
)
```

## Styling and Theming

### Notification Colors
- **Booking**: Blue theme
- **Payment**: Green theme
- **Revenue**: Emerald theme
- **Expense**: Orange theme
- **Success**: Green theme
- **Warning**: Yellow theme
- **Error**: Red theme
- **Info**: Gray theme

### Responsive Design
- Mobile-friendly popover
- Touch-friendly buttons
- Adaptive layout for different screen sizes

## Testing

### Seed Script
Run the seed script to add sample notifications:
```bash
node scripts/seed-notifications.js
```

This creates 6 sample notifications of different types for testing.

### Manual Testing
1. Create a booking → Should see booking notification
2. Record a payment → Should see payment notification
3. Add an expense → Should see expense notification
4. Generate a bill → Should see bill notification

## Future Enhancements

### Planned Features
1. **Push Notifications**: Browser push notifications
2. **Email Notifications**: Email alerts for important events
3. **SMS Notifications**: Text message alerts
4. **Notification Preferences**: User-configurable notification settings
5. **Notification Categories**: Group notifications by category
6. **Rich Notifications**: Support for images and actions
7. **WebSocket Integration**: Real-time updates without polling

### Advanced Features
1. **Notification Templates**: Predefined notification templates
2. **Scheduled Notifications**: Future-dated notifications
3. **Notification Analytics**: Track notification engagement
4. **Bulk Operations**: Bulk mark as read/delete
5. **Notification Search**: Search through notifications
6. **Export Notifications**: Export notification history

## Troubleshooting

### Common Issues

1. **Notifications not showing**
   - Check if user is authenticated
   - Verify database connection
   - Check browser console for errors

2. **Red dot not updating**
   - Refresh the page
   - Check network connectivity
   - Verify API endpoints are working

3. **Duplicate notifications**
   - Check for duplicate API calls
   - Verify notification creation logic
   - Check database constraints

### Debug Mode
Enable debug logging by adding to your environment:
```bash
DEBUG=notifications:*
```

## Security Considerations

1. **Authentication**: All notification endpoints require authentication
2. **Authorization**: Users can only see their own notifications + system-wide
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting for notification creation
5. **Data Privacy**: Sensitive information is not included in notifications

## Performance Optimization

1. **Pagination**: Notifications are paginated to prevent large data loads
2. **Indexing**: Database indexes on frequently queried fields
3. **Caching**: Consider implementing Redis caching for notifications
4. **Polling Interval**: 30-second polling interval balances real-time updates with performance
5. **Lazy Loading**: Notifications are loaded on demand

## Contributing

When adding new notification types or modifying the system:

1. Update the `notification_type` enum if adding new types
2. Add corresponding methods to `NotificationService`
3. Update the notification bell component styling
4. Add appropriate icons and colors
5. Update this documentation
6. Add tests for new functionality

## Support

For issues or questions about the notification system:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the browser console for errors
4. Verify database connectivity
5. Contact the development team
