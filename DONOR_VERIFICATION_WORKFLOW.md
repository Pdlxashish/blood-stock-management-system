# Donor Verification Workflow

## Overview

This document describes the donor verification workflow implemented in the Blood Stock Management System. The workflow ensures that all new donor registrations are reviewed and verified by public dashboard administrators before they can access the admin dashboard and donate blood.

## Workflow Steps

### 1. Donor Registration

When a new donor registers through the `/become-donor` page:

1. User fills out the registration form with:
   - Name
   - Email
   - Phone
   - Password

2. After successful registration, they are redirected to login

3. Upon login, they complete their donor profile with:
   - Blood Group
   - Date of Birth
   - Weight
   - Location/City
   - Address

4. **Important**: The donor profile is created with `verificationStatus: 'PENDING'`
   - The donor is NOT automatically verified
   - The user's `isVerified` field remains `false`

### 2. Pending Verification

After registration, the donor's information is:

- **NOT visible** in the admin dashboard donor list
- **VISIBLE** in the Public Dashboard "Pending Donors" page (`/admin-public/pending-donors`)
- Listed in chronological order (newest first)

### 3. Public Dashboard Review

Public dashboard administrators can:

1. Navigate to **"Pending Donors"** in the public dashboard
2. View all pending donor registrations with full details:
   - Personal information (name, email, phone)
   - Blood group
   - Location and address
   - Date of birth and weight
   - Registration date

3. Search and filter pending donors

4. Take action on each donor:
   - **Approve**: Verify the donor as legitimate
   - **Reject**: Reject the registration with a reason

### 4. Approval Process

When a public dashboard admin **approves** a donor:

1. The donor's `verificationStatus` is set to `'VERIFIED'`
2. The donor's `verifiedAt` timestamp is recorded
3. The user's `isVerified` field is set to `true`
4. The donor **now appears** in the admin dashboard donor list
5. The donor can now:
   - Access the admin dashboard (if they have appropriate role)
   - Be selected for blood donations
   - Participate in blood donation events

### 5. Rejection Process

When a public dashboard admin **rejects** a donor:

1. The donor's `verificationStatus` is set to `'REJECTED'`
2. A `rejectionReason` is recorded
3. The donor does NOT appear in the admin dashboard
4. The donor cannot donate blood through the system

## Database Schema Changes

### Donor Model

New fields added to the `Donor` model:

```prisma
model Donor {
  // ... existing fields ...
  
  // Verification status
  verificationStatus DonorVerificationStatus @default(PENDING)
  verifiedAt         DateTime?
  verifiedBy         String?   // User ID of the person who verified
  rejectionReason    String?   // Reason if rejected
  
  // ... rest of fields ...
}

enum DonorVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

## API Endpoints

### Get Pending Donors
```
GET /api/donors/pending
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)

Response:
{
  status: "success",
  data: Donor[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Get Verification Statistics
```
GET /api/donors/verification-stats

Response:
{
  status: "success",
  data: {
    pending: number,
    verified: number,
    rejected: number,
    total: number
  }
}
```

### Approve Donor
```
PUT /api/donors/:id/approve
Body:
{
  verifiedBy: string (optional)
}

Response:
{
  status: "success",
  message: "Donor verified successfully",
  data: Donor
}
```

### Reject Donor
```
PUT /api/donors/:id/reject
Body:
{
  rejectionReason: string (required),
  verifiedBy: string (optional)
}

Response:
{
  status: "success",
  message: "Donor rejected",
  data: Donor
}
```

### Get All Donors (Updated)
```
GET /api/donors
Query Parameters:
  - verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  - bloodGroup: string
  - location: string
  - isEligible: boolean
  - page: number
  - limit: number

Note: The admin dashboard automatically filters for verificationStatus='VERIFIED'
```

## Frontend Pages

### Public Dashboard - Pending Donors
**Path**: `/admin-public/pending-donors`

Features:
- Lists all pending donor registrations
- Shows verification statistics (pending, verified, rejected, total)
- Search functionality (by name, email, phone, donor ID)
- Approve/Reject actions with confirmation dialogs
- Real-time updates after actions

### Public Dashboard - Donor Verification
**Path**: `/admin-public/donor-verification`

Features:
- Search for any donor by ID, email, or phone
- View complete donor information
- Check verification status
- View donation history

### Admin Dashboard - Donors
**Path**: `/dashboard/donors`

Changes:
- **Only shows VERIFIED donors**
- Pending and rejected donors are NOT visible
- All existing functionality works with verified donors only

## User Experience Flow

### For New Donors

1. Register at `/become-donor`
2. Login at `/login`
3. Complete donor profile
4. See message: "Donor profile submitted successfully. Your account will be verified by our team shortly."
5. Wait for verification
6. Once verified, can access full system features

### For Public Dashboard Admins

1. Login to public dashboard
2. Navigate to "Pending Donors"
3. Review new registrations
4. Verify legitimacy of donor information
5. Approve or reject with appropriate reason
6. Approved donors appear in admin dashboard

### For Admin Dashboard Users

1. Login to admin dashboard
2. Navigate to "Donors"
3. See only verified donors
4. All donor operations work with verified donors only

## Security Considerations

1. **Two-Step Verification**: Registration + Admin Approval
2. **Audit Trail**: Records who verified and when
3. **Rejection Reasons**: Documented reasons for rejections
4. **Separation of Concerns**: Public dashboard handles verification, admin dashboard handles operations

## Migration Notes

For existing donors in the database:

1. Run the migration: `20260525222220_add_donor_verification_status`
2. Existing donors will have `verificationStatus: 'PENDING'` by default
3. You may want to manually update existing legitimate donors to `'VERIFIED'`:

```sql
UPDATE "Donor" 
SET "verificationStatus" = 'VERIFIED', 
    "verifiedAt" = NOW() 
WHERE "createdAt" < '2026-05-25';
```

## Testing

### Test Scenarios

1. **New Registration**
   - Register a new donor
   - Verify they appear in pending donors list
   - Verify they do NOT appear in admin dashboard

2. **Approval**
   - Approve a pending donor
   - Verify they appear in admin dashboard
   - Verify they disappear from pending list

3. **Rejection**
   - Reject a pending donor with reason
   - Verify they do NOT appear in admin dashboard
   - Verify rejection reason is recorded

4. **Search and Filter**
   - Test search in pending donors page
   - Test filtering in admin dashboard

## Future Enhancements

Potential improvements:

1. **Email Notifications**: Notify donors when approved/rejected
2. **Resubmission**: Allow rejected donors to resubmit
3. **Bulk Actions**: Approve/reject multiple donors at once
4. **Verification Notes**: Add notes during verification process
5. **Verification History**: Track all verification actions
6. **Role-Based Verification**: Different verification levels
7. **Automated Checks**: Validate phone numbers, emails, etc.

## Troubleshooting

### Donor not appearing in pending list
- Check if `verificationStatus` is `'PENDING'`
- Check if donor profile was created successfully
- Check backend logs for errors

### Approved donor not appearing in admin dashboard
- Verify `verificationStatus` is `'VERIFIED'`
- Check if `isVerified` is `true` on User model
- Clear browser cache and refresh

### Cannot approve/reject donor
- Check authentication and permissions
- Verify API endpoints are accessible
- Check network tab for error responses

## Support

For issues or questions about the donor verification workflow:
1. Check this documentation
2. Review the code in:
   - Backend: `backend/src/controllers/donorController.ts`
   - Frontend: `frontend/app/admin-public/pending-donors/page.tsx`
3. Check the database schema: `backend/prisma/schema.prisma`
