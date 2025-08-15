# Room Management - Available for Booking Feature

## Overview
The Room Management page now includes comprehensive functionality to control whether individual rooms are available for booking. This feature allows hotel staff to easily activate or deactivate rooms for guest reservations.

## New Features

### 1. Individual Room Availability Toggle
- Each room now displays a visual indicator showing whether it's available for booking
- Toggle button (✓/✗) to quickly activate/deactivate rooms for booking
- Real-time status updates with visual feedback

### 2. Bulk Room Management
- Select multiple rooms using checkboxes
- Bulk activate/deactivate multiple rooms at once
- Select all rooms option for mass operations

### 3. Enhanced Filtering
- Filter rooms by status (available, occupied, maintenance, etc.)
- Filter rooms by booking availability (available for booking, not available for booking)
- Search functionality to find specific rooms

### 4. Room Availability Statistics
- Visual dashboard showing count of rooms available for booking
- Percentage breakdown of room availability
- Quick overview of total room inventory

## How to Use

### Activating a Single Room for Booking
1. Navigate to Dashboard → Room Management
2. Find the room you want to activate
3. Click the toggle button (✓) next to the room
4. The room status will update immediately

### Deactivating a Room from Booking
1. Find the room you want to deactivate
2. Click the toggle button (✗) next to the room
3. The room will no longer appear in available room searches

### Bulk Operations
1. Use checkboxes to select multiple rooms
2. Use the "Select All" option to select all filtered rooms
3. Click "Activate for Booking" or "Deactivate for Booking" buttons
4. All selected rooms will be updated simultaneously

### Filtering Rooms
1. Use the search bar to find specific rooms by number or type
2. Use the status filter to show rooms with specific operational status
3. Use the availability filter to show only rooms available/not available for booking

## Technical Implementation

### Database Schema
- Added `availableForBooking` boolean field to the `rooms` table
- Default value: `true` (rooms are available for booking by default)
- Field is included in all room API responses

### API Endpoints
- `PUT /api/rooms/individual/[id]` - Updated to handle `availableForBooking` field
- `GET /api/rooms/individual` - Returns rooms with availability status
- `GET /api/rooms/individual/[id]` - Returns individual room with availability status

### Frontend Components
- Enhanced room management page with availability controls
- Bulk selection and operations
- Real-time status updates
- Visual indicators for room availability

## Benefits

1. **Flexible Room Management**: Staff can easily control which rooms are bookable
2. **Bulk Operations**: Save time by managing multiple rooms simultaneously
3. **Clear Visibility**: Easy to see which rooms are available for booking
4. **Operational Control**: Prevent bookings for rooms under maintenance or out of service
5. **Inventory Management**: Better control over room availability and capacity

## Use Cases

- **Maintenance**: Deactivate rooms during maintenance or repairs
- **Seasonal Operations**: Deactivate rooms during off-season periods
- **Special Events**: Reserve rooms for special events or VIP guests
- **Inventory Control**: Manage room availability based on operational needs
- **Emergency Situations**: Quickly deactivate rooms in emergency situations

## Notes

- Rooms marked as "not available for booking" will not appear in guest booking searches
- Room status (available, occupied, maintenance) is separate from booking availability
- Changes take effect immediately and are reflected in real-time
- All operations are logged and can be tracked through the system
