# HTTP 431 Error Troubleshooting Guide

## What is HTTP 431 Error?

HTTP 431 "Request Header Fields Too Large" occurs when the request headers exceed the server's size limit. In your case, this is happening because multiple NextAuth session tokens are accumulating as cookies, making the request headers too large.

## Root Cause

The issue is caused by:
1. Multiple failed login attempts creating multiple session tokens
2. Session tokens not being properly cleared on logout
3. Browser caching multiple versions of the same cookie
4. NextAuth creating new tokens without clearing old ones

## Solutions

### 1. Automatic Solution (Recommended)

The application now includes automatic detection and cleanup:

- **Middleware Detection**: The middleware now detects when request headers exceed 8KB and automatically redirects to the emergency clear page
- **Emergency Clear Page**: Automatically clears all session data and redirects to login
- **Enhanced Cookie Management**: Better session token management to prevent accumulation

### 2. Manual Browser Clear

If automatic clearing doesn't work:

1. **Open Browser Developer Tools** (F12)
2. **Go to Application/Storage tab**
3. **Clear all cookies** for your domain
4. **Clear local storage and session storage**
5. **Refresh the page**

### 3. Console Script

Run this script in your browser console:

```javascript
// Copy and paste this into browser console
function emergencyClear() {
  const cookies = document.cookie.split(";");
  cookies.forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`;
  });
  localStorage.clear();
  sessionStorage.clear();
  console.log("Cookies cleared!");
}
emergencyClear();
```

### 4. Emergency Clear Page

Navigate to `/emergency-clear` in your browser to use the built-in emergency clear functionality.

### 5. API Endpoints

You can also call these API endpoints directly:

- `POST /api/auth/clear-session` - Clears main session cookies
- `POST /api/auth/force-clear` - Comprehensive cookie cleanup

## Prevention

To prevent this issue in the future:

1. **Always log out properly** using the logout button
2. **Don't open multiple tabs** with different login sessions
3. **Clear browser data** if you experience authentication issues
4. **Use incognito/private mode** for testing

## Technical Details

### Cookie Names to Clear

The main cookies that cause this issue are:
- `next-auth.session-token`
- `__Secure-next-auth.session-token`
- `next-auth.csrf-token`
- `__Secure-next-auth.csrf-token`
- `next-auth.callback-url`
- `__Secure-next-auth.callback-url`

### Server Configuration

If you're using a reverse proxy (nginx, Apache), you may need to increase the header size limit:

**Nginx:**
```nginx
client_header_buffer_size 16k;
large_client_header_buffers 4 16k;
```

**Apache:**
```apache
LimitRequestFieldSize 16384
```

## Getting Help

If you continue to experience issues:

1. Check the browser console for errors
2. Try the emergency clear page
3. Clear all browser data manually
4. Contact support with the specific error details

## Files Modified

The following files were updated to fix this issue:

- `middleware.ts` - Added header size detection and automatic cleanup
- `lib/auth-options.ts` - Enhanced session management
- `app/api/auth/clear-session/route.ts` - New focused session clearing API
- `app/api/auth/force-clear/route.ts` - Enhanced comprehensive clearing
- `app/emergency-clear/page.tsx` - Improved emergency clear functionality
- `scripts/clear-cookies.js` - Manual cookie clearing script

