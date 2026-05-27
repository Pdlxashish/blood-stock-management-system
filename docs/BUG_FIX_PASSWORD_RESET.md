# Bug Fix: Password Reset OTP Loop

## Issue Description
After resetting password, users were being asked for OTP verification again when trying to login, creating an infinite loop.

## Root Cause
The password reset process was not marking the email as verified (`emailVerified = true`). The login flow checks for email verification for DONOR role users, causing them to be redirected to OTP verification even after successfully resetting their password.

## Solution
Updated the `resetPassword` function in `passwordResetController.ts` to set `emailVerified: true` when the password is successfully reset.

### Code Change

**File:** `backend/src/controllers/passwordResetController.ts`

**Before:**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashedPassword,
    otp: null,
    otpExpiry: null,
  },
});
```

**After:**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashedPassword,
    otp: null,
    otpExpiry: null,
    emailVerified: true, // Mark email as verified since they proved ownership via OTP
  },
});
```

## Reasoning
When a user successfully resets their password using the OTP sent to their email, they have proven ownership of that email address. Therefore, it's safe and logical to mark their email as verified at this point.

## Testing
1. Request password reset for a user
2. Enter OTP and new password
3. Successfully reset password
4. Try to login with new password
5. **Expected:** User should be able to login directly without OTP verification
6. **Result:** ✅ Bug fixed - user can login successfully

## Impact
- **Before:** Users stuck in OTP verification loop after password reset
- **After:** Users can login immediately after password reset

## Status
✅ **FIXED** - Password reset now properly marks email as verified

---

**Date:** May 27, 2026
**Fixed By:** Kiro AI Assistant
**Severity:** High (blocking user login)
**Priority:** Critical
