# 🚀 Quick Start: OTP Testing with Console Logging

## ⚡ TL;DR

**The OTP code now appears in your backend console!** You don't need to wait for emails anymore.

## 🎯 3-Step Testing

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Register a User
Go to http://localhost:3000/become-donor and register, OR use this API call:
```bash
POST http://localhost:3001/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "phone": "9876543210"
}
```

### Step 3: Get OTP from Console
Look at your backend console. You'll see:
```
🔐 [REGISTER] Generated OTP for test@example.com : 456789
📧 [REGISTER] OTP Code: 456789
```

**Copy that 6-digit code and use it to verify!**

## 📋 What to Look For

### In Console (Backend Terminal)
```
🎲 [EMAIL SERVICE] Generated OTP: 456789
🔐 [REGISTER] Generated OTP for test@example.com : 456789
⏰ [REGISTER] OTP expires at: 5/26/2026, 10:45:00 PM
📧 [REGISTER] OTP Code: 456789
✅ OTP email sent to test@example.com
```

### Search for These Patterns
- `OTP Code:`
- `Generated OTP for`
- Look for 6-digit numbers

## ✅ Benefits

1. **No Email Wait** - See OTP instantly
2. **Works Offline** - Test without email service
3. **Faster Testing** - Copy from console immediately
4. **Debug Friendly** - See if email sending fails

## 🎉 That's It!

Now you can test the OTP system without waiting for emails. The OTP will be printed in your backend console every time!

## 📚 More Details

- **Full Guide**: See `OTP_CONSOLE_LOGGING_GUIDE.md`
- **Summary**: See `OTP_DEBUGGING_SUMMARY.md`
- **Complete Tests**: See `TEST_EMAIL_OTP_SYSTEM.md`

## 💡 Pro Tip

Keep your backend terminal visible while testing. Use Ctrl+F to search for "OTP Code:" to quickly find the code!
