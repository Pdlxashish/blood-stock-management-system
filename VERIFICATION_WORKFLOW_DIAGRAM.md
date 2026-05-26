# Donor Verification Workflow - Visual Diagram

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DONOR VERIFICATION WORKFLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ACCOUNT REGISTRATION                                           │
│  Page: /become-donor                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User fills:                                                            │
│  • Name                                                                 │
│  • Email                                                                │
│  • Phone                                                                │
│  • Password [👁️ Toggle visibility]                                      │
│                                                                          │
│  Progress: [1] ─── [2] ─── [3]                                         │
│            ✓                                                            │
│                                                                          │
│  Action: Click "Register"                                               │
│  Result: User created with isVerified = false                           │
│                                                                          │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LOGIN                                                                   │
│  Page: /login                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User logs in with email & password                                     │
│  System checks: isVerified = false → Redirect to /donor-form           │
│                                                                          │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: MEDICAL INFORMATION                                            │
│  Page: /donor-form                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User fills:                                                            │
│  • Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)                      │
│  • Date of Birth                                                        │
│  • Weight (min 50kg)                                                    │
│  • City & Address                                                       │
│  • Medical Conditions                                                   │
│                                                                          │
│  Progress: [1] ─── [2] ─── [3]                                         │
│            ✓      ✓                                                     │
│                                                                          │
│  Action: Click "Complete Registration"                                  │
│  Result: Donor profile created with verificationStatus = PENDING        │
│                                                                          │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: VERIFICATION REQUEST                                           │
│  Page: /verification-request                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ Registration Complete!                                              │
│                                                                          │
│  Progress: [1] ─── [2] ─── [3]                                         │
│            ✓      ✓      ✓                                             │
│                                                                          │
│  ⏱️  Pending Verification                                               │
│  Your profile is under review. Our team will contact you soon.          │
│                                                                          │
│  📧 Email: user@example.com                                             │
│  📱 Phone: +1234567890                                                  │
│                                                                          │
│  [Go to Home]  [View Profile]                                           │
│                                                                          │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  USER PROFILE VIEW                                                       │
│  Page: /profile                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Verification Status:                                                   │
│  ⏱️  [Pending Verification] ← Yellow badge with pulse                   │
│                                                                          │
│  Your profile is under review. Our team will contact you soon.          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌───────────────┐
                         │  ADMIN SIDE   │
                         └───────┬───────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ADMIN VERIFICATION PAGE                                                │
│  Page: /admin-public/donor-verification                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔍 Search Donor                                                        │
│  [Enter donor ID, email, or phone...] [Search]                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ DONOR INFORMATION                                                │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │ Status: [PENDING] [FIRST_TIME] [ACTIVE]                         │  │
│  │                                                                  │  │
│  │ Name: Test Donor                                                │  │
│  │ Email: testdonor@example.com                                    │  │
│  │ Phone: +1234567890                                              │  │
│  │ Blood Group: A+                                                 │  │
│  │ Location: Kathmandu                                             │  │
│  │                                                                  │  │
│  │ Total Donations: 0                                              │  │
│  │ Lives Saved: 0                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ⏱️  Pending Verification                                               │
│  This donor is awaiting verification. Please review their               │
│  information and contact them if needed before approving.               │
│                                                                          │
│  [✓ Approve Donor]  [✗ Reject]                                         │
│                                                                          │
└─────────────────────────┬───────────────────┬───────────────────────────┘
                          │                   │
                 APPROVE  │                   │  REJECT
                          │                   │
                          ▼                   ▼
        ┌─────────────────────────┐  ┌──────────────────────────┐
        │  APPROVE ACTION         │  │  REJECT DIALOG           │
        ├─────────────────────────┤  ├──────────────────────────┤
        │                         │  │                          │
        │ • Set verificationStatus│  │ Enter rejection reason:  │
        │   = VERIFIED            │  │ [Text area]              │
        │ • Set user.isVerified   │  │                          │
        │   = true                │  │ [Confirm] [Cancel]       │
        │ • Set verifiedAt        │  │                          │
        │ • Set verifiedBy        │  │ • Set verificationStatus │
        │                         │  │   = REJECTED             │
        │ ✅ Success!             │  │ • Set rejectionReason    │
        │                         │  │ • Set verifiedAt         │
        └────────┬────────────────┘  └────────┬─────────────────┘
                 │                            │
                 │                            │
                 └────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  UPDATED PROFILE VIEW                                                    │
│  Page: /profile                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  IF APPROVED:                                                           │
│  ✅ [Verified] ← Green badge with pulse animation                       │
│  Verified on: January 1, 2024                                           │
│                                                                          │
│  IF REJECTED:                                                           │
│  ❌ [Verification Rejected] ← Red badge                                 │
│  Reason: Incomplete medical information                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Status Flow Diagram

```
┌──────────────┐
│   NEW USER   │
│  REGISTERS   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  User.isVerified     │
│  = false             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  COMPLETES MEDICAL   │
│  INFORMATION         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Donor.verificationStatus    │
│  = PENDING                   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  ADMIN REVIEWS               │
└──────┬───────────────────────┘
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ APPROVE  │  │  REJECT  │  │  IGNORE  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ VERIFIED │  │ REJECTED │  │ PENDING  │
│    ✅    │  │    ❌    │  │    ⏱️    │
└──────────┘  └──────────┘  └──────────┘
```

## Database State Transitions

```
INITIAL STATE (After Registration)
┌─────────────────────────────────┐
│ User                            │
│ • isVerified: false             │
│ • role: DONOR                   │
└─────────────────────────────────┘

AFTER MEDICAL INFO
┌─────────────────────────────────┐
│ Donor                           │
│ • verificationStatus: PENDING   │
│ • verifiedAt: null              │
│ • verifiedBy: null              │
│ • rejectionReason: null         │
└─────────────────────────────────┘

AFTER APPROVAL
┌─────────────────────────────────┐
│ User                            │
│ • isVerified: true ✅           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Donor                           │
│ • verificationStatus: VERIFIED  │
│ • verifiedAt: 2024-01-01        │
│ • verifiedBy: admin_user_id     │
│ • rejectionReason: null         │
└─────────────────────────────────┘

AFTER REJECTION
┌─────────────────────────────────┐
│ User                            │
│ • isVerified: false ❌          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Donor                           │
│ • verificationStatus: REJECTED  │
│ • verifiedAt: 2024-01-01        │
│ • verifiedBy: admin_user_id     │
│ • rejectionReason: "..."        │
└─────────────────────────────────┘
```

## UI Components Hierarchy

```
/become-donor
├── Progress Indicator (Step 1 active)
├── Registration Form
│   ├── Name Input
│   ├── Email Input
│   ├── Phone Input
│   └── Password Input
│       └── Eye Toggle Button 👁️
└── Register Button

/donor-form
├── Progress Indicator (Step 2 active)
├── Medical Form
│   ├── Blood Group Select
│   ├── Date of Birth Picker
│   ├── Weight Input
│   ├── Location Inputs
│   └── Medical Conditions
└── Complete Registration Button

/verification-request
├── Progress Indicator (Step 3 active)
├── Success Icon ✅
├── Status Card (Yellow - Pending)
├── Contact Information
└── Action Buttons
    ├── Go to Home
    └── View Profile

/profile
├── Profile Card
├── Account Details
│   └── Verification Status
│       ├── Verified Badge (Green + Pulse)
│       ├── Pending Badge (Yellow + Pulse)
│       └── Rejected Badge (Red)
└── Quick Actions

/admin-public/donor-verification
├── Search Bar
├── Donor Information Card
│   ├── Status Badges
│   ├── Personal Info
│   ├── Contact Info
│   └── Donation Stats
└── Verification Actions
    ├── Pending State
    │   ├── Approve Button
    │   └── Reject Button
    ├── Verified State
    │   └── Verification Info
    └── Rejected State
        └── Rejection Reason
```

## Color Coding

```
STATUS COLORS:
┌─────────────┬──────────┬────────────┐
│   Status    │  Color   │ Animation  │
├─────────────┼──────────┼────────────┤
│ VERIFIED    │  Green   │   Pulse    │
│ PENDING     │  Yellow  │   Pulse    │
│ REJECTED    │   Red    │   None     │
│ ACTIVE      │  Green   │   None     │
│ INACTIVE    │   Gray   │   None     │
└─────────────┴──────────┴────────────┘

BADGE EXAMPLES:
✅ [Verified]           ← bg-green-600 + pulse
⏱️  [Pending]           ← bg-yellow-600 + pulse
❌ [Rejected]           ← bg-red-600
```

## API Call Flow

```
1. REGISTRATION
   POST /api/auth/register
   ↓
   { role: 'DONOR', isVerified: false }

2. CREATE DONOR PROFILE
   POST /api/donors
   ↓
   { verificationStatus: 'PENDING' }

3. SEARCH DONOR (Admin)
   GET /api/donors/verify?query=email
   ↓
   { donor info + verification status }

4. APPROVE DONOR (Admin)
   PATCH /api/donors/:id/approve
   ↓
   { verificationStatus: 'VERIFIED', user.isVerified: true }

5. REJECT DONOR (Admin)
   PATCH /api/donors/:id/reject
   ↓
   { verificationStatus: 'REJECTED', rejectionReason: '...' }

6. GET PROFILE STATUS
   GET /api/donors?userId=xxx
   ↓
   { verificationStatus, verifiedAt, rejectionReason }
```

## Legend

```
[1] ─── [2] ─── [3]  = Progress Steps
✓                    = Completed Step
✅                   = Verified Status
⏱️                    = Pending Status
❌                   = Rejected Status
🔍                   = Search Function
📧                   = Email
📱                   = Phone
👁️                    = Password Visibility Toggle
```
