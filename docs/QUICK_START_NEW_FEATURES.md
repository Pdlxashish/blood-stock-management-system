# Quick Start Guide - New Features

## 🚀 Getting Started

### Prerequisites
- Backend and frontend servers running
- Database migrated with latest schema
- At least one admin user and one donor user

---

## Feature 1: Unverify Donor

### Step-by-Step Guide

1. **Start the servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Login as Admin**
   - Go to `http://localhost:3000/login`
   - Login with admin credentials

3. **Navigate to Pending Donors**
   - Go to `http://localhost:3000/admin-public/pending-donors`
   - Or click "Pending Donors" in the admin navigation

4. **View Verified Donors**
   - Click on the "Verified" tab (green card)
   - You'll see all verified donors

5. **Unverify a Donor**
   - Find a verified donor in the list
   - Click the red "Unverify Donor" button
   - A dialog will appear

6. **Enter Reason**
   - Type a reason (e.g., "Incomplete medical information")
   - Click "Unverify Donor" button
   - Donor will receive email and notification

7. **Verify the Action**
   - Donor status changes to "REJECTED"
   - Email sent to donor's email address
   - Notification created in donor's account

---

## Feature 2: Notification System

### Step-by-Step Guide

1. **Login as Donor**
   - Go to `http://localhost:3000/login`
   - Login with donor credentials

2. **Navigate to Home**
   - Go to `http://localhost:3000/home`
   - You'll see your donor dashboard

3. **Find the Notification Bell**
   - Look at the top right corner of the page
   - You'll see a bell icon 🔔
   - If you have unread notifications, there's a red badge with count

4. **View Notifications**
   - Click the bell icon
   - A dropdown appears with your notifications
   - Each notification shows:
     - Icon based on type
     - Title and message
     - Time ago (e.g., "2 hours ago")
     - Blue dot if unread

5. **Interact with Notifications**
   - **Mark as Read:** Click "Mark read" button
   - **Delete:** Click trash icon
   - **Mark All as Read:** Click "Mark all read" at top
   - **View Details:** Click "View details →" link

6. **Test Notifications**
   - Have an admin verify/reject/unverify your profile
   - Check the bell icon - you'll see new notifications
   - Notifications auto-refresh every 30 seconds

---

## Feature 3: 90-Day Countdown Timer

### Step-by-Step Guide

1. **Login as Donor**
   - Go to `http://localhost:3000/login`
   - Login with donor credentials

2. **Navigate to Home**
   - Go to `http://localhost:3000/home`
   - You'll see your donor dashboard

3. **Find the Countdown Timer**
   - Look at the right sidebar
   - At the top, you'll see "Donation Eligibility" card
   - This is your countdown timer

4. **Understanding the Timer**

   **If you haven't donated yet:**
   - Shows green "Ready to Donate!" message
   - Displays a checkmark icon
   - Shows "You can schedule your next blood donation"

   **If you donated recently (within 90 days):**
   - Shows countdown: Days, Hours, Minutes, Seconds
   - Progress bar showing time elapsed
   - Color-coded:
     - Red: More than 7 days remaining
     - Yellow: 1-7 days remaining
     - Green: Eligible to donate
   - Shows last donation date
   - Shows donor ID

5. **Watch it Update**
   - The timer updates every second
   - Progress bar fills up as time passes
   - When countdown reaches zero, shows "Ready to Donate!"

---

## 🎨 UI Improvements

### Enhanced Home Page

1. **Stat Cards with Animations**
   - Hover over any stat card (Total Donations, Lives Saved, etc.)
   - Card lifts up with shadow effect
   - Smooth transition animation

2. **Gradient Backgrounds**
   - Icon circles have gradient backgrounds
   - Section headers have gradient backgrounds
   - Impact card has full gradient

3. **Better Visual Hierarchy**
   - Larger numbers in stat cards
   - Better spacing and padding
   - Enhanced shadows
   - Consistent color scheme

---

## 📧 Email Notifications

### What Emails are Sent?

1. **Verification Approved**
   - Subject: "✅ Verification Successful - Your Donor Profile is Approved!"
   - Contains: Congratulations message, login link, next steps

2. **Verification Rejected**
   - Subject: "Donor Profile Verification Update"
   - Contains: Rejection reason, re-verification instructions

3. **Donor Unverified**
   - Subject: "Verification Status Update - Action Required"
   - Contains: Unverification reason, re-verification instructions

### Check Your Email
- Use the email address associated with your donor account
- Check spam folder if not in inbox
- Emails come from your configured `EMAIL_USER`

---

## 🧪 Quick Test Scenarios

### Scenario 1: Complete Workflow
1. Admin unverifies a donor
2. Donor receives email
3. Donor logs in and sees notification
4. Donor clicks notification to view profile
5. Donor requests re-verification
6. Admin approves re-verification
7. Donor receives approval email and notification

### Scenario 2: Countdown Timer
1. Login as donor who donated 30 days ago
2. See countdown showing ~60 days remaining
3. Check progress bar is at ~33%
4. Wait a few seconds, see timer update
5. Check last donation date is correct

### Scenario 3: Notification Management
1. Login as donor with multiple notifications
2. Click bell icon
3. Mark one notification as read
4. Delete one notification
5. Mark all remaining as read
6. Check unread count is now 0

---

## 🔍 Troubleshooting

### Notifications Not Showing
**Problem:** Bell icon shows but no notifications appear

**Solutions:**
1. Check backend is running: `http://localhost:3001/health`
2. Check database migration ran: `npx prisma migrate status`
3. Check browser console for errors (F12)
4. Verify userId is correct in the component
5. Try triggering a new notification (have admin verify/reject)

### Countdown Timer Not Working
**Problem:** Timer shows but doesn't update

**Solutions:**
1. Check lastDonationDate is valid in database
2. Verify date format is ISO 8601
3. Check browser console for errors
4. Refresh the page
5. Check donor has made at least one donation

### Unverify Button Not Appearing
**Problem:** Can't see unverify button for verified donors

**Solutions:**
1. Make sure you're on the "Verified" tab
2. Check donor status is actually "VERIFIED"
3. Verify you're logged in as admin
4. Check browser console for errors
5. Refresh the page

### Emails Not Sending
**Problem:** Actions complete but no emails received

**Solutions:**
1. Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
2. Verify Gmail app password is correct
3. Check backend logs for email errors
4. Check spam folder
5. Verify email address is correct in database

---

## 📱 Mobile Testing

### Test on Mobile Devices
1. Open `http://your-ip:3000` on mobile
2. Login as donor
3. Check notification bell is accessible
4. Verify countdown timer is responsive
5. Test stat card animations
6. Check all buttons are clickable

---

## 🎯 Success Indicators

### You'll know it's working when:

✅ **Unverify Feature:**
- Button appears for verified donors
- Dialog opens with reason input
- Success message appears after unverifying
- Donor receives email
- Donor sees notification

✅ **Notification System:**
- Bell icon shows in header
- Unread count badge appears
- Dropdown opens with notifications
- Notifications can be marked as read
- Auto-refresh works (wait 30 seconds)

✅ **Countdown Timer:**
- Timer appears in sidebar
- Countdown updates every second
- Progress bar fills up
- Shows correct status (eligible/waiting)
- Last donation date is correct

✅ **UI Improvements:**
- Stat cards lift on hover
- Gradients are visible
- Shadows appear correctly
- Animations are smooth
- Everything is responsive

---

## 🎉 You're All Set!

All three features are now working. Enjoy the enhanced blood donation management system!

### Need Help?
- Check `NEW_FEATURES_IMPLEMENTATION.md` for detailed documentation
- Check `IMPLEMENTATION_SUMMARY.md` for quick reference
- Check browser console for errors (F12)
- Check backend logs for API errors

### Report Issues
If you find any bugs or issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check backend logs
4. Document the expected vs actual behavior
