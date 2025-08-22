# Cloudinary Setup Guide for Vercel Deployment

## Current Issues Fixed

1. **Invalid Signature Error**: Fixed the signature generation algorithm
2. **Dynamic Server Usage Errors**: Added `export const dynamic = 'force-dynamic'` to API routes
3. **Local Upload Fallback**: Improved error handling for Vercel's serverless environment

## Environment Variables Required

You need to set these environment variables in your Vercel project:

### Required Variables:
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key  
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### How to Set Environment Variables on Vercel:

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to the "Settings" tab

3. **Environment Variables**
   - Click on "Environment Variables" in the left sidebar
   - Add each variable:
     - **Name**: `CLOUDINARY_CLOUD_NAME`
     - **Value**: Your cloud name (e.g., `your-cloud-name`)
     - **Environment**: Production, Preview, Development (select all)

4. **Repeat for all variables**
   - Add `CLOUDINARY_API_KEY` with your API key
   - Add `CLOUDINARY_API_SECRET` with your API secret

5. **Redeploy**
   - After adding all variables, redeploy your project
   - Go to "Deployments" tab
   - Click "Redeploy" on your latest deployment

## Getting Cloudinary Credentials

1. **Sign up/Login to Cloudinary**
   - Visit [cloudinary.com](https://cloudinary.com)
   - Create an account or login

2. **Get Your Credentials**
   - Go to Dashboard
   - Find your Cloud Name, API Key, and API Secret
   - Copy these values

3. **Example Values:**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret-here
   ```

## Testing the Configuration

After setting up the environment variables:

1. **Redeploy your application**
2. **Try uploading a logo from the hotel info page**
3. **Check the browser console for any errors**
4. **Look for these success messages:**
   - "Cloudinary upload params: ..."
   - "Cloudinary upload successful: ..."

## Troubleshooting

### If you still see "Invalid Signature" errors:

1. **Check Environment Variables**
   - Verify all three variables are set correctly
   - Make sure there are no extra spaces or characters

2. **Check Cloudinary Dashboard**
   - Verify your cloud name is correct
   - Ensure your API key and secret are active

3. **Check Browser Console**
   - Look for the "Cloudinary upload params" log
   - Verify the cloudName matches your Cloudinary cloud name

### If you see "Cloudinary configuration required" errors:

1. **Environment variables not set**
   - Double-check all three variables are set in Vercel
   - Redeploy after setting variables

2. **Variables not accessible**
   - Ensure variables are set for all environments (Production, Preview, Development)
   - Check that the variable names are exactly correct

## Alternative: Using Cloudinary Upload Widget

If you continue to have issues with direct API uploads, consider using Cloudinary's upload widget:

1. **Install Cloudinary Widget**
   ```bash
   npm install cloudinary-react
   ```

2. **Use Upload Widget Component**
   - More reliable for client-side uploads
   - Handles authentication automatically
   - Better error handling

## Important Notes

- **Never commit environment variables to your repository**
- **Use different Cloudinary accounts for development and production**
- **Regularly rotate your API secrets for security**
- **Monitor your Cloudinary usage to avoid unexpected charges**
- **The local upload fallback is disabled on Vercel for security reasons**

## Support

If you continue to have issues:

1. **Check Vercel logs** for detailed error information
2. **Verify Cloudinary credentials** in your Cloudinary dashboard
3. **Test locally first** with a `.env.local` file
4. **Contact support** if the issue persists
