# Testing the Re-verification System

## Quick Test Guide

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:3000`
3. Database migrated with re-verification fields

### Test 1: View Different Status Tabs

1. **Navigate to Pending Donors Page**
   ```
   http://localhost:3000/admin-public/pending-donors
   ```

2. **Test Tab Switching**
   - Click "Pending" tab → Should show only pending donors
   - Click "Verified" tab → Should show only verified donors
   - Click "Rejected" tab → Should show only rejected donors
   - Click "All Donors" tab → Should show all donors

3. **Test Statistics Cards**
   - Click the "Pending" card (orange) → Switches to Pending tab
   - Click the "Verified" card (green) → Switches to Verified tab
   - Click the "Rejected" card (red) → Switches to Rejected tab
   - Click the "Total Donors" card (blue) → Switches to All Donors tab

### Test 2: Reject a Donor

1. **Go to Pending Tab**
   - Should see list of pending donors

2. **Reject a Donor**
   - Click "Reject" button on any donor
   - Dialog opens
   - Enter rejection reason: "Incomplete address information"
   - Click "Reject Donor"
   - Success toast appears
   - Donor disappears from Pending tab

3. **Verify in Rejected Tab**
   - Click "Rejected" tab
   - Should see the rejected donor
   - Red badge shows "REJECTED"
   - Rejection reason displayed in red alert box

### Test 3: Request Re-verification (Donor Side)

1. **Login as Rejected Donor**
   - Use the credentials of the donor you just rejected
   - Navigate to dashboard

2. **Go to Profile Page**
   ```
   http://localhost:3000/dashboard/profile
   ```

3. **See Rejection Alert**
   - Red alert card at top
   - Shows "Verification Rejected"
   - Displays rejection reason
   - "Request Re-verification" button visible

4. **Request Re-verification**
   - Click "Request Re-verification" button
   - Dialog opens showing rejection reason
   - Enter message (optional): "I have updated my address and uploaded correct documents"
   - Click "Submit Request"
   - Success toast appears
   - Alert changes to blue "Re-verification Pending"

### Test 4: Handle Re-verification Request (Admin Side)

1. **Go Back to Admin Page**
   ```
   http://localhost:3000/admin-public/pending-donors
   ```

2. **Click Rejected Tab**
   - Should see the donor with re-verification request
   - Blue badge shows "Re-verification Requested"
   - Blue alert box shows donor's message
   - Original rejection reason may still be visible

3. **Approve Re-verification**
   - Click "Approve Re-verification" button
   - Confirmation dialog opens
   - Click "Approve Donor"
   - Success toast appears
   - Donor disappears from Rejected tab

4. **Verify in Verified Tab**
   - Click "Verified" tab
   - Should see the donor now verified
   - Green badge shows "VERIFIED"

### Test 5: Search Functionality

1. **Test Search in Each Tab**
   - Go to "All Donors" tab
   - Enter donor name in search box
   - Results filter in real-time
   - Try searching by:
     - Name
     - Email
     - Phone number
     - Donor ID

2. **Test Search in Specific Tabs**
   - Go to "Pending" tab
   - Search for a pending donor
   - Go to "Verified" tab
   - Search for a verified donor
   - Go to "Rejected" tab
   - Search for a rejected donor

### Test 6: Reject Re-verification Request

1. **Create Another Rejected Donor**
   - Reject a pending donor with reason: "Invalid blood group information"

2. **Request Re-verification**
   - Login as that donor
   - Go to profile
   - Request re-verification with message: "Please review again"

3. **Reject the Re-verification**
   - Go to admin page → Rejected tab
   - See the re-verification request
   - Click "Reject" button
   - Enter new rejection reason: "Blood group still not verified"
   - Click "Reject Donor"
   - Donor stays in Rejected tab
   - Re-verification badge disappears
   - New rejection reason shows

4. **Verify Donor Can Request Again**
   - Login as donor
   - Go to profile
   - Should see new rejection reason
   - "Request Re-verification" button available again

## Expected Behavior Summary

### Status Flow:
```
PENDING → VERIFIED (approved)
PENDING → REJECTED (rejected)
REJECTED → REJECTED (with reverificationRequested=true)
REJECTED (with reverificationRequested=true) → VERIFIED (approved)
REJECTED (with reverificationRequested=true) → REJECTED (rejected again)
```

### UI Indicators:
- **Pending**: Orange badge, clock icon
- **Verified**: Green badge, check icon
- **Rejected**: Red badge, X icon
- **Re-verification Requested**: Blue badge, refresh icon

### Profile Page Alerts:
- **Rejected**: Red alert with rejection reason + re-verification button
- **Re-verification Pending**: Blue alert with submitted message
- **Pending**: Orange alert with "under review" message
- **Verified**: Green alert with success message

## API Endpoints to Test

### 1. Get Donors by Status
```bash
# Get pending donors
curl http://localhost:5000/api/donors?verificationStatus=PENDING

# Get verified donors
curl http://localhost:5000/api/donors?verificationStatus=VERIFIED

# Get rejected donors
curl http://localhost:5000/api/donors?verificationStatus=REJECTED

# Get all donors
curl http://localhost:5000/api/donors
```

### 2. Get Verification Stats
```bash
curl http://localhost:5000/api/donors/verification-stats
```

### 3. Request Re-verification
```bash
curl -X PATCH http://localhost:5000/api/donors/{donorId}/request-reverification \
  -H "Content-Type: application/json" \
  -d '{"reverificationMessage": "I have updated my information"}'
```

### 4. Approve Donor
```bash
curl -X PATCH http://localhost:5000/api/donors/{donorId}/approve \
  -H "Content-Type: application/json" \
  -d '{"verifiedBy": "admin-id"}'
```

### 5. Reject Donor
```bash
curl -X PATCH http://localhost:5000/api/donors/{donorId}/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Incomplete information", "verifiedBy": "admin-id"}'
```

### 6. Get Donor by User ID
```bash
curl http://localhost:5000/api/donors/user/{userId}
```

## Troubleshooting

### Issue: Tabs not switching
- Check browser console for errors
- Verify `activeTab` state is updating
- Check API response includes correct data

### Issue: Re-verification button not showing
- Verify donor status is "REJECTED"
- Check `reverificationRequested` is false
- Verify donor profile exists

### Issue: Re-verification request not visible to admin
- Check `reverificationRequested` field is true in database
- Verify API includes re-verification fields in response
- Check "Rejected" tab is selected

### Issue: Statistics not updating
- Refresh the page
- Check API endpoint `/api/donors/verification-stats`
- Verify database counts are correct

## Database Verification

Check the database directly:

```sql
-- View all donors with their verification status
SELECT 
  id, 
  "userId", 
  "bloodGroup", 
  "verificationStatus", 
  "rejectionReason",
  "reverificationRequested",
  "reverificationMessage"
FROM "Donor";

-- Count by status
SELECT 
  "verificationStatus", 
  COUNT(*) 
FROM "Donor" 
GROUP BY "verificationStatus";

-- View re-verification requests
SELECT 
  id,
  "userId",
  "verificationStatus",
  "reverificationRequested",
  "reverificationMessage",
  "reverificationRequestedAt"
FROM "Donor"
WHERE "reverificationRequested" = true;
```

## Success Criteria

✅ All 4 tabs are clickable and filter correctly
✅ Statistics cards are clickable and switch tabs
✅ Search works across all tabs
✅ Rejected donors can request re-verification
✅ Re-verification requests show in admin interface
✅ Admins can approve/reject re-verification requests
✅ Status changes are reflected immediately
✅ Profile page shows correct verification status
✅ Color-coded alerts work correctly
✅ All API endpoints return correct data

## Notes

- The system uses optimistic UI updates with toast notifications
- All state changes trigger data refetch for consistency
- Re-verification can be requested multiple times if rejected again
- The system maintains a clear audit trail of rejection reasons
