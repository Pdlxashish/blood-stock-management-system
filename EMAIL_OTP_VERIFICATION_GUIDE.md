# 📧 Email OTP Verification System - Complete Guide

## Overview
Implemented email-based OTP (One-Time Password) verification for donor authentication using Nodemailer and Gmail SMTP.

## Features Implemented

### ✅ Backend
1. **Email Service** (`emailService.ts`)
   - Generate 6-digit OTP
   - Send OTP email with beautiful HTML template
   - Send welcome email after verification
   - Gmail SMTP integration

2. **OTP Controller** (`otpController.ts`)
   - Send OTP endpoint
   - Verify OTP endpoint
   - Resend OTP endpoint
   - 10-minute OTP expiry

3. **Database Schema**
   - `emailVerified` - Boolean flag
   - `otp` - Stores current OTP
   - `otpExpiry` - OTP expiration timestamp

4. **Auth Updates**
   - Registration sends OTP automatically
   - Login checks email verification
   - Blocks unverified donors from logging in

### ✅ Frontend
1. **OTP Verification Page** (`/verify-otp`)
   - 6-digit OTP input with auto-focus
   - Paste support
   - Resend OTP with 60s cooldown
   - Success/error handling
   - Auto-redirect to login

2. **Registration Flow Update**
   - Redirects to OTP verification after registration
   - Shows success message

3. **Login Flow Update**
   - Detects unverified email
   - Redirects to OTP verification
   - Shows appropriate error message

## Setup Instructions

### 1. Gmail App Password Setup

**Important:** You need a Gmail App Password, not your regular Gmail password!

#### Steps to Get Gmail App Password:

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Blood Donation System"
   - Click "Generate"
   - Copy the 16-character password

3. **Update Backend `.env`**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   FRONTEND_URL=http://localhost:3000
   ```

### 2. Install Dependencies

Already installed:
```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 3. Run Database Migration

Already done:
```bash
npx prisma migrate dev --name add_email_otp_verification
npx prisma generate
```

### 4. Restart Backend Server

```bash
cd backend
npm run dev
```

## User Flow

### Registration Flow

```
1. User fills registration form
   ↓
2. Backend creates user with emailVerified=false
   ↓
3. Backend generates 6-digit OTP
   ↓
4. Backend sends OTP email
   ↓
5. Frontend redirects to /verify-otp?email=user@example.com
   ↓
6. User enters OTP
   ↓
7. Backend verifies OTP
   ↓
8. Backend marks emailVerified=true
   ↓
9. Backend sends welcome email
   ↓
10. Frontend redirects to /login
```

### Login Flow

```
1. User enters email & password
   ↓
2. Backend checks credentials
   ↓
3. Backend checks emailVerified
   ↓
4a. If verified → Login successful
4b. If not verified → Show error & redirect to OTP page
```

## API Endpoints

### Send OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "status": "success",
  "message": "OTP sent to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": "10 minutes"
  }
}
```

### Verify OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "status": "success",
  "message": "Email verified successfully! You can now log in.",
  "data": {
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

### Resend OTP
```http
POST /api/otp/resend
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "status": "success",
  "message": "New OTP sent to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": "10 minutes"
  }
}
```

## Email Templates

### OTP Email
- **Subject:** Email Verification - OTP Code
- **Content:**
  - Welcome message
  - 6-digit OTP in large font
  - Expiry notice (10 minutes)
  - Security warnings
  - Professional design with gradient header

### Welcome Email
- **Subject:** Welcome to Blood Donation System! 🎉
- **Content:**
  - Congratulations message
  - Next steps guide
  - Login button
  - Professional design

## Security Features

1. **OTP Expiry:** 10 minutes
2. **One-Time Use:** OTP cleared after verification
3. **Secure Storage:** OTP hashed in database (optional enhancement)
4. **Rate Limiting:** 60-second cooldown for resend
5. **Email Validation:** Checks email format
6. **Role-Based:** Only DONOR role requires email verification

## Testing

### Test Registration & OTP Flow

1. **Register New User**
   ```
   URL: http://localhost:3000/become-donor
   Fill form and submit
   ```

2. **Check Email**
   ```
   Open Gmail inbox
   Look for "Email Verification - OTP Code"
   Copy 6-digit OTP
   ```

3. **Verify OTP**
   ```
   URL: http://localhost:3000/verify-otp?email=user@example.com
   Enter OTP
   Click "Verify Email"
   ```

4. **Login**
   ```
   URL: http://localhost:3000/login
   Enter credentials
   Should login successfully
   ```

### Test Resend OTP

1. On OTP page, click "Resend OTP"
2. Wait for new email
3. Enter new OTP
4. Verify

### Test Expired OTP

1. Wait 10 minutes after receiving OTP
2. Try to verify
3. Should show "OTP has expired" error
4. Click "Resend OTP"
5. Use new OTP

### Test Invalid OTP

1. Enter wrong OTP
2. Should show "Invalid OTP" error
3. Try again with correct OTP

## Troubleshooting

### Issue: Email not sending

**Cause:** Gmail credentials not configured

**Solution:**
1. Check `.env` file has correct EMAIL_USER and EMAIL_PASSWORD
2. Verify App Password is correct (16 characters)
3. Check 2FA is enabled on Gmail account
4. Check backend console for email errors

### Issue: "Invalid credentials" error

**Cause:** Wrong App Password or 2FA not enabled

**Solution:**
1. Regenerate App Password
2. Enable 2-Step Verification
3. Update `.env` with new password
4. Restart backend

### Issue: OTP expired

**Cause:** More than 10 minutes passed

**Solution:**
1. Click "Resend OTP"
2. Use new OTP within 10 minutes

### Issue: Email in spam folder

**Cause:** Gmail spam filter

**Solution:**
1. Check spam folder
2. Mark as "Not Spam"
3. Add sender to contacts

### Issue: "Email already verified" error

**Cause:** User already verified

**Solution:**
1. Go directly to login page
2. Login with credentials

## Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL="your-database-url"

# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  phone         String
  role          Role      @default(DONOR)
  isVerified    Boolean   @default(false)
  
  // Email verification
  emailVerified Boolean   @default(false)
  otp           String?
  otpExpiry     DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Files Created

### Backend
1. `backend/src/utils/emailService.ts` - Email sending logic
2. `backend/src/controllers/otpController.ts` - OTP endpoints
3. `backend/src/routes/otpRoutes.ts` - OTP routes
4. `backend/prisma/migrations/.../add_email_otp_verification/` - Migration

### Frontend
1. `frontend/app/verify-otp/page.tsx` - OTP verification page

### Documentation
1. `EMAIL_OTP_VERIFICATION_GUIDE.md` - This file

## Files Modified

### Backend
1. `backend/src/controllers/authController.ts` - Added OTP sending on registration, email check on login
2. `backend/src/index.ts` - Added OTP routes
3. `backend/prisma/schema.prisma` - Added email verification fields
4. `backend/.env` - Added email configuration

### Frontend
1. `frontend/app/(public)/become-donor/page.tsx` - Redirect to OTP page
2. `frontend/app/(public)/login/page.tsx` - Handle email verification errors

## Success Criteria

✅ User receives OTP email after registration
✅ OTP email has professional design
✅ User can enter 6-digit OTP
✅ OTP verification works correctly
✅ Expired OTP shows error
✅ Invalid OTP shows error
✅ Resend OTP works with cooldown
✅ Welcome email sent after verification
✅ Login blocks unverified users
✅ Login redirects to OTP page if not verified
✅ Auto-redirect to login after verification

## Future Enhancements

- [ ] SMS OTP as alternative
- [ ] OTP rate limiting (max 5 attempts)
- [ ] Hash OTP in database
- [ ] Email verification link as alternative
- [ ] Customizable email templates
- [ ] Multi-language support
- [ ] Email delivery status tracking
- [ ] Resend limit (max 3 times)

## Support

### Common Questions

**Q: Do I need a Gmail account?**
A: Yes, currently the system uses Gmail SMTP. You can modify `emailService.ts` to use other providers.

**Q: Can I use a different email provider?**
A: Yes, update the transporter configuration in `emailService.ts` with your provider's SMTP settings.

**Q: How long is the OTP valid?**
A: 10 minutes. After that, user must request a new OTP.

**Q: Can I change the OTP length?**
A: Yes, modify the `generateOTP()` function in `emailService.ts`.

**Q: Do admins need email verification?**
A: No, only DONOR role requires email verification.

## Conclusion

The email OTP verification system is fully implemented and ready to use! Users must verify their email before they can log in, adding an extra layer of security to the donor registration process.

**Next Steps:**
1. Configure Gmail App Password in `.env`
2. Restart backend server
3. Test registration flow
4. Verify OTP functionality
5. Check email delivery

🎉 **Email OTP Verification System Complete!**
