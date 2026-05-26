# 🔍 Gallery Auth Debug Guide

## Issue
Even though logged in as admin, the gallery page shows "Login as Admin to Manage" button instead of "Upload Image" button.

## Debug Steps

### Step 1: Check Browser Console

After refreshing the gallery page, check the browser console for this log:
```
Auth State: { 
  isAuthenticated: true/false, 
  user: {...}, 
  token: true/false, 
  isAdmin: true/false 
}
```

### Step 2: Check Debug Info on Page

Look at the page header subtitle. In development mode, it shows:
```
(Auth: ✓/✗, Role: ADMIN/STAFF/DONOR/none, Admin: ✓/✗)
```

### Step 3: Check localStorage

Open browser console and run:
```javascript
// Check auth storage
const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('Auth Data:', authData);
console.log('Token:', authData.state?.token);
console.log('User:', authData.state?.user);
console.log('Role:', authData.state?.user?.role);
console.log('Is Authenticated:', authData.state?.isAuthenticated);
```

### Step 4: Check Old Token Storage

Check if there's an old token in localStorage:
```javascript
// Check for old token storage
console.log('Old token:', localStorage.getItem('token'));
console.log('Old user:', localStorage.getItem('user'));
```

## Common Issues & Solutions

### Issue 1: Auth Store Not Hydrated

**Symptom:** 
- `isAuthenticated: false` even though you're logged in
- `user: null` or `undefined`

**Solution:**
The auth store might not be hydrated yet. The fix I applied adds a `useEffect` to check auth state after hydration.

### Issue 2: Wrong Storage Key

**Symptom:**
- Token exists in `localStorage.getItem('token')`
- But `auth-storage` is empty or different

**Solution:**
The app uses Zustand with persistence. The key is `auth-storage`, not `token`.

**Check:**
```javascript
// Should have data
localStorage.getItem('auth-storage')

// Might be old/unused
localStorage.getItem('token')
```

### Issue 3: Role Not Set Correctly

**Symptom:**
- `isAuthenticated: true`
- `user` exists
- But `user.role` is not 'ADMIN' or 'STAFF'

**Solution:**
Check your user role:
```javascript
const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('Your role:', authData.state?.user?.role);
```

If role is 'DONOR', you need to login with an admin account.

### Issue 4: Multiple Auth Systems

**Symptom:**
- Both `token` and `auth-storage` exist in localStorage
- They have different values

**Solution:**
Clear all auth data and login again:
```javascript
// Clear all auth data
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('auth-storage');
localStorage.removeItem('isAdmin');

// Then refresh and login again
location.reload();
```

## Quick Fix

If you're definitely logged in as admin but still seeing the issue:

### Option 1: Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Option 2: Clear Cache and Reload
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Clear Auth and Re-login
```javascript
// In browser console
localStorage.clear();
location.href = '/auth/admin';
```

## Expected Values

When logged in as admin, you should see:

```javascript
{
  state: {
    user: {
      id: "...",
      name: "Admin User",
      email: "admin@example.com",
      phone: "...",
      role: "ADMIN",  // or "STAFF"
      isVerified: true
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    isAuthenticated: true,
    isLoading: false
  },
  version: 0
}
```

## Test Script

Run this in browser console to test everything:

```javascript
// Complete auth check
(function() {
  console.log('=== AUTH DEBUG ===');
  
  // Check auth-storage
  const authStorage = localStorage.getItem('auth-storage');
  console.log('1. auth-storage exists:', !!authStorage);
  
  if (authStorage) {
    const authData = JSON.parse(authStorage);
    console.log('2. Auth Data:', authData);
    console.log('3. Is Authenticated:', authData.state?.isAuthenticated);
    console.log('4. User:', authData.state?.user);
    console.log('5. Role:', authData.state?.user?.role);
    console.log('6. Token exists:', !!authData.state?.token);
    
    const isAdmin = authData.state?.user?.role === 'ADMIN' || 
                    authData.state?.user?.role === 'STAFF';
    console.log('7. Is Admin:', isAdmin);
    
    if (!isAdmin) {
      console.warn('⚠️ You are not logged in as ADMIN or STAFF');
      console.log('Your role:', authData.state?.user?.role);
    } else {
      console.log('✅ You are logged in as admin');
    }
  } else {
    console.warn('⚠️ No auth-storage found - you are not logged in');
  }
  
  // Check old storage
  const oldToken = localStorage.getItem('token');
  const oldUser = localStorage.getItem('user');
  if (oldToken || oldUser) {
    console.warn('⚠️ Old auth data found (might cause conflicts):');
    console.log('Old token:', !!oldToken);
    console.log('Old user:', !!oldUser);
  }
  
  console.log('=== END DEBUG ===');
})();
```

## After Running Debug

Share the console output with me, and I can help identify the exact issue.

The output should tell us:
1. Is the auth store populated?
2. Is the user authenticated?
3. What is the user's role?
4. Is there conflicting auth data?

---

**Created:** May 26, 2026
**Purpose:** Debug auth issues in gallery page
