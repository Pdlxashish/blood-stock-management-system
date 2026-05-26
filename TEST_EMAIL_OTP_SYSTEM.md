# 🧪 Email OTP System - Complete Test Guide

## ✅ System Status Check

### Backend Configuration
- ✅ Nodemailer installed (v8.0.9)
- ✅ Email credentials configured in `.env`
  - EMAIL_USER: Poudelashish0718@gmail.com
  - EMAIL_PASSWORD: **************** (configured)
  - FRONTEND_URL: http://localhost:3000
- ✅ Database schema has email verification fields
- ✅ OTP routes registered in backend
- ✅ Email service implemented
- ✅ OTP controller implemented

### Frontend Configuration
- ✅ OTP verification page created
- ✅ Registration page redirects to OTP
- ✅ Login page checks email verification
- ✅ Auto-focus and paste support implemented
- ✅ Resend OTP with cooldown

## 🧪 Testing Checklist

### Test 1: Registration Flow
1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Expected: Server running on http://localhost:3001

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Expected: Frontend running on http://localhost:3000

3. **Register New User**
   - Go to: http://localhost:3000/become-donor
   - Fill in form:
     - Name: Test User
     - Email: YOUR_REAL_EMAIL@gmail.com
     - Phone: 9876543210
     - Password: test123
   - Click "Register"
   
   **Expected Backend Logs:**
   ```
   ✅ OTP email sent to YOUR_REAL_EMAIL@gmail.com
   ```
   
   **Expected Frontend:**
   - Alert: "Registration successful! Please check your email for OTP verification."
   - Redirect to: /verify-otp?email=YOUR_REAL_EMAIL@gmail.com

4. **Check Email**
   - Open Gmail inbox
   - Look for email from "Blood Donation System"
   - Subject: "Email Verification - OTP Code"
   - Should contain 6-digit OTP
   - Check spam folder if not in inbox

### Test 2: OTP Verification
1. **Enter OTP**
   - On /verify-otp page
   - Enter 6-digit OTP from email
   - Should auto-focus next input
   
   **Expected:**
   - Success message: "Email Verified!"
   - Welcome email sent
   - Redirect to /login after 2 seconds

2. **Check Welcome Email**
   - Should receive "Welcome to Blood Donation System! 🎉"
   - Contains login button

### Test 3: Login with Verified Email
1. **Login**
   - Go to: http://localhost:3000/login
   - Enter email and password
   
   **Expected:**
   - Login successful
   - Redirect to /donor-form (to complete profile)

### Test 4: Login with Unverified Email
1. **Register Another User** (don't verify)
2. **Try to Login**
   
   **Expected:**
   - Error: "Please verify your email first. Check your inbox for the OTP."
   - Auto-redirect to /verify-otp page after 2 seconds

### Test 5: Resend OTP
1. **On OTP Page**
   - Click "Resend OTP"
   
   **Expected:**
   - Button disabled for 60 seconds
   - Shows countdown: "Resend in 59s", "Resend in 58s", etc.
   - New OTP sent to email
   - Old OTP becomes invalid

### Test 6: Invalid OTP
1. **Enter Wrong OTP**
   - Enter: 000000
   
   **Expected:**
   - Error: "Invalid OTP. Please try again."
   - Can try again

### Test 7: Expired OTP
1. **Wait 10 Minutes**
2. **Try to Verify**
   
   **Expected:**
   - Error: "OTP has expired. Please request a new one."
   - Click "Resend OTP"

### Test 8: Paste OTP
1. **Copy OTP from Email**
2. **Paste in First Input Box**
   
   **Expected:**
   - All 6 digits filled automatically
   - Focus on last digit

### Test 9: Admin Login (No Email Verification)
1. **Login as Admin**
   - Go to: http://localhost:3000/admin-login
   - ID: mukunday@gmail.com
   - Password: muku
   
   **Expected:**
   - Login successful (no email verification required)
   - Redirect to /dashboard

## 🐛 Troubleshooting Tests

### Issue 1: Email Not Sending
**Check Backend Console:**
```
❌ Error sending OTP email: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution:**
1. Verify EMAIL_USER is correct
2. Verify EMAIL_PASSWORD is App Password (16 chars)
3. Regenerate App Password if needed
4. Restart backend server

### Issue 2: Email in Spam
**Check:**
- Gmail spam folder
- Mark as "Not Spam"
- Add sender to contacts

### Issue 3: OTP Not Saved in Database
**Test Query:**
```sql
SELECT email, otp, "otpExpiry", "emailVerified" FROM "User" WHERE email = 'test@example.com';
```

**Expected:**
- otp: 6-digit number
- otpExpiry: timestamp 10 minutes in future
- emailVerified: false

### Issue 4: Frontend Not Redirecting
**Check Browser Console:**
- Look for errors
- Check NEXT_PUBLIC_BACKEND_URL in frontend/.env.local

## 📊 Database Verification

### Check User Record
```sql
-- Check if user was created with OTP
SELECT 
  id, 
  name, 
  email, 
  "emailVerified", 
  otp, 
  "otpExpiry",
  "createdAt"
FROM "User" 
WHERE email = 'YOUR_EMAIL@gmail.com';
```

**Expected Before Verification:**
- emailVerified: false
- otp: 6-digit number
- otpExpiry: future timestamp

**Expected After Verification:**
- emailVerified: true
- otp: null
- otpExpiry: null

## 🔍 API Testing (Using Postman/Thunder Client)

### 1. Send OTP
```http
POST http://localhost:3001/api/otp/send
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "OTP sent to your email",
  "data": {
    "email": "test@example.com",
    "expiresIn": "10 minutes"
  }
}
```

### 2. Verify OTP
```http
POST http://localhost:3001/api/otp/verify
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Email verified successfully! You can now log in.",
  "data": {
    "email": "test@example.com",
    "emailVerified": true
  }
}
```

### 3. Resend OTP
```http
POST http://localhost:3001/api/otp/resend
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "New OTP sent to your email",
  "data": {
    "email": "test@example.com",
    "expiresIn": "10 minutes"
  }
}
```

## ✅ Success Criteria

- [ ] User can register and receive OTP email
- [ ] OTP email has professional design
- [ ] OTP verification works correctly
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Resend OTP works with 60s cooldown
- [ ] Welcome email sent after verification
- [ ] Login blocks unverified users
- [ ] Login redirects to OTP page if not verified
- [ ] Admin login works without email verification
- [ ] Auto-redirect to login after verification
- [ ] Paste OTP works correctly
- [ ] Auto-focus works correctly

## 🎯 Quick Test Script

Run this to test the complete flow:

1. **Register**: http://localhost:3000/become-donor
2. **Check Email**: Look for OTP
3. **Verify**: Enter OTP on verification page
4. **Login**: http://localhost:3000/login
5. **Success**: Should redirect to donor form

## 📝 Test Results Log

### Test Date: _____________

| Test | Status | Notes |
|------|--------|-------|
| Registration | ⬜ Pass / ⬜ Fail | |
| OTP Email Received | ⬜ Pass / ⬜ Fail | |
| OTP Verification | ⬜ Pass / ⬜ Fail | |
| Welcome Email | ⬜ Pass / ⬜ Fail | |
| Login Verified User | ⬜ Pass / ⬜ Fail | |
| Login Unverified User | ⬜ Pass / ⬜ Fail | |
| Resend OTP | ⬜ Pass / ⬜ Fail | |
| Invalid OTP | ⬜ Pass / ⬜ Fail | |
| Expired OTP | ⬜ Pass / ⬜ Fail | |
| Paste OTP | ⬜ Pass / ⬜ Fail | |

## 🚀 Ready to Test!

Your email OTP system is fully configured and ready for testing. Follow the test checklist above to verify everything works correctly.

**Important:** Use your real email address for testing to receive actual OTP emails!
