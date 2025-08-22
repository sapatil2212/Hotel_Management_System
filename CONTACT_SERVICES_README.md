# Contact & Services System

This document describes the new interactive contact and services functionality added to the Hotel Management System.

## Features Overview

### 1. Contact System
- **Interactive Contact Form**: Modern, responsive contact form with validation
- **Email Notifications**: Automatic emails sent to both user and admin
- **Enquiry Management**: Complete dashboard for managing customer enquiries
- **Status Tracking**: Track enquiry status (new, in-progress, resolved, closed)
- **Priority Levels**: Assign priority levels (low, medium, high, urgent)

### 2. Services Showcase
- **Services Page**: Beautiful showcase of hotel services
- **Service Categories**: Organized by accommodation, dining, wellness, etc.
- **Interactive Cards**: Hover effects and detailed service information
- **Call-to-Action**: Direct booking and contact options

## Database Schema

### Enquiry Model
```prisma
model enquiry {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  subject     String
  message     String   @db.Text
  status      enquiry_status @default(new)
  priority    enquiry_priority @default(medium)
  source      String   @default("website")
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  assignedTo  String?
  notes       String?  @db.Text
  resolvedAt  DateTime?

  @@index([status])
  @@index([priority])
  @@index([createdAt])
  @@index([email])
}
```

## Pages & Routes

### Public Pages
- `/contact` - Contact form and information
- `/services` - Hotel services showcase

### Dashboard Pages
- `/dashboard/enquiries` - Enquiry management dashboard

### API Endpoints
- `POST /api/contact/submit` - Submit contact form
- `GET /api/enquiries` - Fetch all enquiries
- `PATCH /api/enquiries/[id]/status` - Update enquiry status
- `POST /api/enquiries/[id]/reply` - Send reply to enquiry

## Components

### Contact Components
- `components/contact/contact-form.tsx` - Main contact form
- `components/contact/contact-info.tsx` - Contact information display

### Services Components
- `components/services/service-hero.tsx` - Services page hero section
- `components/services/services-grid.tsx` - Services grid display

### Dashboard Components
- `app/dashboard/enquiries/page.tsx` - Enquiry management page

## Email Templates

### User Confirmation Email
- Sent to user when they submit a contact form
- Includes their message details
- Professional hotel branding

### Admin Notification Email
- Sent to admin when new enquiry is received
- Includes all enquiry details
- Action required notification

### Reply Email
- Sent to user when admin responds
- Includes original enquiry and response
- Professional formatting

## Features

### Contact Form Features
- ✅ Form validation (name, email, subject, message)
- ✅ Subject dropdown with predefined options
- ✅ Phone number (optional)
- ✅ Success/error notifications
- ✅ Loading states
- ✅ Responsive design

### Enquiry Management Features
- ✅ View all enquiries
- ✅ Filter by status and priority
- ✅ Search functionality
- ✅ Update enquiry status
- ✅ Send replies to customers
- ✅ Statistics dashboard
- ✅ Real-time updates

### Services Features
- ✅ Service categories
- ✅ Detailed service descriptions
- ✅ Pricing information
- ✅ Feature lists
- ✅ Popular service highlighting
- ✅ Call-to-action buttons

## Usage

### For Users
1. Navigate to `/contact`
2. Fill out the contact form
3. Submit and receive confirmation email
4. Wait for response from hotel staff

### For Admins
1. Access `/dashboard/enquiries`
2. View all customer enquiries
3. Filter and search as needed
4. Update status and send replies
5. Track enquiry statistics

## Configuration

### Email Settings
The system uses the existing email configuration from:
- `lib/email.ts` - Email service setup
- `lib/email-templates.ts` - Email template functions

### Hotel Information
Contact information is pulled from the hotel info section:
- Admin email from `hotelinfo.primaryEmail`
- Hotel name and branding from hotel info

## Security Features

- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Rate limiting (via existing middleware)
- ✅ Authentication required for admin functions
- ✅ IP address and user agent tracking

## Responsive Design

All components are fully responsive and work on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones
- ✅ Different screen sizes

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ Progressive enhancement

## Performance

- ✅ Optimized database queries
- ✅ Efficient email sending
- ✅ Minimal bundle size
- ✅ Fast loading times

## Future Enhancements

Potential improvements for future versions:
- [ ] Email templates customization
- [ ] Advanced filtering options
- [ ] Bulk operations
- [ ] Email threading
- [ ] Integration with CRM systems
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] File attachments
- [ ] Chat integration

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check email configuration in `.env`
   - Verify SMTP settings
   - Check server logs

2. **Form not submitting**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check network connectivity

3. **Database errors**
   - Run `npx prisma db push` to sync schema
   - Check database connection
   - Verify environment variables

### Support

For technical support or questions about this implementation, please refer to the main project documentation or contact the development team.
