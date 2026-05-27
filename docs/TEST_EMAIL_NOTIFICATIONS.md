# Testing Email Notifications - Quick Guide

## 🧪 Test Scenarios

### **Test 1: Rejection Email**

**Steps**:
1. Go to `http://localhost:3000/admin-public/pending-donors`
2. Make sure you have a pending donor (or create one)
3. Click the "Reject" button on a donor card
4. Enter rejection reason: "Incomplete medical information. Please provide complete health history."
5. Click "Reject Donor"
6. Check the donor's email inbox (the email used during registration)

**Expected Result**:
- ✅ Toast notification: "Donor rejected. Rejection email sent to donor."
- ✅ Donor status changes to REJECTED
- ✅ Email received with subject: "Donor Profile Verification Update"
- ✅ Email contains rejection reason
- ✅ Email has "Go to Profile" button

**Email Preview**:
```
Subject: Donor Profile Verification Update
From: Blood Donation System

Hello [Name],

After reviewing your donor profile, we regret to inform you that 
your profile verification could not be completed.

📋 Reason for Rejection:
Incomplete medical information. Please provide complete health history.

🔄 What You Can Do:
• Review the rejection reason carefully
• Update your profile information if needed
• Request re-verification from your profile page
• Contact our support team if you have questions

[Go to Profile]
```

---

### **Test 2: Re-verification Request (Donor → Admin)**

**Steps**:
1. Login as the rejected donor
2. Go to `http://localhost:3000/dashboard/profile`
3. You should see a red alert: "Verification Rejected"
4. Click "Request Re-verification" button
5. Enter message: "I have updated my medical information and uploaded all required documents."
6. Click "Submit Request"
7. Check the admin email inbox (ADMIN_EMAIL from .env)

**Expected Result**:
- ✅ Toast notification: "Re-verification request submitted successfully!"
- ✅ Alert changes to blue: "Re-verification Pending"
- ✅ Admin receives email with subject: "🔄 New Re-verification Request"
- ✅ Email contains donor's name, email, and message
- ✅ Email has "Review Request" button

**Email Preview (to Admin)**:
```
Subject: 🔄 New Re-verification Request
From: Blood Donation System
To: Admin

New Re-verification Request

A rejected donor has requested re-verification of their profile.

Donor Information:
• Name: John Doe
• Email: john@example.com

Donor's Message:
I have updated my medical information and uploaded all required documents.

[Review Request]
```

---

### **Test 3: Approval Email (Re-verification)**

**Steps**:
1. Go to `http://localhost:3000/admin-public/pending-donors`
2. Click the "Rejected" statistics card (or tab)
3. Find the donor with blue "Re-verification Requested" badge
4. Click "Approve Re-verification" button
5. Confirm in the dialog
6. Check the donor's email inbox

**Expected Result**:
- ✅ Toast notification: "Donor approved successfully!"
- ✅ Donor moves to "Verified" tab
- ✅ Email received with subject: "✅ Donor Profile Verified - Welcome!"
- ✅ Email has congratulations message
- ✅ Email has "Go to Dashboard" button

**Email Preview**:
```
Subject: ✅ Donor Profile Verified - Welcome!
From: Blood Donation System

🎉 Congratulations!
Your Donor Profile is Verified

Hello [Name],

Great news! Your donor profile has been successfully verified by our team.

✅ You are now a verified blood donor!

What's Next?
• Access your donor dashboard
• View upcoming blood donation events
• Schedule your donation appointments
• Track your donation history
• Earn certificates for your contributions

[Go to Dashboard]
```

---

### **Test 4: Approval Email (First Time)**

**Steps**:
1. Go to `http://localhost:3000/admin-public/pending-donors`
2. Make sure "Pending" tab is selected
3. Find a pending donor (orange badge)
4. Click "Approve" button
5. Confirm in the dialog
6. Check the donor's email inbox

**Expected Result**:
- ✅ Toast notification: "Donor approved successfully!"
- ✅ Donor moves to "Verified" tab
- ✅ Same approval email as Test 3

---

## 🔍 Verification Checklist

### **Email Delivery**:
- [ ] Rejection email received within 1 minute
- [ ] Re-verification notification received within 1 minute
- [ ] Approval email received within 1 minute
- [ ] All emails have correct recipient
- [ ] All emails have correct subject line

### **Email Content**:
- [ ] Rejection reason displayed correctly
- [ ] Donor's re-verification message included
- [ ] All buttons/links work correctly
- [ ] Email formatting looks professional
- [ ] Mobile-responsive design

### **System Behavior**:
- [ ] Operations succeed even if email fails
- [ ] Toast notifications show correct messages
- [ ] Donor status updates correctly
- [ ] Re-verification flags set/cleared properly
- [ ] Admin receives notifications

---

## 🐛 Troubleshooting

### **No Email Received**:

1. **Check Spam/Junk Folder**
   - Gmail may filter automated emails

2. **Verify Email Configuration**:
   ```bash
   # Check backend .env file
   EMAIL_USER=Poudelashish0718@gmail.com
   EMAIL_PASSWORD=hivytxuunttdubfv
   ADMIN_EMAIL=Poudelashish0718@gmail.com
   ```

3. **Check Backend Logs**:
   ```
   Look for:
   ✅ Email service ready to send emails
   📧 [EMAIL SERVICE] Sending rejection email
   ✅ Rejection email sent to [email]
   ```

4. **Check for Errors**:
   ```
   Look for:
   ❌ Error sending rejection email
   ❌ Email configuration error
   ```

### **Email Sent But Not Received**:

1. **Check Email Address**:
   - Verify donor's email in database
   - Check for typos

2. **Check Gmail Settings**:
   - Ensure 2-Step Verification is enabled
   - Verify App Password is correct
   - Check Gmail sending limits

3. **Test Email Service**:
   ```bash
   # In backend directory
   npm run dev
   
   # Look for startup message:
   ✅ Email service ready to send emails
   ```

---

## 📊 Expected Console Output

### **When Rejecting Donor**:
```
📧 [EMAIL SERVICE] Sending donor rejection email
   To: john@example.com
   Name: John Doe
📤 [EMAIL SERVICE] Sending rejection email via nodemailer...
✅ Rejection email sent to john@example.com
📬 [EMAIL SERVICE] Message ID: <...>
```

### **When Requesting Re-verification**:
```
📧 [EMAIL SERVICE] Sending re-verification request notification to admin
✅ Re-verification request notification sent to admin
```

### **When Approving Donor**:
```
📧 [EMAIL SERVICE] Sending donor approval email
   To: john@example.com
   Name: John Doe
📤 [EMAIL SERVICE] Sending approval email via nodemailer...
✅ Approval email sent to john@example.com
📬 [EMAIL SERVICE] Message ID: <...>
```

---

## ✅ Success Criteria

All tests pass if:
- ✅ Rejection emails sent automatically
- ✅ Approval emails sent automatically
- ✅ Admin notifications sent for re-verification requests
- ✅ All emails have correct content
- ✅ All links in emails work
- ✅ Operations succeed even if email fails
- ✅ Console logs show email sending activity
- ✅ No errors in backend logs

---

## 🎯 Quick Test Commands

### **Test Email Service**:
```bash
# Start backend
cd backend
npm run dev

# Look for:
✅ Email service ready to send emails
   Using: Poudelashish0718@gmail.com
```

### **Check Email Logs**:
```bash
# Watch backend logs for email activity
# Look for 📧 and ✅ symbols
```

---

## 📝 Notes

- Emails are sent asynchronously (non-blocking)
- Email failures don't block operations
- All emails use HTML templates
- Mobile-responsive design
- Professional branding
- Clear call-to-action buttons

---

## 🎉 Summary

Test all three email types:
1. **Rejection Email** → Sent when admin rejects donor
2. **Admin Notification** → Sent when donor requests re-verification
3. **Approval Email** → Sent when admin approves donor

All emails should be received within 1 minute of the action! 🚀
