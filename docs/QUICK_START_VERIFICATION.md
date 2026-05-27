# Quick Start Guide - Donor Verification System

## 🚀 Getting Started

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Mark existing donors as verified (one-time migration)
npx tsx scripts/mark-existing-donors-verified.ts

# Restart backend server (if running)
# Press Ctrl+C to stop, then:
npm run dev
```

**Expected Output:**
```
🔄 Marking all existing donors as VERIFIED...
✅ Updated 20 donors to VERIFIED status
✅ Updated 20 users to verified status

📊 Verification Status Summary:
   VERIFIED: 20
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Restart frontend server (if running)
# Press Ctrl+C to stop, then:
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## 🧪 Quick Test

### Test New Donor Registration

1. **Register New Account**
   - Go to: http://localhost:3000/become-donor
   - Fill in details and register
   - Login with credentials

2. **Complete Medical Info**
   - Fill in blood group, DOB, weight, location
   - Submit form

3. **Verification Request**
   - You'll see "Registration Complete!" page
   - Status shows "Pending Verification"

4. **Check Profile**
   - Go to: http://localhost:3000/profile
   - See yellow "Pending Verification" badge with pulse

5. **Admin Verification**
   - Go to: http://localhost:3000/admin-public/donor-verification
   - Search for donor by email
   - Click "Approve Donor"

6. **Verify Status Update**
   - Go back to profile
   - See green "Verified" badge with pulse ✓

## 📋 Features to Test

### ✅ Password Visibility Toggle
- On registration page, click eye icon to show/hide password

### ✅ 3-Step Progress Indicator
- Step 1: Account Info (become-donor)
- Step 2: Medical Info (donor-form)
- Step 3: Verification (verification-request)

### ✅ Verification Status
- **Verified:** Green badge with pulse
- **Pending:** Yellow badge with pulse
- **Rejected:** Red badge with reason

### ✅ Admin Actions
- Search donors
- Approve verification
- Reject with reason

## 🔍 Verification URLs

| Page | URL |
|------|-----|
| Registration | http://localhost:3000/become-donor |
| Login | http://localhost:3000/login |
| Medical Info | http://localhost:3000/donor-form |
| Verification Request | http://localhost:3000/verification-request |
| Profile | http://localhost:3000/profile |
| Admin Verification | http://localhost:3000/admin-public/donor-verification |

## 📊 Check Database

### View Verification Status
```sql
SELECT 
  u.name,
  u.email,
  u.isVerified as user_verified,
  d.verificationStatus as donor_status,
  d.verifiedAt,
  d.rejectionReason
FROM "User" u
LEFT JOIN "Donor" d ON u.id = d.userId
WHERE u.role = 'DONOR'
ORDER BY d.createdAt DESC;
```

### Count by Status
```sql
SELECT 
  verificationStatus,
  COUNT(*) as count
FROM "Donor"
GROUP BY verificationStatus;
```

## 🐛 Troubleshooting

### Issue: Existing donors show "Not Verified"
**Solution:** Run the migration script:
```bash
cd backend
npx tsx scripts/mark-existing-donors-verified.ts
```

### Issue: Can't approve donor
**Solution:** 
- Check if you're logged in as admin
- Check browser console for errors
- Verify backend is running

### Issue: Profile doesn't show status
**Solution:**
- Check if donor profile exists
- Open browser DevTools → Network tab
- Look for API call to `/api/donors?userId=...`

### Issue: Password eye icon not working
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if Eye/EyeOff icons are imported

## 📝 Test Accounts

### Existing Verified Donor
- **Name:** Niruta Tamang
- **Status:** VERIFIED (from migration)
- **Can:** Access all features

### New Test Donor
- **Email:** testdonor@example.com
- **Password:** password123
- **Status:** PENDING (after registration)
- **Can:** View profile, wait for verification

## 🎯 Success Indicators

✅ Migration script runs successfully
✅ Existing donors show "Verified" status
✅ New donors show "Pending" status
✅ Admin can search and verify donors
✅ Profile updates in real-time
✅ No console errors
✅ Smooth user experience

## 📚 Documentation

- **Implementation Guide:** DONOR_VERIFICATION_IMPLEMENTATION.md
- **Testing Guide:** VERIFICATION_TESTING_GUIDE.md
- **Changes Summary:** VERIFICATION_CHANGES_SUMMARY.md

## 🔐 Admin Access

To access admin verification page:
1. Login as admin user
2. Navigate to: http://localhost:3000/admin-public/donor-verification
3. Search for donors by ID, email, or phone

## 💡 Tips

- Use browser DevTools to inspect API calls
- Check Network tab for request/response
- Monitor Console for errors
- Use React DevTools to inspect component state

## 🎉 You're All Set!

The donor verification system is now fully implemented and ready to use. Follow the test scenarios in VERIFICATION_TESTING_GUIDE.md for comprehensive testing.
