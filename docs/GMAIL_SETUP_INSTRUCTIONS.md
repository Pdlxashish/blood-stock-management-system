# 📧 Gmail Setup for Email OTP - Quick Guide

## ⚠️ IMPORTANT: You Need a Gmail App Password!

**DO NOT use your regular Gmail password!** You need to generate an "App Password" from Google.

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

1. Go to: **https://myaccount.google.com/security**
2. Scroll down to "How you sign in to Google"
3. Click on **"2-Step Verification"**
4. Follow the prompts to enable it (you'll need your phone)

### Step 2: Generate App Password

1. Go to: **https://myaccount.google.com/apppasswords**
   - Or search "App Passwords" in Google Account settings

2. You might need to sign in again

3. Under "Select app", choose **"Mail"**

4. Under "Select device", choose **"Other (Custom name)"**

5. Type: **"Blood Donation System"**

6. Click **"Generate"**

7. **COPY THE 16-CHARACTER PASSWORD** (looks like: `abcd efgh ijkl mnop`)
   - Remove spaces when copying: `abcdefghijklmnop`

### Step 3: Update Backend `.env` File

Open: `backend/.env`

Add these lines (replace with your actual values):

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
FRONTEND_URL=http://localhost:3000
```

**Example:**
```env
EMAIL_USER=blooddonation@gmail.com
EMAIL_PASSWORD=xyzw1234abcd5678
FRONTEND_URL=http://localhost:3000
```

### Step 4: Restart Backend Server

```bash
cd backend

# Stop the server (Ctrl+C)

# Start again
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running: http://localhost:5000
```

## Test Email Sending

### Quick Test

1. **Register a new user:**
   - Go to: http://localhost:3000/become-donor
   - Fill in the form with YOUR real email
   - Click "Register"

2. **Check your email:**
   - Open your Gmail inbox
   - Look for "Email Verification - OTP Code"
   - If not in inbox, check **Spam folder**

3. **Verify OTP:**
   - Copy the 6-digit code from email
   - Enter it on the verification page
   - Click "Verify Email"

4. **Success!**
   - You should see "Email Verified!" message
   - Auto-redirect to login page

## Troubleshooting

### ❌ Problem: "Failed to send OTP email"

**Solution:**
1. Check EMAIL_USER is correct
2. Check EMAIL_PASSWORD is the App Password (16 chars)
3. Make sure 2FA is enabled
4. Restart backend server

### ❌ Problem: "Invalid credentials" in backend logs

**Solution:**
1. Regenerate App Password
2. Copy new password (remove spaces)
3. Update `.env` file
4. Restart backend

### ❌ Problem: Email not received

**Solution:**
1. Check spam folder
2. Wait 1-2 minutes (sometimes delayed)
3. Check backend console for errors
4. Try resending OTP

### ❌ Problem: "Less secure app access"

**Solution:**
- This is old! Google removed this option
- You MUST use App Password now
- Follow Step 1 & 2 above

## Security Notes

✅ **Safe:**
- App Password is specific to this app
- Can be revoked anytime
- Doesn't give access to your full Gmail account

✅ **Best Practices:**
- Don't share your App Password
- Don't commit `.env` to Git (already in `.gitignore`)
- Regenerate if compromised

## Alternative: Use Different Email Provider

If you don't want to use Gmail, you can modify `backend/src/utils/emailService.ts`:

### Example: Outlook/Hotmail
```typescript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Example: Custom SMTP
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Quick Reference

### Gmail App Password URL
```
https://myaccount.google.com/apppasswords
```

### Backend .env Location
```
backend/.env
```

### Email Service File
```
backend/src/utils/emailService.ts
```

## Success Checklist

- [ ] 2FA enabled on Gmail
- [ ] App Password generated
- [ ] `.env` file updated with EMAIL_USER
- [ ] `.env` file updated with EMAIL_PASSWORD
- [ ] Backend server restarted
- [ ] Test email sent successfully
- [ ] OTP received in inbox
- [ ] OTP verification works

## Need Help?

1. Check backend console for error messages
2. Verify Gmail settings are correct
3. Try regenerating App Password
4. Test with your own email first
5. Check spam folder

## 🎉 You're Done!

Once you see the OTP email in your inbox, the setup is complete!

Users can now:
1. Register with their email
2. Receive OTP code
3. Verify their email
4. Login to the system

**Email OTP verification is now active!** 📧✅
