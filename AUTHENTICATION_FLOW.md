# Authentication Flow Documentation

## Overview
The application has a robust authentication system that protects admin routes and provides different experiences for different user roles.

## How Authentication Works

### 1. **Dashboard Protection** ✅
The `/dashboard` route is **already protected** by the `AdminProtected` component.

**What happens when you visit `/dashboard`:**
1. The `AdminProtected` component checks if you're authenticated
2. If NOT authenticated → Redirects to `/auth/admin` (login page)
3. If authenticated but NOT admin → Redirects to `/home` (donor page) or `/auth/admin`
4. If authenticated AND admin → Shows the dashboard

**Location:** `frontend/app/(admin)/dashboard/layout.tsx`

```typescript
<AdminProtected>
  {/* Dashboard content only shown to authenticated admins */}
</AdminProtected>
```

### 2. **Home Page Behavior**
The home page (`localhost:3000` or `/`) is a **public page** that anyone can access.

**Navigation Bar Behavior:**
- **Not logged in:** Shows "Login" and "Become Donor" buttons
- **Logged in as Admin:** Shows user dropdown with "Admin Dashboard" option
- **Logged in as Donor:** Shows user dropdown with "Donor Home" option

This is intentional - admins can navigate to their dashboard from any public page.

### 3. **User Roles**

#### Admin/Staff
- Can access `/dashboard` and all admin features
- Can manage blood stock, donors, events, gallery, etc.
- Login via `/auth/admin` with admin credentials

#### Donor
- Can access `/home` (donor dashboard)
- Can view their donation history, certificates, etc.
- Login via `/login` with donor credentials

#### Public (Not logged in)
- Can view public pages: home, events, images, about
- Cannot access `/dashboard` or `/home`
- Must login to access protected features

## Login Flows

### Admin Login
1. Visit `/auth/admin`
2. Enter admin credentials:
   - Email: `mukunday@gmail.com`
   - Password: `muku`
3. On success:
   - Token stored in localStorage
   - User data stored in Zustand store
   - Redirected to `/dashboard`

### Donor Login
1. Visit `/login`
2. Enter donor email and password
3. On success:
   - Token stored in localStorage
   - User data stored in Zustand store
   - Redirected to `/home`

## Security Features

### 1. **Route Protection**
- `AdminProtected` component wraps all admin routes
- Checks authentication status before rendering
- Redirects unauthorized users automatically

### 2. **Token Validation**
- JWT tokens are validated on every protected API request
- Backend middleware (`protect`) verifies token and user existence
- Expired or invalid tokens result in 401 errors

### 3. **Role-Based Access**
- `authorize` middleware checks user role
- Admin routes require `ADMIN` or `STAFF` role
- Donor routes require `DONOR` role

### 4. **Client-Side Checks**
- `useAuth` hook provides authentication state
- `isAdmin()` function checks admin privileges
- Components can conditionally render based on auth state

## Common Scenarios

### Scenario 1: Visiting Dashboard Without Login
```
User visits: /dashboard
↓
AdminProtected checks: Not authenticated
↓
Redirects to: /auth/admin
↓
User logs in
↓
Redirects to: /dashboard
```

### Scenario 2: Admin Visiting Home Page
```
Admin visits: / (home page)
↓
Public page loads normally
↓
Navigation shows: User dropdown with "Admin Dashboard" option
↓
Admin can click to go to /dashboard
```

### Scenario 3: Donor Trying to Access Dashboard
```
Donor visits: /dashboard
↓
AdminProtected checks: Authenticated but not admin
↓
Redirects to: /home (donor dashboard)
```

## Testing Authentication

### Test 1: Dashboard Protection
1. Clear browser storage (F12 → Application → Clear All)
2. Visit `http://localhost:3000/dashboard`
3. **Expected:** Redirected to `/auth/admin`

### Test 2: Admin Login
1. Go to `/auth/admin`
2. Login with admin credentials
3. **Expected:** Redirected to `/dashboard`
4. **Expected:** Can upload images, manage donors, etc.

### Test 3: Logout and Re-access
1. While logged in, click user dropdown → Logout
2. Try to visit `/dashboard`
3. **Expected:** Redirected to `/auth/admin`

### Test 4: Token Persistence
1. Login as admin
2. Close browser tab
3. Open new tab and visit `/dashboard`
4. **Expected:** Still logged in (token persisted in localStorage)

## Troubleshooting

### Issue: "Already logged in as administrator" on home page
**This is normal behavior!** The home page is public, but the navigation shows your login status. This allows admins to quickly access their dashboard from any page.

### Issue: Dashboard not redirecting to login
**Check:**
1. Is `AdminProtected` component wrapping the dashboard layout?
2. Are there any console errors?
3. Is the auth store hydrated? (Check `_hasHydrated` state)

### Issue: 401 errors after login
**Check:**
1. Is the backend server running?
2. Is the token being sent in requests? (Check browser console logs)
3. Does the admin user exist in the database?

## Files Involved

### Frontend
- `app/(admin)/dashboard/layout.tsx` - Dashboard layout with AdminProtected
- `components/AdminProtected.tsx` - Route protection component
- `components/PublicNav.tsx` - Navigation with auth state
- `lib/store/authStore.ts` - Authentication state management
- `lib/axiosInstance.ts` - HTTP client with token injection
- `hooks/useAuth.ts` - Authentication hook

### Backend
- `src/middleware/authMiddleware.ts` - JWT verification
- `src/controllers/authController.ts` - Login/register logic
- `src/routes/galleryRoutes.ts` - Protected routes example

## Summary

✅ **Dashboard is protected** - requires admin login
✅ **Home page is public** - anyone can access
✅ **Navigation shows login status** - this is intentional
✅ **Tokens are validated** - on every protected request
✅ **Roles are enforced** - admins and donors have different access

The authentication system is working as designed. Admins can access the dashboard, donors can access their home, and public users see the public pages with options to login or register.
