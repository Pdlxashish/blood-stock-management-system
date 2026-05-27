# Donor Verification Testing Guide

## Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:3000`
- Database connected and migrations applied

## Test Scenario 1: New Donor Registration with Verification

### Step 1: Register New Donor Account
1. Navigate to `http://localhost:3000/become-donor`
2. Fill in the registration form:
   - **Name:** Test Donor
   - **Email:** testdonor@example.com
   - **Phone:** +1234567890
   - **Password:** password123
3. Check the terms checkbox
4. Click "Register"
5. **Expected:** Success message and redirect to login page

### Step 2: Login and Complete Medical Info
1. Navigate to `http://localhost:3000/login`
2. Login with:
   - **Email:** testdonor@example.com
   - **Password:** password123
3. **Expected:** Redirect to `/donor-form` (Step 2: Medical Info)
4. Fill in medical information:
   - **Blood Group:** A+
   - **Date of Birth:** 01/01/1990
   - **Weight:** 70 kg
   - **City:** Kathmandu
   - **Address:** Thamel, Kathmandu
5. Select "No" for medical conditions
6. Check the confirmation checkbox
7. Click "Complete Registration"
8. **Expected:** Redirect to `/verification-request` (Step 3)

### Step 3: Verification Request Page
1. **Expected to see:**
   - ✓ Green checkmarks for Steps 1 and 2
   - Red indicator for Step 3 (current)
   - "Registration Complete!" message
   - "Verification Pending" status card (yellow)
   - Contact information displayed
   - "Go to Home" and "View Profile" buttons

### Step 4: Check Profile Status
1. Click "View Profile" or navigate to `http://localhost:3000/profile`
2. **Expected to see:**
   - Verification Status section with:
     - Yellow "Pending Verification" badge with pulse animation
     - Message: "Your profile is under review. Our team will contact you soon."

### Step 5: Admin Verification
1. Login as admin (or navigate to admin verification page)
2. Navigate to `http://localhost:3000/admin-public/donor-verification`
3. Search for the donor using:
   - Email: testdonor@example.com
   - OR Phone: +1234567890
   - OR Donor ID (from database)
4. Click "Search"
5. **Expected to see:**
   - Donor information card
   - Status badges showing "PENDING"
   - "Approve Donor" button (green)
   - "Reject" button (red)

### Step 6: Approve Donor
1. Click "Approve Donor" button
2. **Expected:**
   - Success toast: "Donor verified successfully!"
   - Status changes to "VERIFIED" (green badge)
   - "Donor Verified" card appears
   - Approve/Reject buttons disappear

### Step 7: Verify Profile Update
1. Go back to donor profile: `http://localhost:3000/profile`
2. **Expected to see:**
   - Green "Verified" badge with pulse animation ✓
   - Verification date displayed

## Test Scenario 2: Reject Donor Verification

### Follow Steps 1-5 from Scenario 1

### Step 6: Reject Donor
1. Click "Reject" button
2. **Expected:** Rejection dialog appears
3. Enter rejection reason: "Incomplete medical information"
4. Click "Confirm Rejection"
5. **Expected:**
   - Success toast: "Donor verification rejected"
   - Status changes to "REJECTED" (red badge)
   - Rejection reason displayed in red card

### Step 7: Verify Profile Update
1. Go back to donor profile
2. **Expected to see:**
   - Red "Verification Rejected" badge
   - Rejection reason: "Incomplete medical information"

## Test Scenario 3: Existing Donors (Already Verified)

### Step 1: Check Existing Donor
1. Login as an existing donor (e.g., Niruta Tamang)
2. Navigate to profile
3. **Expected to see:**
   - Green "Verified" badge with pulse animation
   - Verification date (if available)

### Step 2: Search in Admin Panel
1. Navigate to admin verification page
2. Search for existing donor
3. **Expected to see:**
   - "VERIFIED" status badge
   - "Donor Verified" card (green)
   - No approve/reject buttons (already verified)

## Test Scenario 4: Password Visibility Toggle

### Step 1: Test on Registration Page
1. Navigate to `http://localhost:3000/become-donor`
2. Enter password in password field
3. **Expected:** Password is hidden (dots)
4. Click the eye icon
5. **Expected:** Password becomes visible
6. Click the eye-off icon
7. **Expected:** Password is hidden again

## Verification Checklist

### Frontend
- [ ] 3-step progress indicator on all pages
- [ ] Password eye toggle works
- [ ] Registration redirects to login
- [ ] Login redirects to donor-form for unverified donors
- [ ] Donor-form redirects to verification-request
- [ ] Verification-request page displays correctly
- [ ] Profile shows correct verification status
- [ ] Status badges have pulse animations
- [ ] Admin search works with email/phone/ID
- [ ] Approve button works
- [ ] Reject dialog works
- [ ] Rejection reason is required

### Backend
- [ ] New donors created with PENDING status
- [ ] User.isVerified stays false until approved
- [ ] Approve endpoint updates both Donor and User
- [ ] Reject endpoint stores rejection reason
- [ ] Search endpoint finds donors correctly
- [ ] Existing donors marked as VERIFIED (migration)

### Database
- [ ] Donor.verificationStatus field exists
- [ ] Donor.verifiedAt field exists
- [ ] Donor.verifiedBy field exists
- [ ] Donor.rejectionReason field exists
- [ ] All existing donors have VERIFIED status

## Common Issues and Solutions

### Issue: Donor not found in search
**Solution:** Check if donor profile was created in Step 2

### Issue: Approve button doesn't work
**Solution:** Check if user is authenticated and has admin role

### Issue: Profile doesn't show verification status
**Solution:** Check if donor profile exists and API call succeeds

### Issue: Password eye icon not showing
**Solution:** Check if Eye and EyeOff icons are imported from lucide-react

### Issue: Existing donors still show PENDING
**Solution:** Run the migration script: `npx tsx scripts/mark-existing-donors-verified.ts`

## API Testing with cURL

### Search for Donor
```bash
curl -X GET "http://localhost:5000/api/donors/verify?query=testdonor@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve Donor
```bash
curl -X PATCH "http://localhost:5000/api/donors/DONOR_ID/approve" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verifiedBy": "ADMIN_USER_ID"}'
```

### Reject Donor
```bash
curl -X PATCH "http://localhost:5000/api/donors/DONOR_ID/reject" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Test rejection", "verifiedBy": "ADMIN_USER_ID"}'
```

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Smooth user experience
✅ Clear status indicators
✅ Admin can verify/reject donors
✅ Profile updates in real-time
✅ Existing donors remain verified
