# Notification System Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   FRONTEND   │◄───────►│   BACKEND    │◄───────►│   DATABASE   │
│              │         │              │         │              │
│ - Bell Icon  │         │ - API Routes │         │ - Notification│
│ - Dropdown   │         │ - Controller │         │   Table      │
│ - Auto Poll  │         │ - Email Svc  │         │ - User Table │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                         │
       │                        ▼                         │
       │                 ┌──────────────┐                │
       └────────────────►│ EMAIL SERVER │◄───────────────┘
                         │   (Gmail)    │
                         └──────────────┘
```

---

## Notification Creation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION CREATION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

1. ADMIN ACTION
   │
   ├─► Approve Donor
   ├─► Reject Donor
   └─► Unverify Donor
       │
       ▼
2. BACKEND PROCESSING
   │
   ├─► Update Donor Status in Database
   │
   ├─► Create Notification Record
   │   ├─ userId
   │   ├─ type (VERIFICATION_APPROVED, etc.)
   │   ├─ title
   │   ├─ message
   │   ├─ link (optional)
   │   └─ isRead: false
   │
   └─► Send Email Notification
       ├─ Get donor email
       ├─ Format email template
       └─ Send via Nodemailer
       │
       ▼
3. DONOR NOTIFICATION
   │
   ├─► Email arrives in inbox
   │
   └─► In-app notification created
       │
       ▼
4. DONOR VIEWS NOTIFICATION
   │
   ├─► Bell icon shows unread count
   │
   ├─► Click bell to open dropdown
   │
   ├─► See notification with icon & message
   │
   └─► Click "Mark read" or "View details"
       │
       ▼
5. NOTIFICATION MARKED AS READ
   │
   └─► isRead: true in database
```

---

## Unverify Donor Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      UNVERIFY DONOR WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   ADMIN     │
│  Dashboard  │
└──────┬──────┘
       │
       │ 1. Navigate to Pending Donors
       ▼
┌─────────────────────┐
│  Verified Donors    │
│  Tab Selected       │
└──────┬──────────────┘
       │
       │ 2. Click "Unverify Donor"
       ▼
┌─────────────────────┐
│  Unverify Dialog    │
│  Opens              │
└──────┬──────────────┘
       │
       │ 3. Enter Reason
       ▼
┌─────────────────────┐
│  Confirm Action     │
└──────┬──────────────┘
       │
       │ 4. API Call: PATCH /api/donors/:id/unverify
       ▼
┌─────────────────────────────────────────────┐
│         BACKEND PROCESSING                  │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │ 1. Validate Request                │   │
│  │    - Check donor exists            │   │
│  │    - Check donor is verified       │   │
│  │    - Check reason provided         │   │
│  └────────────────────────────────────┘   │
│                  │                          │
│                  ▼                          │
│  ┌────────────────────────────────────┐   │
│  │ 2. Update Database                 │   │
│  │    - verificationStatus: REJECTED  │   │
│  │    - rejectionReason: <reason>     │   │
│  │    - user.isVerified: false        │   │
│  └────────────────────────────────────┘   │
│                  │                          │
│                  ▼                          │
│  ┌────────────────────────────────────┐   │
│  │ 3. Create Notification             │   │
│  │    - type: VERIFICATION_UNVERIFIED │   │
│  │    - title: "Status Changed"       │   │
│  │    - message: <reason>             │   │
│  │    - link: "/profile"              │   │
│  └────────────────────────────────────┘   │
│                  │                          │
│                  ▼                          │
│  ┌────────────────────────────────────┐   │
│  │ 4. Send Email                      │   │
│  │    - to: donor.email               │   │
│  │    - subject: "Status Update"      │   │
│  │    - body: HTML template           │   │
│  └────────────────────────────────────┘   │
│                  │                          │
│                  ▼                          │
│  ┌────────────────────────────────────┐   │
│  │ 5. Return Success Response         │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
       │
       │ 5. Success Message Displayed
       ▼
┌─────────────────────┐
│  Admin Sees         │
│  Success Toast      │
└──────┬──────────────┘
       │
       │ 6. Donor List Refreshed
       ▼
┌─────────────────────┐
│  Donor Moved to     │
│  Rejected Tab       │
└─────────────────────┘

       ┌──────────────────────────────┐
       │      DONOR SIDE              │
       └──────────────────────────────┘
              │
              │ 1. Email Received
              ▼
       ┌─────────────────────┐
       │  Donor Checks Email │
       │  Sees Reason        │
       └──────┬──────────────┘
              │
              │ 2. Login to System
              ▼
       ┌─────────────────────┐
       │  Bell Icon Shows    │
       │  Unread Badge       │
       └──────┬──────────────┘
              │
              │ 3. Click Bell
              ▼
       ┌─────────────────────┐
       │  See Notification   │
       │  "Status Changed"   │
       └──────┬──────────────┘
              │
              │ 4. Click "View details"
              ▼
       ┌─────────────────────┐
       │  Navigate to        │
       │  Profile Page       │
       └──────┬──────────────┘
              │
              │ 5. See Rejection Reason
              ▼
       ┌─────────────────────┐
       │  Request            │
       │  Re-verification    │
       └─────────────────────┘
```

---

## Notification Bell Component Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  NOTIFICATION BELL COMPONENT                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Component Mount │
└────────┬─────────┘
         │
         │ useEffect with userId
         ▼
┌──────────────────────────────────┐
│  Fetch Notifications             │
│  GET /api/notifications/user/:id │
└────────┬─────────────────────────┘
         │
         │ Response: { notifications, unreadCount }
         ▼
┌──────────────────────────────────┐
│  Update State                    │
│  - setNotifications()            │
│  - setUnreadCount()              │
└────────┬─────────────────────────┘
         │
         │ Render Bell Icon
         ▼
┌──────────────────────────────────┐
│  Bell Icon with Badge            │
│  Badge shows unreadCount         │
└────────┬─────────────────────────┘
         │
         │ User clicks bell
         ▼
┌──────────────────────────────────┐
│  Popover Opens                   │
│  Show Notifications List         │
└────────┬─────────────────────────┘
         │
         ├─► User clicks "Mark read"
         │   │
         │   ├─► PATCH /api/notifications/:id/read
         │   │
         │   └─► Update local state
         │
         ├─► User clicks "Mark all read"
         │   │
         │   ├─► PATCH /api/notifications/user/:id/read-all
         │   │
         │   └─► Update all to isRead: true
         │
         ├─► User clicks "Delete"
         │   │
         │   ├─► DELETE /api/notifications/:id
         │   │
         │   └─► Remove from local state
         │
         └─► User clicks "View details"
             │
             ├─► Mark as read
             │
             └─► Navigate to link
                 │
                 └─► Close popover

┌──────────────────────────────────┐
│  Auto-Refresh (every 30s)        │
│  setInterval(fetchNotifications) │
└──────────────────────────────────┘
```

---

## Countdown Timer Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COUNTDOWN TIMER COMPONENT                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Component Mount │
└────────┬─────────┘
         │
         │ Props: lastDonationDate, donorId
         ▼
┌──────────────────────────────────┐
│  Calculate Time Remaining        │
│                                  │
│  IF no lastDonationDate:         │
│    → Show "Ready to Donate!"     │
│                                  │
│  ELSE:                           │
│    nextEligible = last + 90 days │
│    diff = nextEligible - now     │
│                                  │
│    IF diff <= 0:                 │
│      → Show "Ready to Donate!"   │
│    ELSE:                         │
│      → Calculate countdown       │
│        - days                    │
│        - hours                   │
│        - minutes                 │
│        - seconds                 │
│        - percentage (progress)   │
└────────┬─────────────────────────┘
         │
         │ Update every second
         ▼
┌──────────────────────────────────┐
│  setInterval(calculate, 1000)    │
└────────┬─────────────────────────┘
         │
         │ Render UI
         ▼
┌──────────────────────────────────┐
│  IF Eligible:                    │
│    ✅ Green header               │
│    ✅ Checkmark icon             │
│    ✅ "Ready to Donate!"         │
│    ✅ Last donation date         │
│                                  │
│  IF Waiting:                     │
│    ⏰ Red/Yellow header          │
│    ⏰ Countdown display          │
│    ⏰ Progress bar               │
│    ⏰ Last donation date         │
│    ⏰ Donor ID                   │
└──────────────────────────────────┘

Color Coding:
┌────────────────────────────────┐
│  Days Remaining  │  Color      │
├────────────────────────────────┤
│  > 7 days        │  Red        │
│  1-7 days        │  Yellow     │
│  0 days (ready)  │  Green      │
└────────────────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐
│  Notification Table              │
├──────────────────────────────────┤
│  id              String (PK)     │
│  userId          String (FK)     │
│  type            NotificationType│
│  title           String          │
│  message         String          │
│  link            String?         │
│  isRead          Boolean         │
│  createdAt       DateTime        │
└──────────────────────────────────┘
         │
         │ Foreign Key
         ▼
┌──────────────────────────────────┐
│  User Table                      │
├──────────────────────────────────┤
│  id              String (PK)     │
│  email           String          │
│  name            String          │
│  isVerified      Boolean         │
│  ...                             │
└──────────────────────────────────┘
         │
         │ One-to-One
         ▼
┌──────────────────────────────────┐
│  Donor Table                     │
├──────────────────────────────────┤
│  id              String (PK)     │
│  userId          String (FK)     │
│  verificationStatus  Enum        │
│  rejectionReason     String?     │
│  lastDonationDate    DateTime?   │
│  ...                             │
└──────────────────────────────────┘

NotificationType Enum:
┌────────────────────────────┐
│  EVENT_ALERT               │
│  BLOOD_REQUEST             │
│  VERIFICATION_APPROVED     │
│  VERIFICATION_REJECTED     │
│  VERIFICATION_UNVERIFIED   │
│  CERTIFICATE_ISSUED        │
│  DONATION_REMINDER         │
│  GENERAL                   │
└────────────────────────────┘
```

---

## API Endpoints

```
┌─────────────────────────────────────────────────────────────────────┐
│                          API ENDPOINTS                               │
└─────────────────────────────────────────────────────────────────────┘

NOTIFICATIONS
├─ GET    /api/notifications/user/:userId
│  ├─ Query: limit, unreadOnly
│  └─ Returns: { notifications[], unreadCount }
│
├─ PATCH  /api/notifications/:id/read
│  └─ Returns: { notification }
│
├─ PATCH  /api/notifications/user/:userId/read-all
│  └─ Returns: { message }
│
└─ DELETE /api/notifications/:id
   └─ Returns: { message }

DONORS
└─ PATCH  /api/donors/:id/unverify
   ├─ Body: { unverificationReason, verifiedBy }
   └─ Returns: { donor, message }
```

---

## Email Templates

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EMAIL TEMPLATES                               │
└─────────────────────────────────────────────────────────────────────┘

1. VERIFICATION APPROVED
   ┌────────────────────────────────┐
   │  ✅ Verification Successful!   │
   │                                │
   │  Congratulations!              │
   │  Your profile is approved.     │
   │                                │
   │  [Login to Your Account]       │
   └────────────────────────────────┘

2. VERIFICATION REJECTED
   ┌────────────────────────────────┐
   │  ❌ Profile Verification       │
   │                                │
   │  Reason: <rejection_reason>    │
   │                                │
   │  You can request               │
   │  re-verification.              │
   │                                │
   │  [Go to Profile]               │
   └────────────────────────────────┘

3. DONOR UNVERIFIED
   ┌────────────────────────────────┐
   │  ⚠️ Status Update              │
   │                                │
   │  Your verification status      │
   │  has been changed.             │
   │                                │
   │  Reason: <unverify_reason>     │
   │                                │
   │  [Go to Profile]               │
   └────────────────────────────────┘
```

---

## User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

DONOR REGISTRATION
│
├─► 1. Register Account
│   └─► Email verification (OTP)
│
├─► 2. Complete Donor Profile
│   └─► Status: PENDING
│
├─► 3. Wait for Admin Verification
│   └─► Admin reviews profile
│
├─► 4. Admin Decision
│   ├─► APPROVE
│   │   ├─► Email: "Verification Successful"
│   │   ├─► Notification: VERIFICATION_APPROVED
│   │   └─► Status: VERIFIED
│   │
│   ├─► REJECT
│   │   ├─► Email: "Profile Verification Update"
│   │   ├─► Notification: VERIFICATION_REJECTED
│   │   └─► Status: REJECTED
│   │
│   └─► UNVERIFY (if previously verified)
│       ├─► Email: "Status Update"
│       ├─► Notification: VERIFICATION_UNVERIFIED
│       └─► Status: REJECTED
│
├─► 5. Donor Receives Notification
│   ├─► Email in inbox
│   └─► In-app notification
│
├─► 6. Donor Logs In
│   ├─► See bell icon with badge
│   └─► Click to view notification
│
└─► 7. Donor Takes Action
    ├─► If APPROVED: Start donating
    ├─► If REJECTED: Request re-verification
    └─► If UNVERIFIED: Update profile & re-verify
```

This comprehensive flow diagram shows how all the new features work together!
