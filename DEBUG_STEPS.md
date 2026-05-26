# Debug Steps for Gallery Upload 401 Error

## Step 1: Restart Backend Server

**IMPORTANT:** You MUST restart the backend for the changes to take effect!

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it:
cd backend
npm run dev
```

Look for this message:
```
Server running on port 3001
```

## Step 2: Clear Browser Storage and Re-login

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Local Storage**, select your site
4. Click **Clear All** or delete these keys:
   - `token`
   - `auth-storage`
   - `user`
   - `isAdmin`

5. **Refresh the page**

6. **Log in again** as admin:
   - Email: `mukunday@gmail.com`
   - Password: `muku`

## Step 3: Check Console Logs

After logging in, open the browser console (F12 → Console tab).

You should see logs like:
```
[axiosInstance] Request to: /api/auth/admin-login
[axiosInstance] Token found: NO TOKEN
...
```

After successful login, you should see:
```
Auth State (after hydration): { isAuthenticated: true, user: {...}, token: true, isAdmin: true }
```

## Step 4: Try Uploading an Image

1. Go to Gallery Management page
2. Click "Upload Image"
3. Select an image file
4. Fill in title and description
5. Click "Upload"

## Step 5: Check Console Logs During Upload

In the browser console, you should see:
```
[axiosInstance] Request to: /api/gallery
[axiosInstance] Token found: eyJhbGciOiJIUzI1NiIsInR...
[axiosInstance] Direct token: EXISTS
[axiosInstance] Auth storage: EXISTS
[axiosInstance] Authorization header set
```

In the backend terminal, you should see:
```
[protect] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
[protect] Token decoded, user ID: <some-uuid>
[protect] ✅ User authenticated: mukunday@gmail.com Role: ADMIN
```

## What to Look For

### If you see "NO TOKEN" in browser console:
- The login didn't save the token properly
- Clear storage and log in again
- Check if the login response contains a token

### If you see "User not found in database" in backend:
- The admin user wasn't created in the database
- Check backend logs during login
- The first login should create the admin user

### If you see "Invalid token" in backend:
- The JWT_SECRET might be different between login and verification
- Check `backend/.env` has `JWT_SECRET=xyz456`
- Restart backend server

## Step 6: Share the Logs

If it still doesn't work, copy and paste:

1. **Browser console logs** (everything with `[axiosInstance]`)
2. **Backend terminal logs** (everything with `[protect]` or `ADMIN LOGIN`)
3. **The error message** you see

This will help identify exactly where the problem is!

## Quick Checklist

- [ ] Backend server restarted
- [ ] Browser storage cleared
- [ ] Logged in again as admin
- [ ] Can see token in browser console logs
- [ ] Can see authentication success in backend logs
- [ ] Still getting 401 error? Share the logs above
