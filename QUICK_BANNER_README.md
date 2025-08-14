# Quick Banner Feature

A dynamic banner component that displays contact information and promotional offers above the main navigation header. The banner fetches real-time data from the backend and provides an engaging user experience.

## Features

### 🎯 **Contact Information**
- **Primary Phone**: Displays the hotel's main contact number
- **Reservation Email**: Shows the reservation email address
- **Hotel Address**: Displays the complete hotel address
- **Responsive Design**: Adapts to mobile and desktop layouts

### 🎁 **Promotional Offers**
- **Auto-rotating**: Automatically cycles through active promo codes
- **Manual Navigation**: Users can manually browse offers with arrow buttons
- **Real-time Data**: Fetches active and valid promo codes from the backend
- **Smart Filtering**: Only shows currently valid and active offers
- **Visual Indicators**: Shows current offer position (e.g., "2 of 5")

### 🎨 **User Experience**
- **Dismissible**: Users can close the banner if desired
- **Loading States**: Shows loading spinner while fetching data
- **Error Handling**: Gracefully handles API failures
- **Dark Mode Support**: Fully compatible with dark/light themes
- **Mobile Optimized**: Responsive design for all screen sizes

## Components

### QuickBanner Component
```tsx
// components/layout/quick-banner.tsx
export function QuickBanner() {
  // Fetches contact info from hotel context
  // Fetches promo codes from API
  // Handles auto-rotation and user interactions
}
```

### Featured Promo Codes API
```tsx
// app/api/promo-codes/featured/route.ts
// GET /api/promo-codes/featured?limit=5
// Returns active and valid promo codes
```

## Implementation

### 1. **Backend Setup**

The banner uses two main data sources:

#### Hotel Information (Contact Details)
- **Endpoint**: `/api/hotel-info`
- **Context**: `useHotel()` hook
- **Fields Used**:
  - `primaryPhone`
  - `reservationEmail`
  - `address`

#### Promotional Offers
- **Endpoint**: `/api/promo-codes/featured`
- **Query Parameters**:
  - `limit`: Number of offers to fetch (default: 5)
- **Filters Applied**:
  - `isActive: true`
  - `validFrom <= now`
  - `validUntil >= now`
- **Sorting**:
  - Expiring soon first
  - Then by creation date

### 2. **Frontend Integration**

#### Basic Usage
```tsx
import { QuickBanner } from "@/components/layout/quick-banner"
import { Navigation } from "@/components/layout/navigation"

function Layout() {
  return (
    <>
      <QuickBanner />
      <Navigation />
      {/* Rest of your layout */}
    </>
  )
}
```

#### With Hotel Context
```tsx
import { HotelProvider } from "@/contexts/hotel-context"

function App() {
  return (
    <HotelProvider>
      <Layout />
    </HotelProvider>
  )
}
```

### 3. **Data Flow**

```
1. Component Mounts
   ↓
2. Fetch Hotel Info (from context)
   ↓
3. Fetch Featured Promo Codes (from API)
   ↓
4. Display Contact Info + Rotating Offers
   ↓
5. Auto-rotate every 5 seconds
   ↓
6. Handle user interactions (close, navigate)
```

## API Endpoints

### GET /api/promo-codes/featured
Fetches active and valid promotional offers for the banner.

**Query Parameters:**
- `limit` (optional): Number of offers to return (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "promo_123",
      "code": "WELCOME10",
      "title": "Welcome 10% Off",
      "description": "Get 10% off on your first booking",
      "discountType": "percentage",
      "discountValue": 10,
      "validUntil": "2024-12-31T23:59:59Z",
      "isActive": true
    }
  ],
  "message": "Featured promo codes fetched successfully"
}
```

## Customization

### Styling
The banner uses Tailwind CSS classes and can be customized:

```tsx
// Custom background gradient
<div className="bg-gradient-to-r from-blue-50 to-purple-50">

// Custom text colors
<span className="text-blue-700 hover:text-blue-900">

// Custom badge styling
<Badge className="bg-blue-100 text-blue-800">
```

### Behavior
You can customize the banner behavior:

```tsx
// Change auto-rotation interval (default: 5000ms)
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length)
  }, 3000) // 3 seconds instead of 5

  return () => clearInterval(interval)
}, [promoCodes.length])

// Disable auto-rotation
// Remove the useEffect for auto-rotation

// Change the number of offers fetched
const response = await fetch('/api/promo-codes/featured?limit=10')
```

## Testing

### Test Page
Visit `/test-banner` to see the banner in action with:
- Toggle banner visibility
- Test responsive design
- View documentation
- See API endpoints

### Manual Testing
1. **Contact Info**: Update hotel info in dashboard
2. **Promo Codes**: Create/update promo codes in dashboard
3. **Responsive**: Test on mobile and desktop
4. **Dark Mode**: Toggle theme to test dark mode

## Best Practices

### 1. **Performance**
- Banner data is cached in hotel context
- Promo codes are fetched once on mount
- Auto-rotation uses efficient state updates

### 2. **User Experience**
- Banner is dismissible to avoid annoyance
- Loading states provide feedback
- Error states are handled gracefully
- Mobile-first responsive design

### 3. **Accessibility**
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatible
- High contrast colors

### 4. **SEO**
- Contact information is visible to search engines
- Structured data for local business
- Fast loading times

## Troubleshooting

### Common Issues

#### Banner Not Showing
1. Check if hotel context is properly set up
2. Verify API endpoints are working
3. Check browser console for errors

#### No Promo Codes Displayed
1. Ensure promo codes exist in database
2. Check if codes are active and valid
3. Verify API response format

#### Contact Info Missing
1. Update hotel information in dashboard
2. Check hotel context data
3. Verify field names match

#### Mobile Issues
1. Test responsive breakpoints
2. Check touch interactions
3. Verify text truncation

### Debug Mode
Add debug logging to troubleshoot:

```tsx
useEffect(() => {
  const fetchFeaturedPromoCodes = async () => {
    try {
      console.log('Fetching featured promo codes...')
      const response = await fetch('/api/promo-codes/featured?limit=5')
      const data = await response.json()
      console.log('Promo codes response:', data)
      
      if (data.success && data.data.length > 0) {
        setPromoCodes(data.data)
      }
    } catch (error) {
      console.error('Error fetching featured promo codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  fetchFeaturedPromoCodes()
}, [])
```

## Future Enhancements

### Potential Features
1. **Clickable Offers**: Link promo codes to booking pages
2. **Analytics**: Track banner interactions
3. **A/B Testing**: Test different banner designs
4. **Personalization**: Show offers based on user behavior
5. **Geolocation**: Show location-specific offers
6. **Seasonal Themes**: Different designs for holidays

### Performance Optimizations
1. **Caching**: Cache promo codes in localStorage
2. **Preloading**: Preload next offer image
3. **Lazy Loading**: Load offers on demand
4. **CDN**: Serve static assets from CDN

## Support

For issues or questions about the quick banner feature:
1. Check the test page at `/test-banner`
2. Review the API documentation
3. Check browser console for errors
4. Verify data in the dashboard
