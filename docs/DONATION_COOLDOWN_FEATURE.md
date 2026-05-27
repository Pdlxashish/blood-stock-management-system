# 90-Day Donation Cooldown Feature - Implementation Guide

## ✅ Feature Complete

This document describes the complete implementation of the 90-day blood donation waiting period feature.

---

## 🎯 Feature Overview

When an individual person donates blood, they cannot donate again for **90 days** from their last donation date. The system enforces this rule and displays clear warnings to both donors and administrators.

---

## 🔒 How It Works

### 1. **When Blood is Donated (Admin Records Donation)**

**Location:** `/dashboard/blood-donate/blood-collection`

**Flow:**
1. Admin searches for existing donor by name/phone/email
2. Admin selects the donor from search results
3. **System automatically checks 90-day eligibility**
4. If donor is **ineligible** (within 90 days):
   - ⚠️ **Large red warning banner appears** showing:
     - "Donor Not Eligible" message
     - Last donation date
     - Next eligible date (90 days from last donation)
     - Days remaining countdown
     - Warning that system will block submission
   - 🚫 **Submit button is disabled**
   - Button text changes to show days remaining

5. If donor is **eligible** (90+ days passed):
   - ✅ **Green confirmation banner appears**
   - Shows last donation date
   - Submit button is enabled
   - Donation can proceed

6. Backend validation:
   - Even if frontend is bypassed, backend will reject the donation
   - Returns error: "You are not eligible to donate yet. You can donate again in X day(s) on [date]."

---

## 📱 User Experience (Donor Dashboard)

### Donor Home Page (`/home`)
- Countdown banner appears below welcome message
- Shows days remaining until next eligible donation
- Progress bar visualizes cooldown period
- Updates automatically every minute

### Donor Profile Page (`/profile`)
- Same countdown banner at top of profile
- Only visible to DONOR role users
- Real-time countdown

---

## 🖥️ Admin Experience (Blood Collection Form)

### Before Selecting Donor
```
┌─────────────────────────────────────────┐
│ 🔍 Search Existing Donor                │
│ [Search by name, phone, or email...]    │
│ [Search Button]                          │
└─────────────────────────────────────────┘
```

### After Selecting INELIGIBLE Donor
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Donor Information    ✓ Existing Donor Selected      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ ⚠️ Donor Not Eligible                            │ │
│ │                                                      │ │
│ │ This donor has already donated blood recently and   │ │
│ │ must wait 90 days between donations.                │ │
│ │                                                      │ │
│ │ 📅 Last Donation: November 15, 2026                 │ │
│ │ 📅 Next Eligible Date: February 13, 2027            │ │
│ │                                                      │ │
│ │ ⚠️  45 days remaining                                │ │
│ │                                                      │ │
│ │ ⛔ The system will block this donation if you       │ │
│ │    attempt to submit.                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Donor Name: John Doe]                                  │
│ [Phone: 9876543210]                                     │
│ [Blood Group: A+]                                       │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘

[🚫 Donor Not Eligible (45 days remaining)] ← DISABLED BUTTON
[Cancel]
```

### After Selecting ELIGIBLE Donor
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Donor Information    ✓ Existing Donor Selected      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Donor is Eligible                                 │ │
│ │ Last donation: August 1, 2026 — More than 90 days   │ │
│ │ have passed.                                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Donor Name: Jane Smith]                                │
│ [Phone: 9876543211]                                     │
│ [Blood Group: B+]                                       │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘

[Record Donation] ← ENABLED BUTTON
[Cancel]
```

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. **New Endpoint: Check Eligibility**
```
GET /api/donors/eligibility/:userId
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "isEligible": false,
    "lastDonationDate": "2026-11-15T00:00:00.000Z",
    "nextEligibleDate": "2027-02-13T00:00:00.000Z",
    "daysRemaining": 45
  }
}
```

#### 2. **Donation Validation**
- `createDonation()` - Blocks donations within 90 days
- `recordBloodCollection()` - Enforces cooldown in transaction
- Organizations exempt (only PERSON donors restricted)

**Files Modified:**
- `backend/src/controllers/donorController.ts`
- `backend/src/controllers/donationController.ts`
- `backend/src/routes/donorRoutes.ts`

### Frontend Changes

#### 1. **Blood Collection Form Enhancement**
**File:** `frontend/app/(admin)/dashboard/blood-donate/blood-collection/page.tsx`

**New Features:**
- Imports `useDonorEligibility` hook
- Tracks selected donor's userId
- Fetches eligibility when donor is selected
- Shows warning banner if ineligible
- Shows confirmation banner if eligible
- Disables submit button when ineligible
- Updates button text to show days remaining

#### 2. **Donor Dashboard Components**
**Files:**
- `frontend/components/DonationCooldownBanner.tsx` (NEW)
- `frontend/app/(public)/home/page.tsx`
- `frontend/app/(public)/profile/page.tsx`

**Features:**
- Live countdown (updates every minute)
- Progress bar visualization
- Green/red color coding
- Responsive design

#### 3. **API Integration**
**Files:**
- `frontend/lib/queries/donors.ts` - Added `useDonorEligibility` hook
- `frontend/lib/apiPaths.ts` - Added eligibility endpoint path

---

## 📊 Database Schema

**Existing fields used (no migration needed):**

```prisma
model Donor {
  lastDonationDate DateTime?  // Tracks last donation
  isEligible       Boolean @default(true) // Auto-updated
  donorType        DonationType // PERSON or ORGANIZATION
}

model Donation {
  donationDate DateTime @default(now()) // Timestamp of donation
  userId       String // Links to user account
  donorId      String? // Links to donor profile
}
```

---

## 🧪 Testing Scenarios

### Test 1: Eligible Donor
1. Login as admin
2. Go to `/dashboard/blood-donate/blood-collection`
3. Search for donor who donated 90+ days ago
4. Select donor
5. ✅ Green banner appears: "Donor is Eligible"
6. Submit button is enabled
7. Can record donation successfully

### Test 2: Ineligible Donor (Within 90 Days)
1. Login as admin
2. Go to `/dashboard/blood-donate/blood-collection`
3. Search for donor who donated recently (< 90 days)
4. Select donor
5. ⚠️ Red warning banner appears with:
   - Last donation date
   - Next eligible date
   - Days remaining countdown
6. 🚫 Submit button is disabled
7. Cannot submit donation

### Test 3: Backend Validation
1. Try to bypass frontend validation (e.g., API call directly)
2. Backend rejects with error message
3. Error shows days remaining and next eligible date

### Test 4: Donor Dashboard View
1. Login as donor who donated recently
2. Go to `/home` or `/profile`
3. See countdown banner with days remaining
4. Wait 1 minute → countdown updates automatically
5. Progress bar shows visual progress

### Test 5: Organization Donor (Exempt)
1. Record bulk collection from organization
2. Organization can donate again immediately
3. No 90-day restriction applies

---

## 🎨 Visual Design

### Warning Banner (Ineligible)
- **Color:** Red (#FEE2E2 background, #DC2626 border)
- **Icon:** AlertCircle (red)
- **Size:** Large, prominent
- **Content:**
  - Bold title: "⚠️ Donor Not Eligible"
  - Explanation text
  - Last donation date with calendar icon
  - Next eligible date with calendar icon
  - Days remaining in highlighted box
  - Warning about system blocking

### Confirmation Banner (Eligible)
- **Color:** Green (#D1FAE5 background, #10B981 border)
- **Icon:** CheckCircle (green)
- **Size:** Compact
- **Content:**
  - "✓ Donor is Eligible"
  - Last donation date
  - "More than 90 days have passed"

### Countdown Banner (Donor Dashboard)
- **Ineligible:** Red theme with progress bar
- **Eligible:** Green theme, simple message
- **Updates:** Every 60 seconds automatically
- **Responsive:** Works on mobile and desktop

---

## 🚀 Deployment Status

✅ **Backend:** Fully implemented and running
✅ **Frontend:** Fully implemented and running
✅ **Database:** No migration needed (uses existing schema)
✅ **Testing:** Ready for testing

**Servers Running:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/dashboard`

---

## 📝 Key Features Summary

1. ✅ **90-day donation lock** - Enforced at backend level
2. ✅ **Proactive warning** - Shows before admin attempts submission
3. ✅ **Clear messaging** - Last donation date + next eligible date
4. ✅ **Days countdown** - Real-time countdown display
5. ✅ **Submit prevention** - Button disabled when ineligible
6. ✅ **Donor dashboard** - Countdown visible to donors
7. ✅ **Organization exempt** - Only individual donors restricted
8. ✅ **Backend validation** - Cannot bypass frontend checks
9. ✅ **Auto-sync** - Eligibility status updates automatically
10. ✅ **User-friendly** - Clear visual indicators (red/green)

---

## 🎯 Business Rules

- **Individual donors (PERSON):** Must wait 90 days between donations
- **Organizations:** No restriction (can donate anytime)
- **Walk-in donors:** Subject to 90-day rule if phone number matches existing donor
- **New donors:** No restriction on first donation
- **Calculation:** 90 days = exactly 90 calendar days from last donation date
- **Eligibility check:** Runs automatically when donor is selected
- **Real-time updates:** Countdown refreshes every minute

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs for validation errors
3. Verify donor has `lastDonationDate` in database
4. Confirm donor `donorType` is 'PERSON' (not 'ORGANIZATION')
5. Test with different donors (eligible vs ineligible)

---

**Implementation Date:** May 25, 2026
**Status:** ✅ Complete and Ready for Production
