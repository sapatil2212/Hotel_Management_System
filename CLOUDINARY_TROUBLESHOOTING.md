# Cloudinary Upload Troubleshooting Guide

## Current Status

The Cloudinary upload is still failing with "Invalid Signature" errors. Here's what we've done to fix it:

### 1. Fixed Signature Generation
- Created multiple signature generation endpoints with different approaches
- Added proper parameter sorting and string formatting
- Used Cloudinary's built-in signature generation method

### 2. Added Debug Endpoints
- `/api/debug/cloudinary-config` - Check environment variables
- `/api/uploads/cloudinary-signature-v3` - New signature endpoint using Cloudinary package

### 3. Improved Error Handling
- Better error messages and debugging information
- Fallback to local upload (disabled on Vercel)

## Debugging Steps

### Step 1: Check Environment Variables
Visit `/api/debug/cloudinary-config` in your browser to verify:
- All three environment variables are set
- The values are correct
- Signature generation works

### Step 2: Test Signature Generation
The new endpoint `/api/uploads/cloudinary-signature-v3` uses Cloudinary's official package for signature generation.

### Step 3: Check Browser Console
Look for these logs:
- "Cloudinary signature generation v3: ..."
- "Cloudinary upload params: ..."
- Any error messages

## Common Issues and Solutions

### Issue 1: "Invalid Signature" Error
**Cause**: Incorrect signature generation or wrong API secret
**Solution**: 
1. Verify API secret in Vercel environment variables
2. Use the new signature endpoint (`/api/uploads/cloudinary-signature-v3`)
3. Check that the cloud name matches your Cloudinary account

### Issue 2: "Cloudinary env not configured" Error
**Cause**: Missing or incorrect environment variables
**Solution**:
1. Set all three environment variables in Vercel:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Redeploy after setting variables

### Issue 3: "Local upload failed" Error
**Cause**: Local upload is disabled on Vercel
**Solution**: This is expected behavior. Fix Cloudinary configuration instead.

## Environment Variables Setup

### Required Variables:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### How to Set on Vercel:
1. Go to Vercel Dashboard → Your Project → Settings
2. Click "Environment Variables"
3. Add each variable with all environments selected
4. Redeploy the project

## Testing the Fix

1. **Redeploy your application** after setting environment variables
2. **Visit the debug endpoint**: `/api/debug/cloudinary-config`
3. **Try uploading a logo** from the hotel info page
4. **Check browser console** for success/error messages

## Alternative Solutions

### Option 1: Use Cloudinary Upload Widget
If direct API uploads continue to fail, consider using Cloudinary's upload widget:

```bash
npm install cloudinary-react
```

### Option 2: Server-Side Upload
Upload files to your server first, then upload to Cloudinary from the server.

### Option 3: Use Different Cloudinary Account
Create a new Cloudinary account and use fresh credentials.

## Next Steps

1. **Set the environment variables** in Vercel
2. **Redeploy the application**
3. **Test the upload functionality**
4. **Check the debug endpoint** for configuration status
5. **Monitor browser console** for detailed error messages

## Support

If issues persist:
1. Check Vercel logs for detailed error information
2. Verify Cloudinary credentials in your Cloudinary dashboard
3. Test locally with a `.env.local` file first
4. Contact support with the debug endpoint output
