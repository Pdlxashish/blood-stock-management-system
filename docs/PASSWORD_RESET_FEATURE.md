# Password Reset Feature Documentation

## Overview
A complete "Forgot Password" feature has been added to the login page, allowing users to reset their password via email verification.

---

## Features

### ✅ What's Included

1. **Forgot Password Link** on login page
2. **Email-based Password Reset** with OTP verification
3. **Two-step Process:**
   - Step 1: Enter email → Receive OTP
   - Step 2: Enter OTP + New Password → Reset complete
4. **Email Notifications:**
   - Reset code email
   - Confirmation email after successful reset
5. **Security Features:**
   - OTP expires after 10 minutes
   - Password must be at least 6 characters
   - Password confirmation validation
   - Secure password hashing with bcrypt

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. USER FORGETS PASSWORD
   │
   ├─► Navigate to /login
   │
   └─► Click "Forgot password?" link
       │
       ▼
2. REQUEST RESET CODE
   │
   ├─► Navigate to /forgot-password
   │
   ├─► Enter email address
   │
   └─► Click "Send Reset Code"
       │
       ▼
3. BACKEND PROCESSING
   │
   ├─► Validate email exists
   │
   ├─► Generate 6-digit OTP
   │
   ├─► Save OTP to database (expires in 10 min)
   │
   └─► Send email with OTP
       │
       ▼
4. USER RECEIVES EMAIL
   │
   ├─► Check inbox for reset code
   │
   └─► Copy 6-digit code
       │
       ▼
5. RESET PASSWORD
   │
   ├─► Enter OTP code
   │
   ├─► Enter new password
   │
   ├─► Confirm new password
   │
   └─► Click "Reset Password"
       │
       ▼
6. BACKEND VALIDATION
   │
   ├─► Verify OTP is correct
   │
   ├─► Check OTP not expired
   │
   ├─► Validate password strength
   │
   ├─► Hash new password
   │
   ├─► Update database
   │
   └─► Send confirmation email
       │
       ▼
7. SUCCESS
   │
   ├─► Show success message
   │
   ├─► Redirect to login page
   │
   └─► User can now login with new password
```

---

## API Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/password-reset/request`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "If an account with that email exists, a password reset code has been sent.",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Email is required"
}
```

---

### 2. Reset Password

**Endpoint:** `POST /api/password-reset/reset`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Response (Error - Invalid OTP):**
```json
{
  "status": "error",
  "message": "Invalid or expired reset code"
}
```

**Response (Error - Expired OTP):**
```json
{
  "status": "error",
  "message": "Reset code has expired. Please request a new one."
}
```

**Response (Error - Weak Password):**
```json
{
  "status": "error",
  "message": "Password must be at least 6 characters long"
}
```

---

## Frontend Pages

### 1. Login Page (`/login`)
- Added "Forgot password?" link next to password field
- Link navigates to `/forgot-password`

### 2. Forgot Password Page (`/forgot-password`)
- **Step 1: Email Input**
  - Email field
  - "Send Reset Code" button
  - Back to login link

- **Step 2: Reset Form**
  - OTP code input (6 digits)
  - New password input
  - Confirm password input
  - "Reset Password" button
  - "Back to Email" button

---

## Email Templates

### 1. Password Reset Code Email

**Subject:** Password Reset Code - Blood Donation System

**Content:**
- Greeting with user's name
- 6-digit OTP code in large, highlighted box
- Expiry time (10 minutes)
- Security warnings
- Instructions

**Example:**
```
Hello John Doe!

We received a request to reset your password. Use the code below:

┌─────────────┐
│   123456    │
│ Valid for   │
│ 10 minutes  │
└─────────────┘

⚠️ Security Notice:
- Never share this code
- Code expires in 10 minutes
- If you didn't request this, ignore this email
```

---

### 2. Password Reset Confirmation Email

**Subject:** Password Reset Successful - Blood Donation System

**Content:**
- Confirmation message
- Login button/link
- Security tip
- Contact information

**Example:**
```
Hello John Doe!

Your password has been successfully reset.

You can now log in with your new password.

[Login Now]

⚠️ Security Tip: If you didn't make this change, contact support immediately.
```

---

## Security Features

### 1. OTP Security
- **6-digit random code** (100000-999999)
- **10-minute expiry** - code becomes invalid after 10 minutes
- **One-time use** - OTP is cleared after successful reset
- **Stored securely** in database with expiry timestamp

### 2. Password Security
- **Minimum length:** 6 characters
- **Hashed with bcrypt** (10 salt rounds)
- **Never stored in plain text**
- **Confirmation required** to prevent typos

### 3. Email Privacy
- **Generic success message** - doesn't reveal if email exists
- **Rate limiting** (can be added) - prevent brute force
- **No user enumeration** - same message for existing/non-existing emails

### 4. Database Security
- OTP stored in User table
- OTP cleared after use
- Expiry timestamp checked before reset
- Password hashed before storage

---

## Testing Guide

### Test Scenario 1: Successful Password Reset

1. **Navigate to Login**
   ```
   http://localhost:3000/login
   ```

2. **Click "Forgot password?"**
   - Should navigate to `/forgot-password`

3. **Enter Email**
   ```
   ashishgautam112@gmail.com
   ```
   - Click "Send Reset Code"
   - Should see success message
   - Check email inbox

4. **Check Email**
   - Open email with subject "Password Reset Code"
   - Copy 6-digit code

5. **Enter Reset Code**
   - Paste OTP code
   - Enter new password: `newPassword123`
   - Confirm password: `newPassword123`
   - Click "Reset Password"

6. **Verify Success**
   - Should see success message
   - Should redirect to login page
   - Try logging in with new password

---

### Test Scenario 2: Invalid OTP

1. Follow steps 1-3 from Scenario 1
2. Enter wrong OTP: `000000`
3. Enter new password
4. Click "Reset Password"
5. **Expected:** Error message "Invalid or expired reset code"

---

### Test Scenario 3: Expired OTP

1. Follow steps 1-4 from Scenario 1
2. Wait 11 minutes (or manually update database)
3. Enter OTP and new password
4. Click "Reset Password"
5. **Expected:** Error message "Reset code has expired"

---

### Test Scenario 4: Password Mismatch

1. Follow steps 1-4 from Scenario 1
2. Enter new password: `password123`
3. Enter confirm password: `different456`
4. Click "Reset Password"
5. **Expected:** Error message "Passwords do not match"

---

### Test Scenario 5: Weak Password

1. Follow steps 1-4 from Scenario 1
2. Enter new password: `123` (less than 6 characters)
3. Click "Reset Password"
4. **Expected:** Error message "Password must be at least 6 characters long"

---

## Database Schema

### User Table Updates
No schema changes required! Uses existing fields:

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String
  name       String
  
  // Email verification (already exists)
  otp        String?
  otpExpiry  DateTime?
  
  // ... other fields
}
```

**Fields Used:**
- `otp` - Stores the 6-digit reset code
- `otpExpiry` - Stores when the OTP expires
- `password` - Updated with new hashed password

---

## Code Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── passwordResetController.ts (NEW)
│   │       ├── requestPasswordReset()
│   │       └── resetPassword()
│   ├── routes/
│   │   └── passwordResetRoutes.ts (NEW)
│   └── index.ts (UPDATED)

frontend/
├── app/
│   └── (public)/
│       ├── login/
│       │   └── page.tsx (UPDATED - added forgot password link)
│       └── forgot-password/
│           └── page.tsx (NEW - password reset page)
```

---

## Environment Variables

No new environment variables required! Uses existing:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

---

## Error Handling

### Frontend Errors
- Network errors
- Invalid form input
- API errors
- Validation errors

### Backend Errors
- Missing required fields
- User not found
- Invalid OTP
- Expired OTP
- Weak password
- Database errors
- Email sending errors

---

## Future Enhancements

### Potential Improvements
- [ ] Rate limiting (prevent spam)
- [ ] CAPTCHA integration
- [ ] SMS-based OTP option
- [ ] Password strength meter
- [ ] Remember last reset time
- [ ] Account lockout after multiple failed attempts
- [ ] Two-factor authentication
- [ ] Password history (prevent reuse)
- [ ] Custom password requirements
- [ ] Social login integration

---

## Troubleshooting

### Issue: Email Not Received

**Possible Causes:**
1. Email in spam folder
2. Invalid EMAIL_USER or EMAIL_PASSWORD
3. Gmail security settings
4. Email service down

**Solutions:**
1. Check spam/junk folder
2. Verify .env configuration
3. Enable "Less secure app access" or use App Password
4. Check backend logs for email errors

---

### Issue: OTP Expired

**Cause:** More than 10 minutes passed since request

**Solution:**
1. Click "Back to Email"
2. Request new reset code
3. Use code within 10 minutes

---

### Issue: Password Reset Not Working

**Possible Causes:**
1. Wrong OTP
2. Expired OTP
3. Database connection issue
4. Backend not running

**Solutions:**
1. Double-check OTP from email
2. Request new code if expired
3. Check database connection
4. Ensure backend is running on port 3001

---

## Summary

✅ **Complete password reset feature implemented**
✅ **Email-based OTP verification**
✅ **Secure password hashing**
✅ **User-friendly interface**
✅ **Comprehensive error handling**
✅ **Email notifications**

**Status: READY FOR TESTING** 🚀

---

## Quick Test Command

For testing purposes, you can manually check the OTP in the database:

```sql
SELECT email, otp, "otpExpiry" 
FROM "User" 
WHERE email = 'ashishgautam112@gmail.com';
```

This will show you the current OTP and expiry time for testing.
