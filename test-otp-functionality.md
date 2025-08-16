# OTP Functionality Test Guide

## Changes Implemented

### 1. OTP Validation Time
- ✅ Changed OTP expiration from 10 minutes to 2 minutes
- ✅ Updated in both registration and forgot password flows
- ✅ Updated email template to reflect 2-minute expiration

### 2. Resend OTP Functionality
- ✅ Added 1-minute cooldown timer for resend functionality
- ✅ Timer shows countdown format (MM:SS)
- ✅ Resend button is disabled during cooldown
- ✅ Available on both signup and forgot password forms

### 3. Button Loaders
- ✅ Added rotating loader directly on buttons during processing
- ✅ Button states properly managed during operations
- ✅ Loading text changes based on current operation
- ✅ Clean, inline loading experience without popups

### 4. Password Field Enhancements
- ✅ Added eye icon toggle for password visibility
- ✅ Works on both sign-in and sign-up forms
- ✅ Eye icon shows/hides password text

### 5. Social Login Removal
- ✅ Removed Facebook and Google login buttons from sign-in form
- ✅ Clean, simplified authentication interface

### 6. Contact Modal
- ✅ Created contact modal with specified information:
  - Phone: +91 8830553868
  - Email: saptechnoeditors@gmail.com
- ✅ Added clickable "Help" button in sign-in form
- ✅ Modal includes direct call and email buttons

## Test Scenarios

### Sign-up Flow
1. Navigate to `/auth/sign-up`
2. Fill in registration details
3. Click "Request OTP"
4. Verify button shows rotating loader with "Sending OTP..." text
5. Verify OTP is sent and 1-minute timer starts
6. Try to resend before timer expires (should be disabled)
7. Wait for timer to complete
8. Click "Resend OTP" (should work with button loader)
9. Enter OTP and complete registration
10. Verify button shows rotating loader with "Creating Account..." text

### Forgot Password Flow
1. Navigate to `/auth/forgot-password`
2. Enter email address
3. Click "Send Reset Code"
4. Verify button shows rotating loader with "Sending OTP..." text
5. Verify OTP is sent and 1-minute timer starts
6. Enter OTP code
7. Enter new password with eye icon toggle
8. Confirm password with eye icon toggle
9. Complete password reset
10. Verify button shows rotating loader with "Resetting password..." text

### Sign-in Flow
1. Navigate to `/auth/sign-in`
2. Verify no social login buttons
3. Test password field eye icon toggle
4. Click "Help" button to open contact modal
5. Verify contact information in modal

### OTP Expiration Test
1. Request OTP
2. Wait 2 minutes
3. Try to verify OTP (should show "OTP expired" error)

## API Endpoints

### Registration OTP
- Request: `POST /api/auth/register/request-otp`
- Verify: `POST /api/auth/register/verify-otp`

### Forgot Password OTP
- Request: `POST /api/auth/forgot-password/request-otp`
- Verify: `POST /api/auth/forgot-password/verify-otp`

## Database Schema
The OTP system uses the existing `emailotp` table with:
- `expiresAt`: Set to 2 minutes from creation
- `purpose`: "register" or "reset_password"
- `attempts`: Tracks failed attempts (max 5)

## Security Features
- ✅ OTP expires after 2 minutes
- ✅ Maximum 5 failed attempts
- ✅ 1-minute cooldown for resend
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod schemas
