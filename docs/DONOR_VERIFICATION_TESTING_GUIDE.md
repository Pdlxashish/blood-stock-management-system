# Donor Verification Testing Guide

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:3000`
3. Database migrations applied
4. Prisma client generated

## Setup Steps

### 1. Apply Database Migration

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 2. Update Existing Donors (Optional)

If you have existing donors in your database, run this script to mark them as verified:

```bash
cd backend
npx ts-node scripts/update-existing-donors.ts
```

### 3. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Test Scenarios

### Scenario 1: New Donor Registration

**Objective**: Verify that new donors are created with PENDING status

**Steps**:
1. Navigate to `http://localhost:3000/become-donor`
2. Fill out the registration form:
   - Name: Test Donor
   - Email: testdonor@example.com
   - Phone: +1234567890
   - Password: password123
3. Click "Register"
4. Login with the credentials
5. Complete the donor profile:
   - Blood Group: A+
   - Date of Birth: 1990-01-01
   - Weight: 70
   - Location: Test City
   - Address: 123 Test Street

**Expected Results**:
- ✅ Registration successful
- ✅ Message: "Donor profile submitted successfully. Your account will be verified by our team shortly."
- ✅ Donor does NOT appear in admin dashboard (`/dashboard/donors`)
- ✅ Donor DOES appear in public dashboard pending list (`/admin-public/pending-donors`)

### Scenario 2: View Pending Donors

**Objective**: Verify that pending donors are listed correctly

**Steps**:
1. Login to public dashboard (use admin credentials)
2. Navigate to "Pending Donors" (`/admin-public/pending-donors`)

**Expected Results**:
- ✅ See statistics cards showing:
  - Pending count
  - Verified count
  - Rejected count
  - Total count
- ✅ See list of pending donors with:
  - Name, email, phone
  - Blood group
  - Location
  - Registration date
  - Approve/Reject buttons

### Scenario 3: Search Pending Donors

**Objective**: Verify search functionality works

**Steps**:
1. On the pending donors page
2. Enter search query in the search box:
   - Try searching by name
   - Try searching by email
   - Try searching by phone
   - Try searching by donor ID

**Expected Results**:
- ✅ Results filter in real-time
- ✅ Only matching donors are shown
- ✅ Clear search shows all pending donors again

### Scenario 4: Approve a Donor

**Objective**: Verify donor approval workflow

**Steps**:
1. On the pending donors page
2. Click "Approve" button for a pending donor
3. Confirm in the dialog
4. Wait for success message

**Expected Results**:
- ✅ Success toast: "Donor approved successfully!"
- ✅ Donor disappears from pending list
- ✅ Pending count decreases by 1
- ✅ Verified count increases by 1
- ✅ Donor NOW appears in admin dashboard (`/dashboard/donors`)
- ✅ Donor's `verificationStatus` is `VERIFIED` in database
- ✅ User's `isVerified` is `true` in database

### Scenario 5: Reject a Donor

**Objective**: Verify donor rejection workflow

**Steps**:
1. On the pending donors page
2. Click "Reject" button for a pending donor
3. Enter rejection reason: "Invalid phone number"
4. Confirm rejection

**Expected Results**:
- ✅ Success toast: "Donor rejected"
- ✅ Donor disappears from pending list
- ✅ Pending count decreases by 1
- ✅ Rejected count increases by 1
- ✅ Donor does NOT appear in admin dashboard
- ✅ Donor's `verificationStatus` is `REJECTED` in database
- ✅ Rejection reason is saved in database

### Scenario 6: Admin Dashboard Only Shows Verified Donors

**Objective**: Verify admin dashboard filtering

**Steps**:
1. Login to admin dashboard
2. Navigate to "Donors" (`/dashboard/donors`)
3. Check the donor list

**Expected Results**:
- ✅ Only VERIFIED donors are shown
- ✅ PENDING donors are NOT shown
- ✅ REJECTED donors are NOT shown
- ✅ All existing functionality works (search, filter, pagination)

### Scenario 7: Donor Verification Search

**Objective**: Verify the donor verification search page works

**Steps**:
1. Navigate to "Donor Verification" (`/admin-public/donor-verification`)
2. Search for a donor by:
   - Donor ID
   - Email
   - Phone number

**Expected Results**:
- ✅ Donor information is displayed
- ✅ Verification status badge is shown
- ✅ Donation history is displayed
- ✅ All donor details are visible

### Scenario 8: API Endpoints

**Objective**: Verify all API endpoints work correctly

**Test with cURL or Postman**:

#### Get Pending Donors
```bash
curl http://localhost:5000/api/donors/pending
```

Expected: List of pending donors with pagination

#### Get Verification Stats
```bash
curl http://localhost:5000/api/donors/verification-stats
```

Expected: Statistics object with counts

#### Approve Donor
```bash
curl -X PUT http://localhost:5000/api/donors/{DONOR_ID}/approve \
  -H "Content-Type: application/json" \
  -d '{"verifiedBy": "admin-user-id"}'
```

Expected: Success response with updated donor

#### Reject Donor
```bash
curl -X PUT http://localhost:5000/api/donors/{DONOR_ID}/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Invalid information", "verifiedBy": "admin-user-id"}'
```

Expected: Success response with updated donor

#### Get All Donors (Verified Only)
```bash
curl http://localhost:5000/api/donors?verificationStatus=VERIFIED
```

Expected: List of only verified donors

## Database Verification

### Check Donor Status in Database

```sql
-- View all donors with their verification status
SELECT 
  d.id,
  u.name,
  u.email,
  d."bloodGroup",
  d."verificationStatus",
  d."verifiedAt",
  d."rejectionReason",
  u."isVerified"
FROM "Donor" d
JOIN "User" u ON d."userId" = u.id
ORDER BY d."createdAt" DESC;

-- Count by verification status
SELECT 
  "verificationStatus",
  COUNT(*) as count
FROM "Donor"
GROUP BY "verificationStatus";

-- View pending donors
SELECT 
  d.id,
  u.name,
  u.email,
  d."createdAt"
FROM "Donor" d
JOIN "User" u ON d."userId" = u.id
WHERE d."verificationStatus" = 'PENDING'
ORDER BY d."createdAt" DESC;
```

## Common Issues and Solutions

### Issue 1: Donor not appearing in pending list

**Solution**:
- Check if donor profile was created successfully
- Verify `verificationStatus` is `PENDING` in database
- Check browser console for errors
- Verify backend API is returning data

### Issue 2: Cannot approve/reject donor

**Solution**:
- Check authentication token
- Verify API endpoints are accessible
- Check backend logs for errors
- Ensure donor ID is correct

### Issue 3: Approved donor not in admin dashboard

**Solution**:
- Verify `verificationStatus` is `VERIFIED`
- Check `isVerified` is `true` on User
- Clear browser cache
- Refresh the page
- Check query filters in useDonors hook

### Issue 4: Migration errors

**Solution**:
```bash
# Reset database (WARNING: This will delete all data)
cd backend
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
npx prisma generate
```

## Performance Testing

### Load Test Pending Donors Page

1. Create 100+ pending donors
2. Navigate to pending donors page
3. Verify:
   - Page loads quickly
   - Pagination works
   - Search is responsive
   - Actions complete quickly

### Concurrent Approvals

1. Open multiple browser tabs
2. Approve different donors simultaneously
3. Verify:
   - No race conditions
   - All approvals succeed
   - Counts update correctly

## Security Testing

### Test Authorization

1. Try accessing pending donors page without login
   - Expected: Redirect to login

2. Try approving donor without authentication
   - Expected: 401 Unauthorized

3. Try accessing admin dashboard as unverified donor
   - Expected: Access denied or limited view

## Cleanup

After testing, you may want to:

1. Delete test donors:
```sql
DELETE FROM "Donor" WHERE "user"."email" LIKE 'test%@example.com';
```

2. Reset verification status:
```sql
UPDATE "Donor" SET "verificationStatus" = 'PENDING' WHERE "verificationStatus" = 'VERIFIED';
```

## Success Criteria

All tests pass when:
- ✅ New donors are created with PENDING status
- ✅ Pending donors appear in public dashboard
- ✅ Pending donors do NOT appear in admin dashboard
- ✅ Approval workflow works correctly
- ✅ Rejection workflow works correctly
- ✅ Approved donors appear in admin dashboard
- ✅ Search and filter work correctly
- ✅ Statistics are accurate
- ✅ No errors in console or logs
- ✅ Database state is consistent

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Run tests again in staging
3. Update user documentation
4. Train public dashboard administrators
5. Deploy to production
6. Monitor for issues
7. Collect feedback from users

## Support

If you encounter issues:
1. Check this testing guide
2. Review `DONOR_VERIFICATION_WORKFLOW.md`
3. Check backend logs
4. Check browser console
5. Verify database state
6. Review code in:
   - `backend/src/controllers/donorController.ts`
   - `frontend/app/admin-public/pending-donors/page.tsx`
