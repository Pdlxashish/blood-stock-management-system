# Profile Enhancement Implementation Plan

## Overview
Enhance the donor profile system with modern UI, profile picture upload, and real-time sync across admin and public dashboards.

## Tasks

### 1. Update PublicNav Dropdown Design ✓
- Match the dark theme design from the image
- Add "Donor Home" menu item
- Add "View Profile" menu item with proper routing
- Add "Settings" menu item (future)
- Style with dark background and proper spacing

### 2. Profile Page Refurbishment
- Modern card-based layout with profile picture
- Editable fields: name, email, phone, profile picture
- Upload profile picture with preview
- Save changes with API integration
- Real-time validation

### 3. Backend API Updates
- Add profile picture upload endpoint
- Update user profile endpoint to handle picture
- Store profile picture URL in database
- Add image upload to cloud storage (or local)

### 4. Database Schema Update
- Add `profilePicture` field to User model
- Migration for existing users

### 5. Sync Across Dashboards
- Update localStorage on profile changes
- Refresh user data in all components
- Update avatar displays in:
  - PublicNav
  - DashboardNav
  - PublicDashboardNav
  - Profile cards

### 6. Login Redirect
- After successful login, redirect DONOR role to `/home`
- Keep ADMIN/STAFF redirect to `/dashboard`

## Implementation Order
1. Login redirect fix (quick win)
2. PublicNav dropdown redesign
3. Database schema update
4. Backend API for profile updates
5. Profile page refurbishment
6. Profile picture upload
7. Cross-dashboard sync

## Files to Modify
- `frontend/components/PublicNav.tsx`
- `frontend/app/(public)/login/page.tsx`
- `frontend/app/(public)/profile/page.tsx`
- `backend/prisma/schema.prisma`
- `backend/src/controllers/authController.ts`
- `backend/src/routes/authRoutes.ts`
- `frontend/components/DashboardNav.tsx`
- `frontend/components/PublicDashboardNav.tsx`
