# Donor Re-verification System

## Overview
This document describes the complete donor verification and re-verification workflow implemented in the Blood Stock Management System.

## Features Implemented

### 1. **Clickable Status Tabs** (`/admin-public/pending-donors`)
The pending donors page now has 4 clickable tabs:
- **Pending**: Shows all donors with `PENDING` status
- **Verified**: Shows all donors with `VERIFIED` status
- **Rejected**: Shows all donors with `REJECTED` status
- **All Donors**: Shows all donors regardless of status

Each tab is clickable and dynamically filters the donor list.

### 2. **Statistics Cards**
Four clickable cards at the top show counts for:
- Pending donors (orange)
- Verified donors (green)
- Rejected donors (red)
- Total donors (blue)

Clicking any card switches to that tab.

### 3. **Re-verification Workflow**

#### For Rejected Donors (User Profile):
1. Rejected donors see a red alert card showing:
   - Rejection reason
   - "Request Re-verification" button

2. When clicking "Request Re-verification":
   - Dialog opens with rejection reason displayed
   - Donor can add an optional message explaining changes
   - Submits re-verification request

3. After submission:
   - Status changes to "Re-verification Pending" (blue alert)
   - Shows the message they submitted
   - Cannot submit another request until admin reviews

#### For Admins (Pending Donors Page):
1. Rejected donors with re-verification requests show:
   - Blue badge: "Re-verification Requested"
   - The donor's message explaining why they want re-verification
   - Original rejection reason (if not yet re-verified)

2. Admin can:
   - **Approve Re-verification**: Changes status to `VERIFIED`, clears rejection reason and re-verification flags
   - **Reject Again**: Adds new rejection reason, clears re-verification flags

## Database Schema Changes

### New Fields in `Donor` Model:
```prisma
reverificationRequested Boolean @default(false)
reverificationMessage   String?
reverificationRequestedAt DateTime?
```

## API Endpoints

### New Endpoints:
1. **GET** `/api/donors/user/:userId`
   - Get donor profile by user ID
   - Used in user profile page

2. **PATCH** `/api/donors/:id/request-reverification`
   - Request re-verification for rejected donor
   - Body: `{ reverificationMessage?: string }`

### Updated Endpoints:
1. **GET** `/api/donors`
   - Now includes re-verification fields in response
   - Supports filtering by `verificationStatus` query param

2. **PATCH** `/api/donors/:id/approve`
   - Now handles re-verification approval
   - Clears re-verification flags when approving

3. **PATCH** `/api/donors/:id/reject`
   - Now clears re-verification flags when rejecting again

## User Interface Components

### 1. Admin Public - Pending Donors Page
**Location**: `frontend/app/admin-public/pending-donors/page.tsx`

**Features**:
- Tabs component for filtering by status
- Search functionality across all tabs
- Visual indicators for re-verification requests
- Approve/Reject buttons with dialogs
- Real-time statistics

### 2. User Profile Page
**Location**: `frontend/app/(admin)/dashboard/profile/page.tsx`

**Features**:
- Verification status alerts (color-coded)
- Re-verification request button for rejected donors
- Re-verification dialog with message input
- Display of pending re-verification status

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DONOR REGISTRATION                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Status: PENDING]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN REVIEW                              │
│  - View in "Pending" tab                                     │
│  - Review donor information                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────┴───────────┐
                ↓                       ↓
        [APPROVE]                  [REJECT]
                ↓                       ↓
        Status: VERIFIED        Status: REJECTED
        User can donate         + Rejection Reason
                                        ↓
                        ┌───────────────┴───────────────┐
                        ↓                               ↓
            [Donor Accepts]              [Donor Requests Re-verification]
            No action                               ↓
                                        reverificationRequested = true
                                        + Optional message
                                                    ↓
                                        Shows in "Rejected" tab
                                        with blue "Re-verification" badge
                                                    ↓
                                        ┌───────────┴───────────┐
                                        ↓                       ↓
                                [APPROVE]                  [REJECT AGAIN]
                                        ↓                       ↓
                                Status: VERIFIED        Status: REJECTED
                                Flags cleared           New rejection reason
                                                       Flags cleared
```

## Testing the System

### Test Scenario 1: Reject and Re-verify
1. Go to `/admin-public/pending-donors`
2. Click "Pending" tab
3. Select a donor and click "Reject"
4. Enter rejection reason: "Incomplete address information"
5. Confirm rejection
6. Click "Rejected" tab to see the rejected donor

7. Login as that donor
8. Go to profile page
9. See red alert with rejection reason
10. Click "Request Re-verification"
11. Enter message: "I have updated my address"
12. Submit request

13. Go back to admin page
14. Click "Rejected" tab
15. See blue badge "Re-verification Requested"
16. See donor's message
17. Click "Approve Re-verification"
18. Donor moves to "Verified" tab

### Test Scenario 2: Multiple Status Views
1. Create 3 test donors
2. Approve one → Check "Verified" tab
3. Reject one → Check "Rejected" tab
4. Leave one pending → Check "Pending" tab
5. Click "All Donors" tab → See all 3

### Test Scenario 3: Search Across Tabs
1. Go to any tab
2. Use search bar to filter by:
   - Name
   - Email
   - Phone
   - Donor ID
3. Results update in real-time

## Key Features

### ✅ Clickable Status Tabs
- Pending, Verified, Rejected, All Donors
- Dynamic filtering
- Real-time updates

### ✅ Statistics Cards
- Clickable to switch tabs
- Color-coded by status
- Live counts

### ✅ Re-verification System
- Rejected donors can request re-verification
- Optional message from donor
- Admin sees re-verification requests highlighted
- Approve/Reject re-verification requests
- Status changes dynamically

### ✅ User Profile Integration
- Shows verification status with color-coded alerts
- Re-verification button for rejected donors
- Pending re-verification status display
- Clear messaging throughout

### ✅ Search & Filter
- Search across all fields
- Works on all tabs
- Real-time filtering

## Migration Applied
```bash
npx prisma migrate dev --name add_reverification_fields
```

Migration file: `20260526182849_add_reverification_fields`

## Files Modified

### Backend:
1. `backend/prisma/schema.prisma` - Added re-verification fields
2. `backend/src/controllers/donorController.ts` - Added re-verification logic
3. `backend/src/routes/donorRoutes.ts` - Added new routes

### Frontend:
1. `frontend/app/admin-public/pending-donors/page.tsx` - Complete redesign with tabs
2. `frontend/app/(admin)/dashboard/profile/page.tsx` - Added re-verification UI

## Next Steps (Optional Enhancements)

1. **Email Notifications**:
   - Notify donor when rejected
   - Notify admin when re-verification requested
   - Notify donor when re-verified

2. **Audit Trail**:
   - Track who approved/rejected
   - Track re-verification history
   - Show verification timeline

3. **Bulk Actions**:
   - Approve multiple donors at once
   - Export donor lists by status

4. **Advanced Filters**:
   - Filter by blood group
   - Filter by location
   - Filter by date range

## Conclusion

The donor verification system is now fully functional with:
- ✅ Clickable status tabs (Pending, Verified, Rejected, All)
- ✅ Dynamic filtering and search
- ✅ Re-verification workflow for rejected donors
- ✅ Admin interface to handle re-verification requests
- ✅ User profile integration
- ✅ Real-time statistics
- ✅ Color-coded status indicators

All features are working end-to-end with proper database schema, API endpoints, and UI components.
