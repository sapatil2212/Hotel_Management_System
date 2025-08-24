# Room Types Debug Guide

## Issue Description
The room management page is not showing room types in the dropdown when trying to add new rooms. This issue occurs after deployment on Vercel but works locally.

## Root Cause Analysis
The most likely causes are:

1. **Database not seeded**: The production database might not have room types created
2. **API endpoint issues**: The `/api/room-types/available` endpoint might be failing
3. **Database connection issues**: Production database connection might be problematic
4. **Migration issues**: Database migrations might not have run properly

## Debugging Steps

### 1. Check Database State
Run the database check script to verify the current state:

```bash
node scripts/check-db-state.js
```

This will show:
- Database connection status
- Number of room types in the database
- Number of individual rooms
- Sample data

### 2. Use the Debug Page
Visit the debug page to get a visual overview:

```
/debug-room-types
```

This page will:
- Check database health
- Test the room types API
- Provide recommendations
- Allow you to seed room types if needed

### 3. Test API Endpoints
Test the following endpoints directly:

- `/api/health` - Check database connectivity
- `/api/room-types/available` - Get room types with availability
- `/api/room-types` - Get all room types

### 4. Check Vercel Logs
Check the Vercel deployment logs for any errors:
- Go to your Vercel dashboard
- Select your project
- Check the "Functions" tab for API errors
- Look for any database connection errors

## Solutions

### Solution 1: Seed the Database
If no room types exist, seed the database:

**Option A: Use the debug page**
1. Go to `/debug-room-types`
2. Click "Seed Room Types"
3. This will create sample room types and rooms

**Option B: Use the API endpoint**
```bash
curl -X POST https://your-domain.vercel.app/api/debug/seed-room-types
```

**Option C: Run the seed script locally**
```bash
npm run db:seed
```

### Solution 2: Manual Room Type Creation
If seeding doesn't work, create room types manually:

1. Go to `/dashboard/rooms`
2. Create room types with the following details:
   - **Deluxe**: 1 total room, price 2000 INR
   - **Super Deluxe Room**: 5 total rooms, price 5000 INR

### Solution 3: Check Environment Variables
Verify that the production environment has the correct database URL:

1. In Vercel dashboard, go to Settings > Environment Variables
2. Ensure `DATABASE_URL` is set correctly
3. The URL should point to your production database

### Solution 4: Force Database Migration
If migrations haven't run:

```bash
# In Vercel, you can trigger a new deployment
# Or run migrations manually if you have database access
npx prisma migrate deploy
```

## Prevention

To prevent this issue in future deployments:

1. **Add seeding to build process**: Modify the build script to include seeding:
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && npm run db:seed && next build"
     }
   }
   ```

2. **Add health checks**: The health endpoint will help monitor database state

3. **Add error handling**: The room management page now shows helpful messages when no room types are found

## Files Modified

The following files were modified to add debugging and error handling:

- `app/api/room-types/available/route.ts` - Added logging and better error handling
- `app/api/health/route.ts` - Enhanced health check
- `app/dashboard/room-manage/page.tsx` - Added fallback UI for empty states
- `app/api/debug/seed-room-types/route.ts` - New endpoint for seeding
- `app/debug-room-types/page.tsx` - New debug page
- `scripts/check-db-state.js` - Enhanced database check script

## Testing

After implementing the fix:

1. Visit `/debug-room-types` to verify the system is working
2. Go to `/dashboard/room-manage` to test the room management page
3. Try adding a new room to ensure room types appear in the dropdown

## Support

If the issue persists:

1. Check the browser console for any JavaScript errors
2. Check the Vercel function logs for API errors
3. Verify the database connection and data
4. Use the debug tools provided to identify the specific issue
