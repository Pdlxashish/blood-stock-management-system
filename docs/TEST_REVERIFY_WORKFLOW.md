# Test Re-verification Workflow - Complete Guide

## 🎯 Test Objective

Verify that when an admin clicks "Re-verify Donor" button for a rejected donor:
1. ✅ Donor status changes to VERIFIED
2. ✅ Email is sent to donor's Gmail
3. ✅ Email contains "Verification Successful" message
4. ✅ Email has "Login to Your Account" button
5. ✅ Login link works correctly
6. ✅ Donor can access dashboard after login

---

## 📋 Prerequisites

### **1. Backend Running**
```bash
cd backend
npm run dev

# Should see:
✅ Email service ready to send emails
   Using: Poudelashish0718@gmail.com
✅ Server running on port 3001
```

### **2. Frontend Running**
```bash
cd frontend
npm run dev

# Should see:
✓ Ready in X ms
```

### **3. Have a Rejected Donor**
You need a donor with:
- Status: `REJECTED`
- Email: Valid Gmail address
- `reverificationRequested`: `false`

---

## 🧪 Test Steps

### **Step 1: Navigate to Admin Panel**

1. Open browser: `http://localhost:3000/admin-public/pending-donors`
2. You should see the Donor Verification Management page
3. Statistics cards should be visible at the top

**Expected**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔶 Donor Verification Management          [🔍 Search]      │
│                                                              │
│ [Pending: X] [Verified: X] [Rejected: X] [All Donors: X]   │
└─────────────────────────────────────────────────────────────┘
```

---

### **Step 2: View Rejected Donors**

1. Click the **"Rejected"** statistics card (red card with X icon)
2. Page should show rejected donors
3. Active tab indicator should show: "Viewing: ✗ Rejected Donors"

**Expected**:
```
┌─────────────────────────────────────────────────────────────┐
│ Viewing: [✗ Rejected Donors]                    X donors    │
└─────────────────────────────────────────────────────────────┘
```

---

### **Step 3: Locate Rejected Donor Card**

Look for a donor card with:
- Red left border
- Red "REJECTED" badge
- Red alert box with rejection reason
- Blue "Re-verify Donor" button at the bottom

**Expected Card**:
```
┌║────────────────────────────────────────────────────────────┐
│║ John Doe                    [A+]           [REJECTED]      │
│║ ID: abc123 • Registered: May 27, 2026                      │
│║                                                             │
│║ ┌─────────────────────────────────────────────────────┐   │
│║ │ ⚠️ Rejection Reason                                 │   │
│║ │ Incomplete medical information                      │   │
│║ └─────────────────────────────────────────────────────┘   │
│║                                                             │
│║ 📧 john@example.com    📞 +1234567890                      │
│║ 📍 New York            ⚖️ Weight: 70 kg                    │
│║                                                             │
│║ [🔄 Re-verify Donor]  ← CLICK THIS                         │
└║────────────────────────────────────────────────────────────┘
```

---

### **Step 4: Click "Re-verify Donor" Button**

1. Click the blue **"Re-verify Donor"** button
2. Approval dialog should open

**Expected Dialog**:
```
┌─────────────────────────────────────────────────────────────┐
│ Approve Donor                                                │
│                                                              │
│ Are you sure you want to approve this donor? They will be   │
│ able to access the admin dashboard and donate blood.        │
│                                                              │
│ Name: John Doe                                               │
│ Email: john@example.com                                      │
│ Blood Group: A+                                              │
│                                                              │
│ [Cancel]  [✓ Approve Donor]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### **Step 5: Confirm Approval**

1. Click **"Approve Donor"** button in the dialog
2. Button should show loading state: "Approving..."
3. Wait for the operation to complete

**Expected Loading State**:
```
[⟳ Approving...]  ← Button shows spinner
```

---

### **Step 6: Verify Success**

1. Toast notification should appear: **"Donor approved successfully!"**
2. Dialog should close automatically
3. Donor card should disappear from Rejected tab
4. Statistics should update (Rejected count decreases, Verified count increases)

**Expected Toast**:
```
✅ Donor approved successfully!
```

---

### **Step 7: Check Backend Logs**

Open your backend terminal and look for these logs:

```bash
📧 [EMAIL SERVICE] Sending donor approval email
   To: john@example.com
   Name: John Doe
📤 [EMAIL SERVICE] Sending approval email via nodemailer...
✅ Approval email sent to john@example.com
📬 [EMAIL SERVICE] Message ID: <...@gmail.com>
```

**If you see these logs**: ✅ Email was sent successfully!

**If you see errors**: ❌ Check email configuration in `.env`

---

### **Step 8: Check Donor's Email Inbox**

1. Open Gmail for the donor's email address
2. Look for new email (should arrive within 1 minute)
3. Check spam folder if not in inbox

**Expected Email**:
```
From: Blood Donation System <Poudelashish0718@gmail.com>
To: john@example.com
Subject: ✅ Verification Successful - Your Donor Profile is Approved!

┌─────────────────────────────────────────────────────────────┐
│                          ✓                                   │
│              Verification Successful!                        │
│          Your Donor Profile is Approved                      │
│                                                              │
│ Hello John Doe,                                              │
│                                                              │
│ Congratulations! We're excited to inform you that your       │
│ donor profile has been successfully verified by our team.   │
│                                                              │
│ 🎉 You're Now a Verified Donor!                             │
│ You can now log in and start participating in blood         │
│ donation activities.                                         │
│                                                              │
│              [Login to Your Account]  ← CLICK THIS          │
│                                                              │
│ What You Can Do Now:                                         │
│ • Access Your Dashboard                                      │
│ • Browse Events                                              │
│ • Schedule Donations                                         │
│ • Track History                                              │
│ • Earn Certificates                                          │
│ • Save Lives                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### **Step 9: Test Login Link**

1. In the email, click the **"Login to Your Account"** button
2. Should redirect to: `http://localhost:3000/login`
3. Login page should load

**Expected URL**:
```
http://localhost:3000/login
```

---

### **Step 10: Login as Donor**

1. Enter donor's credentials:
   - Email: `john@example.com`
   - Password: `[donor's password]`
2. Click "Login" button
3. Should successfully log in

**Expected**:
```
✅ Login successful
→ Redirects to dashboard
```

---

### **Step 11: Verify Dashboard Access**

1. After login, should be on dashboard page
2. Check donor profile status
3. Should show as VERIFIED

**Expected Dashboard**:
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome, John Doe!                                           │
│                                                              │
│ Status: ✅ Verified Donor                                    │
│                                                              │
│ [View Profile] [Browse Events] [Donation History]           │
└─────────────────────────────────────────────────────────────┘
```

---

### **Step 12: Check Profile Page**

1. Navigate to: `http://localhost:3000/dashboard/profile`
2. Should see green verification alert
3. No rejection message should be visible

**Expected Profile Alert**:
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Verified Donor                                            │
│                                                              │
│ Your donor profile has been verified. You can now           │
│ participate in blood donation activities.                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Criteria

All of these should be TRUE:

- [ ] "Re-verify Donor" button visible on rejected donor card
- [ ] Button click opens approval dialog
- [ ] Approval succeeds with success toast
- [ ] Donor disappears from Rejected tab
- [ ] Backend logs show email sent
- [ ] Email received in donor's Gmail inbox
- [ ] Email subject: "✅ Verification Successful - Your Donor Profile is Approved!"
- [ ] Email has large checkmark (✓)
- [ ] Email has "Login to Your Account" button
- [ ] Login button links to: `http://localhost:3000/login`
- [ ] Login link works correctly
- [ ] Donor can log in successfully
- [ ] Dashboard is accessible
- [ ] Profile shows VERIFIED status
- [ ] No rejection message visible

---

## 🐛 Troubleshooting

### **Issue 1: "Re-verify Donor" Button Not Visible**

**Possible Causes**:
- Donor status is not REJECTED
- Donor has `reverificationRequested = true`

**Solution**:
```sql
-- Check donor status
SELECT id, "verificationStatus", "reverificationRequested" 
FROM "Donor" 
WHERE "userId" = '[user-id]';

-- If needed, reset re-verification flag
UPDATE "Donor" 
SET "reverificationRequested" = false 
WHERE id = '[donor-id]';
```

---

### **Issue 2: Email Not Received**

**Check 1: Backend Logs**
```bash
# Look for:
✅ Approval email sent to [email]

# If you see:
❌ Error sending approval email
```

**Check 2: Email Configuration**
```bash
# In backend/.env
EMAIL_USER=Poudelashish0718@gmail.com
EMAIL_PASSWORD=hivytxuunttdubfv  # App Password
```

**Check 3: Gmail Settings**
- 2-Step Verification enabled
- App Password is correct
- Not blocked by Gmail

**Check 4: Spam Folder**
- Check donor's spam/junk folder
- Mark as "Not Spam" if found

---

### **Issue 3: Login Link Doesn't Work**

**Check FRONTEND_URL**:
```bash
# In backend/.env
FRONTEND_URL=http://localhost:3000

# Should match your frontend URL
```

**Test Link Manually**:
```
http://localhost:3000/login
```

---

### **Issue 4: Approval Fails**

**Check Backend Logs**:
```bash
# Look for errors like:
❌ Error approving donor
❌ Donor not found
```

**Check Database**:
```sql
-- Verify donor exists
SELECT * FROM "Donor" WHERE id = '[donor-id]';

-- Check status
SELECT "verificationStatus" FROM "Donor" WHERE id = '[donor-id]';
```

---

## 📊 Database Verification

### **Before Re-verification**:
```sql
SELECT 
  id,
  "userId",
  "verificationStatus",
  "rejectionReason",
  "reverificationRequested"
FROM "Donor"
WHERE id = '[donor-id]';

-- Expected:
-- verificationStatus: REJECTED
-- rejectionReason: [some reason]
-- reverificationRequested: false
```

### **After Re-verification**:
```sql
SELECT 
  id,
  "userId",
  "verificationStatus",
  "rejectionReason",
  "reverificationRequested",
  "verifiedAt"
FROM "Donor"
WHERE id = '[donor-id]';

-- Expected:
-- verificationStatus: VERIFIED
-- rejectionReason: null
-- reverificationRequested: false
-- verifiedAt: [timestamp]
```

---

## 🎯 Quick Test Checklist

```
□ Backend running with email service ready
□ Frontend running on localhost:3000
□ Navigate to /admin-public/pending-donors
□ Click "Rejected" statistics card
□ Find rejected donor card
□ See blue "Re-verify Donor" button
□ Click "Re-verify Donor"
□ Approval dialog opens
□ Click "Approve Donor"
□ Success toast appears
□ Check backend logs for email sent
□ Check donor's Gmail inbox
□ Email received with correct subject
□ Email has checkmark and success message
□ Click "Login to Your Account" button
□ Redirects to login page
□ Login with donor credentials
□ Dashboard accessible
□ Profile shows VERIFIED status
```

---

## 🎉 Expected Final Result

After completing all steps:

1. ✅ Donor status changed from REJECTED to VERIFIED
2. ✅ Email sent and received successfully
3. ✅ Email has professional design with login link
4. ✅ Login link works correctly
5. ✅ Donor can access dashboard
6. ✅ Profile shows verified status
7. ✅ Complete workflow successful!

---

## 📝 Test Report Template

```
Test Date: [Date]
Tester: [Your Name]

Test Results:
□ Re-verify button visible: YES / NO
□ Approval dialog works: YES / NO
□ Approval succeeds: YES / NO
□ Email sent (backend logs): YES / NO
□ Email received: YES / NO
□ Email content correct: YES / NO
□ Login link works: YES / NO
□ Login successful: YES / NO
□ Dashboard accessible: YES / NO
□ Profile verified: YES / NO

Overall Result: PASS / FAIL

Notes:
[Any issues or observations]
```

---

## 🚀 Summary

This test verifies the complete re-verification workflow:
1. Admin clicks "Re-verify Donor" button
2. Donor status changes to VERIFIED
3. Email sent with "Verification Successful" message
4. Email includes login link
5. Donor can log in and access dashboard

All features working end-to-end! 🎊
