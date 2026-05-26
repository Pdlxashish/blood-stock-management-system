# Gallery Authentication Fix

## Problem
The gallery upload feature was failing with a 401 Unauthorized error even after admin login.

## Root Causes

### 1. Token Storage Mismatch
There were **two separate token storage mechanisms** that were not properly synchronized:

1. **Zustand Store** (`useAuthStore`) - Stores token in `localStorage` under key `"auth-storage"` as a JSON object
2. **Direct localStorage** - `axiosInstance` was reading token from `localStorage.getItem("token")`

### 2. **CRITICAL: Admin Token Not Linked to Database User**
The `adminLogin` function was generating tokens with a dynamic ID:
```typescript
const adminToken = generateToken('admin-' + Date.now());
```

This created a token with an ID like `'admin-1716234567890'` that **doesn't exist in the database**. When the `protect` middleware tried to verify the token, it would:
1. Decode the token successfully
2. Try to find a user with that ID in the database
3. Fail because no user exists with ID `'admin-1716234567890'`
4. Return 401 Unauthorized

## Solutions

### 1. Updated `axiosInstance.ts`
Modified the token retrieval logic to check both storage locations:

```typescript
const getToken = (): string | null => {
  // First try direct localStorage (backward compatibility)
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }
  
  // Then try Zustand persisted store
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error parsing auth storage:", error);
  }
  
  return null;
};
```

### 2. **Fixed Admin Login to Use Real Database User**
Modified `adminLogin` in `authController.ts` to:
1. Find or create an actual admin user in the database
2. Generate token using the real user's database ID
3. Return complete user information

```typescript
// Find or create admin user in database
let adminUser = await prisma.user.findUnique({
  where: { email: ADMIN_ID },
});

if (!adminUser) {
  adminUser = await prisma.user.create({
    data: {
      email: ADMIN_ID,
      name: 'Administrator',
      phone: '0000000000',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
}

// Generate token with actual user ID from database
const adminToken = generateToken(adminUser.id);
```

This ensures:
- The token contains a valid database user ID
- The `protect` middleware can find the user when verifying the token
- Admin authentication works consistently

### 3. Fixed Accessibility Warnings
Added `aria-describedby` attributes to all Dialog components to fix accessibility warnings:

- Upload Dialog
- Edit Dialog  
- Crop Dialog
- Preview Dialog

Each dialog now has a hidden description element for screen readers.

## Testing
After these changes:
1. **Restart the backend server** (important - the admin user needs to be created)
2. Log in as admin using the credentials
3. Navigate to Gallery Management
4. Try uploading an image
5. The upload should now work without 401 errors

## Additional Notes
- The first admin login will create the admin user in the database automatically
- Subsequent logins will use the existing admin user
- The token now contains a real database user ID that can be verified
- No manual database setup required
