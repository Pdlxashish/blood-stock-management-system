# Donor Verification System - Implementation Guide

## Overview
This document describes the complete donor verification workflow implemented in the Blood Stock Management System.

## Workflow Steps

### Step 1: Account Registration
**Page:** `/become-donor`
- User fills in basic account information (name, email, phone, password)
- Account is created with `isVerified: false`
- User is redirected to login

### Step 2: Medical Information
**Page:** `/donor-form`
- User logs in and is redirected to complete their donor profile
- User fills in medical information:
  - Blood group
  - Date of birth
  - Weight
  - Location (city and address)
  - Medical conditions
- Donor profile is created with `verificationStatus: PENDING`
- User is redirected to Step 3

### Step 3: Verification Request
**Page:** `/verification-request`
- User sees confirmation that their profile has been submitted
- Status shows "Pending Verification"
- User is informed that admin will contact them for verification
- User can navigate to home or profile page

### Step 4: Admin Verification
**Page:** `/admin-public/donor-verification`
- Admin searches for donor by ID, email, or phone
- Admin reviews donor information including:
  - Personal details
  - Contact information
  - Blood group and medical info
  - Donation history (if any)
- Admin can:
  - **Approve:** Marks donor as VERIFIED, sets `user.isVerified = true`
  - **Reject:** Marks donor as REJECTED with a reason

### Step 5: Profile Status
**Page:** `/profile`
- User can check their verification status:
  - **Verified:** Green badge with pulse animation ✓
  - **Pending:** Yellow badge with pulse animation ⏱
  - **Rejected:** Red badge with rejection reason ✗

## Database Schema

### Donor Model
```prisma
model Donor {
  verificationStatus DonorVerificationStatus @default(PENDING)
  verifiedAt         DateTime?
  verifiedBy         String?
  rejectionReason    String?
}

enum DonorVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### User Model
```prisma
model User {
  isVerified Boolean @default(false)
}
```

## API Endpoints

### Get All Donors (with filters)
```
GET /api/donors?userId={userId}&verificationStatus={status}
```

### Get Pending Donors
```
GET /api/donors/pending
```

### Search/Verify Donor
```
GET /api/donors/verify?query={id|email|phone}
```

### Approve Donor
```
PATCH /api/donors/:id/approve
Body: { verifiedBy: string }
```

### Reject Donor
```
PATCH /api/donors/:id/reject
Body: { rejectionReason: string, verifiedBy: string }
```

### Get Verification Stats
```
GET /api/donors/verification-stats
```

## Frontend Components

### Progress Indicators
All registration pages show a 3-step progress indicator:
1. Account Info (become-donor)
2. Medical Info (donor-form)
3. Verification (verification-request)

### Verification Status Display
The profile page shows verification status with:
- Color-coded badges
- Pulse animations for active states
- Detailed status messages
- Rejection reasons (if applicable)

## Admin Workflow

1. Navigate to `/admin-public/donor-verification`
2. Search for donor using ID, email, or phone
3. Review donor information
4. Contact donor via phone/email if needed
5. Click "Approve Donor" or "Reject" button
6. If rejecting, provide a reason
7. Donor status is updated immediately

## User Experience

### For New Donors
1. Register account → Login
2. Complete medical info
3. See "Verification Request Submitted" page
4. Wait for admin verification
5. Check profile for status updates

### For Verified Donors
- Green "Verified" badge on profile
- Full access to all donor features
- Can participate in blood donation activities

### For Pending Donors
- Yellow "Pending Verification" badge
- Limited access until verified
- Can view profile and home page

### For Rejected Donors
- Red "Verification Rejected" badge
- Can see rejection reason
- May need to contact admin for clarification

## Migration Script

To mark all existing donors as verified:
```bash
cd backend
npx tsx scripts/mark-existing-donors-verified.ts
```

This script:
- Updates all PENDING donors to VERIFIED
- Sets verifiedAt timestamp
- Marks associated users as verified
- Shows verification statistics

## Testing Checklist

- [ ] New user registration flow (3 steps)
- [ ] Donor profile creation with PENDING status
- [ ] Verification request page display
- [ ] Admin search functionality
- [ ] Admin approve functionality
- [ ] Admin reject functionality
- [ ] Profile page status display (all 3 states)
- [ ] Status badge animations
- [ ] Rejection reason display
- [ ] Existing donors marked as verified

## Security Considerations

1. Only authenticated admins can access verification page
2. Verification actions require admin authentication
3. Rejection reasons are stored for audit trail
4. verifiedBy field tracks who performed verification
5. Timestamps track when verification occurred

## Future Enhancements

- Email notifications for verification status changes
- SMS notifications for verification updates
- Bulk verification for multiple donors
- Verification history/audit log
- Re-verification workflow for rejected donors
- Document upload for identity verification
- Automated verification based on criteria
