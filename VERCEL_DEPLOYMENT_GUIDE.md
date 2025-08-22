# Vercel Deployment Guide - Environment Variables Setup

## Cloudinary Configuration

To fix the upload issues on Vercel, you need to configure the following environment variables in your Vercel project:

### Required Environment Variables

1. **CLOUDINARY_CLOUD_NAME**
   - Your Cloudinary cloud name (found in your Cloudinary dashboard)
   - Example: `your-cloud-name`

2. **CLOUDINARY_API_KEY**
   - Your Cloudinary API key (found in your Cloudinary dashboard)
   - Example: `123456789012345`

3. **CLOUDINARY_API_SECRET**
   - Your Cloudinary API secret (found in your Cloudinary dashboard)
   - Example: `your-api-secret-here`

### How to Set Environment Variables on Vercel

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to the "Settings" tab

3. **Environment Variables**
   - Click on "Environment Variables" in the left sidebar
   - Add each variable:
     - **Name**: `CLOUDINARY_CLOUD_NAME`
     - **Value**: Your cloud name
     - **Environment**: Production, Preview, Development (select all)

4. **Repeat for all variables**
   - Add `CLOUDINARY_API_KEY`
   - Add `CLOUDINARY_API_SECRET`

5. **Redeploy**
   - After adding all variables, redeploy your project
   - Go to "Deployments" tab
   - Click "Redeploy" on your latest deployment

### Other Required Environment Variables

Make sure you also have these variables set:

- `DATABASE_URL` - Your database connection string
- `NEXTAUTH_SECRET` - A random string for NextAuth
- `NEXTAUTH_URL` - Your site URL (e.g., `https://your-domain.vercel.app`)

### Testing the Configuration

After setting up the environment variables:

1. **Redeploy your application**
2. **Try uploading a logo from the hotel info page**
3. **Check the browser console for any remaining errors**

### Troubleshooting

If you still see errors:

1. **Check Vercel logs**
   - Go to your deployment
   - Click on "Functions" tab
   - Check for any error logs

2. **Verify Cloudinary credentials**
   - Log into your Cloudinary dashboard
   - Verify the cloud name, API key, and secret are correct

3. **Test locally first**
   - Create a `.env.local` file with the same variables
   - Test uploads locally before deploying

### Alternative: Using Cloudinary Upload Widget

If you continue to have issues, consider using Cloudinary's upload widget instead of direct API calls. This can be more reliable for client-side uploads.

## Important Notes

- **Never commit environment variables to your repository**
- **Use different Cloudinary accounts for development and production**
- **Regularly rotate your API secrets for security**
- **Monitor your Cloudinary usage to avoid unexpected charges**
