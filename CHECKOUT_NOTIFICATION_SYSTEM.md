# Checkout Notification System

## Overview
Professional checkout notification system that automatically detects when a booking's checkout time has passed based on the hotel's configured checkout time. The system provides real-time alerts and professional messaging to help hotel staff manage guest checkouts effectively.

## Key Features

### 1. Automatic Checkout Time Detection
- **Hotel Configuration**: Uses hotel's configured checkout time (default: 11:00 AM)
- **Real-time Monitoring**: Continuously monitors checkout status
- **Professional Messaging**: Context-aware notifications with guest names
- **Time Remaining**: Shows countdown for today's checkouts

### 2. Multi-Level Notifications

#### Dashboard Summary Alerts
- **Overdue Checkouts**: Red alerts for guests past checkout time
- **Today's Checkouts**: Yellow alerts for guests due to checkout today
- **Count Indicators**: Shows number of guests in each category

#### Individual Booking Notifications
- **Stay Period Column**: Inline notifications in booking table
- **Status Indicators**: Visual indicators in status column
- **Details Modal**: Comprehensive checkout information

### 3. Professional Messaging System

#### Message Types
1. **Overdue Checkout**: "Guest's checkout time (11:00 AM) has passed. Please contact the guest or update the booking status."
2. **Today's Checkout**: "Guest is due for checkout today at 11:00 AM. 2h 30m remaining"
3. **Future Checkout**: "Guest will checkout on 15/08/2025 at 11:00 AM"

#### Visual Indicators
- **🚨 Red Alert**: Overdue checkouts
- **⏰ Yellow Warning**: Today's checkouts
- **📅 Info**: Future checkouts

## Implementation Details

### Utility Functions (`lib/checkout-utils.ts`)

#### `checkCheckoutStatus()`
```typescript
export function checkCheckoutStatus(
  checkoutDate: string | Date,
  hotelCheckoutTime: string = "11:00 AM"
): CheckoutStatus
```

**Returns:**
- `hasPassed`: Boolean indicating if checkout time has passed
- `isToday`: Boolean indicating if checkout is today
- `timeRemaining`: String showing remaining time (e.g., "2h 30m remaining")
- `statusMessage`: Professional status message
- `severity`: 'info' | 'warning' | 'error'

#### `getCheckoutNotificationMessage()`
```typescript
export function getCheckoutNotificationMessage(
  checkoutDate: string | Date,
  hotelCheckoutTime: string = "11:00 AM",
  guestName?: string
): {
  message: string
  severity: 'info' | 'warning' | 'error'
  icon: string
}
```

**Features:**
- Personalized messages with guest names
- Professional tone appropriate for hotel staff
- Clear action items (contact guest, update status)
- Time-sensitive information

### Frontend Integration

#### Booking Table (`components/dashboard/bookings-table.tsx`)

**CheckoutNotification Component:**
```typescript
const CheckoutNotification = ({ booking }: { booking: Booking }) => {
  const checkoutStatus = checkCheckoutStatus(booking.checkOut, hotelInfo.checkOutTime)
  const notification = getCheckoutNotificationMessage(booking.checkOut, hotelInfo.checkOutTime, booking.guestName)
  
  // Renders appropriate notification based on status
}
```

**Integration Points:**
1. **Stay Period Column**: Shows checkout notifications inline
2. **Status Column**: Displays overdue/due today indicators
3. **Details Modal**: Comprehensive checkout information
4. **Dashboard Summary**: Overview alerts at top of table

### Real-time Updates

#### Automatic Refresh
- Updates checkout status every minute
- Real-time countdown for today's checkouts
- Automatic status changes when time passes

#### Hotel Context Integration
- Uses hotel's configured checkout time from `useHotel()` context
- Automatically adapts to hotel's specific checkout policy
- Supports different checkout times for different properties

## User Experience

### Dashboard View

#### Summary Alerts
```
🚨 3 guests overdue for checkout
Checkout time (11:00 AM) has passed for these bookings

⏰ 2 guests due for checkout today
Checkout time: 11:00 AM
```

#### Individual Booking Notifications
```
Stay Period: 15/08/2025 → 22/08/2025
7 nights

⚠️ John Doe's checkout time (11:00 AM) has passed. 
Please contact the guest or update the booking status.
```

### Booking Details Modal

#### Enhanced Checkout Information
```
Check-out: 22/08/2025
Checkout time: 11:00 AM

⚠️ John Doe's checkout time (11:00 AM) has passed. 
Please contact the guest or update the booking status.
```

### Status Column Indicators

#### Visual Status Indicators
- **🔴 Overdue**: Red triangle icon with "Overdue" text
- **🟡 Due Today**: Yellow clock icon with "Due today" text
- **✅ Normal**: No additional indicator

## Configuration

### Hotel Checkout Time
The system uses the hotel's configured checkout time from the hotel info:

```typescript
// From hotel context
const { hotelInfo } = useHotel()
const checkoutTime = hotelInfo.checkOutTime // e.g., "11:00 AM"
```

### Default Configuration
- **Default Checkout Time**: 11:00 AM
- **Update Frequency**: Every 60 seconds
- **Notification Threshold**: Shows for checked-in guests only

## Professional Messaging Examples

### Overdue Checkout Messages
1. **With Guest Name**: "John Doe's checkout time (11:00 AM) has passed. Please contact the guest or update the booking status."
2. **Without Guest Name**: "Checkout time (11:00 AM) has passed. Please contact the guest or update the booking status."

### Today's Checkout Messages
1. **With Time Remaining**: "Jane Smith is due for checkout today at 11:00 AM. 2h 30m remaining"
2. **Without Time Remaining**: "Jane Smith is due for checkout today at 11:00 AM."

### Future Checkout Messages
1. **With Guest Name**: "John Doe will checkout on 22/08/2025 at 11:00 AM"
2. **Without Guest Name**: "Checkout on 22/08/2025 at 11:00 AM"

## Error Handling

### Time Parsing
- **Fallback**: Defaults to 11:00 AM if time parsing fails
- **Validation**: Handles various time formats (12-hour, 24-hour)
- **Robust**: Continues working even with invalid time configurations

### Missing Data
- **Hotel Info**: Uses default checkout time if hotel info unavailable
- **Guest Names**: Provides generic messages when guest name missing
- **Date Validation**: Handles invalid dates gracefully

## Performance Considerations

### Efficient Updates
- **Minimal Re-renders**: Only updates when necessary
- **Debounced Updates**: Updates every minute, not continuously
- **Conditional Rendering**: Only shows notifications when relevant

### Memory Management
- **Cleanup**: Proper cleanup of intervals on component unmount
- **Context Usage**: Efficient use of hotel context
- **State Management**: Minimal state updates

## Future Enhancements

### Potential Improvements
1. **Custom Notifications**: Allow hotel to customize notification messages
2. **Escalation System**: Automatic escalation for severely overdue checkouts
3. **Guest Communication**: Direct integration with guest messaging system
4. **Analytics**: Track checkout compliance and timing
5. **Multi-language**: Support for multiple languages

### Integration Opportunities
1. **SMS/Email Alerts**: Automatic notifications to hotel staff
2. **Guest Portal**: Show checkout reminders to guests
3. **Housekeeping**: Integration with housekeeping schedule
4. **Revenue Management**: Late checkout fee calculations
5. **Reporting**: Checkout compliance reports

## Testing Scenarios

### 1. Overdue Checkout
- **Scenario**: Guest checked in, checkout time (11:00 AM) has passed
- **Expected**: Red alert with professional message
- **Verification**: Shows "overdue" status and appropriate messaging

### 2. Today's Checkout
- **Scenario**: Guest checked in, checkout is today at 11:00 AM
- **Expected**: Yellow warning with countdown
- **Verification**: Shows "due today" status and time remaining

### 3. Future Checkout
- **Scenario**: Guest checked in, checkout is in the future
- **Expected**: Info message with checkout date and time
- **Verification**: Shows future checkout information

### 4. Different Checkout Times
- **Scenario**: Hotel has different checkout time (e.g., 12:00 PM)
- **Expected**: Uses hotel's configured checkout time
- **Verification**: All calculations use correct checkout time

### 5. Real-time Updates
- **Scenario**: Time passes checkout time
- **Expected**: Status automatically changes from "due today" to "overdue"
- **Verification**: Updates happen automatically without manual refresh

## Technical Notes

### Time Zone Handling
- **Local Time**: All calculations use local time zone
- **Consistency**: Ensures consistent time handling across the application
- **Display**: Shows times in user's local time zone

### Date Comparison Logic
```typescript
// Parse hotel checkout time
const { hours: checkoutHour, minutes: checkoutMinute } = parseTimeString(hotelCheckoutTime)

// Create checkout datetime
const checkoutDateTime = new Date(checkout)
checkoutDateTime.setHours(checkoutHour, checkoutMinute, 0, 0)

// Compare with current time
const hasPassed = now > checkoutDateTime
```

### Professional Tone Guidelines
- **Respectful**: Always respectful to guests
- **Actionable**: Provides clear next steps for staff
- **Timely**: Includes relevant time information
- **Consistent**: Maintains consistent messaging style

## Conclusion

The checkout notification system provides a professional, automated way to manage guest checkouts. It ensures hotel staff are always aware of checkout status and can take appropriate action when needed. The system is configurable, real-time, and provides clear, actionable information to improve guest service and operational efficiency.

The implementation follows hotel industry best practices and provides a seamless experience for both hotel staff and guests.
