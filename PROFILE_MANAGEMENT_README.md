# Profile Management System

## Overview

This document describes the implementation of a comprehensive profile management system for the Hotel Management System dashboard. The feature provides users with an intuitive interface to manage their personal information, profile pictures, and account settings.

## Features Implemented

### 1. Profile Management Interface
- **Modern UI Design**: Clean, professional interface matching the provided design reference
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Tabbed Navigation**: Organized sections for different settings categories

### 2. Personal Information Management
- **Editable Fields**:
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Phone Number
  - Bio/Description
- **Real-time Validation**: Form validation with visual feedback
- **Auto-save Functionality**: Changes are saved to the database

### 3. Profile Picture Management
- **Avatar Upload**: Click camera icon to upload profile picture
- **Cover Image Upload**: Click "Edit Cover" to upload cover image
- **File Validation**: 
  - Image files only
  - Maximum file size: 5MB
  - Automatic preview
- **Drag & Drop Support**: Intuitive file selection

### 4. Visual Design Elements
- **Cover Section**: Gradient background with customizable cover image
- **Profile Avatar**: Large circular avatar with edit button overlay
- **Action Buttons**: Message and Connect buttons (placeholder functionality)
- **Navigation Sidebar**: Clean tab navigation with icons

### 5. User Experience Features
- **Toast Notifications**: Success and error feedback
- **Loading States**: Visual feedback during save operations
- **Form Validation**: Real-time validation with error highlighting
- **Responsive Design**: Mobile-friendly layout

## Technical Implementation

### Frontend Components

#### Main Page: `app/dashboard/settings/page.tsx`
- React component with TypeScript
- Uses Next.js 13+ app router
- Integrates with NextAuth for session management
- Implements form state management with React hooks

#### Key Features:
```typescript
interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  avatar?: string
  coverImage?: string
}
```

### Backend API

#### Profile Update Endpoint: `app/api/users/route.ts`
- **PUT /api/users**: Update user profile information
- **Authentication**: Requires valid session
- **Validation**: Server-side validation for required fields
- **Database**: Updates user record in Prisma database

#### API Features:
- Email uniqueness validation
- Required field validation
- Error handling and response formatting
- Database transaction safety

### Database Schema

The profile management system uses the existing `user` model in Prisma:

```prisma
model user {
  id              String    @id
  name            String
  email           String    @unique
  phone           String
  role            user_role
  passwordHash    String
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime
  // ... other relations
}
```

## Usage Instructions

### For Users

1. **Access Profile Settings**:
   - Click on avatar in dashboard header
   - Select "Profile" from dropdown menu
   - Navigate to `/dashboard/settings`

2. **Edit Personal Information**:
   - Fill in required fields (marked with *)
   - Add optional information like phone and bio
   - Click "Save Changes" to update

3. **Upload Profile Pictures**:
   - Click camera icon on avatar to change profile picture
   - Click "Edit Cover" to change cover image
   - Select image files (max 5MB)

4. **Navigate Between Sections**:
   - Use left sidebar to switch between different settings
   - Currently implemented: Personal Info
   - Placeholder sections: Security, Notifications, Billing, Activity

### For Developers

#### Adding New Profile Fields

1. **Update Database Schema**:
   ```prisma
   model user {
     // ... existing fields
     bio String? @db.Text
     avatarUrl String?
     coverImageUrl String?
   }
   ```

2. **Update TypeScript Interface**:
   ```typescript
   interface ProfileData {
     // ... existing fields
     bio: string
     avatar?: string
     coverImage?: string
   }
   ```

3. **Update API Endpoint**:
   ```typescript
   // In app/api/users/route.ts
   const { firstName, lastName, email, phone, bio } = body
   ```

4. **Update Frontend Form**:
   ```typescript
   // Add new form fields in settings page
   ```

#### Customizing the Design

The profile management interface uses Tailwind CSS classes and can be customized by:

1. **Modifying Colors**: Update gradient classes in cover section
2. **Changing Layout**: Adjust grid classes for different screen sizes
3. **Adding Animations**: Include transition classes for smooth interactions
4. **Customizing Components**: Modify shadcn/ui components as needed

## Security Considerations

1. **Authentication**: All profile updates require valid session
2. **Input Validation**: Both client and server-side validation
3. **File Upload Security**: File type and size validation
4. **Email Uniqueness**: Prevents duplicate email addresses
5. **XSS Prevention**: Proper input sanitization

## Future Enhancements

### Planned Features
1. **Password Change**: Security tab implementation
2. **Two-Factor Authentication**: Enhanced security options
3. **Notification Preferences**: Customizable notification settings
4. **Activity Log**: User activity tracking
5. **Profile Export**: Data export functionality

### Technical Improvements
1. **Image Optimization**: Automatic image compression and resizing
2. **Cloud Storage**: Integration with cloud storage for images
3. **Real-time Updates**: WebSocket integration for live updates
4. **Advanced Validation**: More sophisticated form validation
5. **Accessibility**: Enhanced accessibility features

## Dependencies

- **Next.js 13+**: React framework
- **NextAuth.js**: Authentication
- **Prisma**: Database ORM
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Lucide React**: Icons
- **React Hook Form**: Form management (optional enhancement)

## File Structure

```
app/
├── dashboard/
│   └── settings/
│       └── page.tsx              # Main profile management page
├── api/
│   └── users/
│       └── route.ts              # Profile update API endpoint
components/
├── ui/                           # shadcn/ui components
└── dashboard/
    └── topbar.tsx               # Updated with profile link
hooks/
└── use-toast.ts                 # Toast notification system
```

## Testing

### Manual Testing Checklist
- [ ] Profile information updates correctly
- [ ] Form validation works as expected
- [ ] File upload functionality works
- [ ] Toast notifications display properly
- [ ] Responsive design works on mobile
- [ ] Error handling works correctly
- [ ] Session management works properly

### Automated Testing (Future)
- Unit tests for API endpoints
- Integration tests for form submission
- E2E tests for complete user flows
- Visual regression tests for UI consistency

## Troubleshooting

### Common Issues

1. **Profile Picture Not Uploading**:
   - Check file size (max 5MB)
   - Ensure file is an image format
   - Verify browser supports FileReader API

2. **Save Button Not Working**:
   - Check required fields are filled
   - Verify email format is valid
   - Check browser console for errors

3. **Session Issues**:
   - Ensure user is logged in
   - Check NextAuth configuration
   - Verify session token is valid

### Debug Mode

Enable debug logging by adding to `next.config.js`:
```javascript
module.exports = {
  // ... other config
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

## Contributing

When contributing to the profile management system:

1. Follow existing code patterns
2. Add proper TypeScript types
3. Include error handling
4. Test on multiple devices
5. Update documentation
6. Follow accessibility guidelines

## License

This feature is part of the Hotel Management System and follows the same licensing terms as the main project.
