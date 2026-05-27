# Profile Enhancement - Implementation Status

## ✅ Completed

### 1. PublicNav Dropdown Redesign
**File:** `frontend/components/PublicNav.tsx`

**Changes:**
- Redesigned dropdown with dark gradient background (gray-900 to gray-800)
- Added large circular profile picture (80x80px) at the top
- Centered profile section with name, email, and "View Profile" button
- Menu items with proper spacing and hover effects:
  - "Donor Home" (for DONOR role)
  - "Admin Dashboard" (for ADMIN/STAFF roles)
  - "View Profile"
- Styled logout button in red
- Matches the design from the provided image

**Features:**
- Dark theme with gradient background
- Large profile avatar
- Clean separation between sections
- Proper hover states
- Role-based menu items

### 2. Login Redirect
**Status:** Already correctly implemented in `frontend/app/(public)/login/page.tsx`

**Logic:**
- Unverified DONOR → `/donor-form`
- Verified DONOR → `/home` ✓
- ADMIN/STAFF → `/dashboard` ✓

## 🚧 Remaining Tasks

### 3. Profile Page Refurbishment
**File:** `frontend/app/(public)/profile/page.tsx`

**TODO:**
- [ ] Add modern card-based layout
- [ ] Add profile picture upload component
- [ ] Make fields editable (name, email, phone)
- [ ] Add save/cancel buttons
- [ ] Add image preview before upload
- [ ] Add validation for form fields
- [ ] Style to match modern design standards

### 4. Backend - Profile Picture Upload
**Files to create/modify:**
- `backend/src/controllers/authController.ts` - Add updateProfilePicture endpoint
- `backend/src/routes/authRoutes.ts` - Add route for profile picture
- `backend/prisma/schema.prisma` - Add profilePicture field to User model

**TODO:**
- [ ] Add `profilePicture` field to User model (String, optional)
- [ ] Create migration for database
- [ ] Add multer middleware for file uploads
- [ ] Add endpoint: `PATCH /api/auth/profile/picture`
- [ ] Add endpoint: `PATCH /api/auth/profile` (update name, phone)
- [ ] Store uploaded images in `public/uploads/profiles/`
- [ ] Return image URL in response

### 5. Cross-Dashboard Sync
**Files to update:**
- `frontend/components/DashboardNav.tsx`
- `frontend/components/PublicDashboardNav.tsx`
- `frontend/app/(public)/home/page.tsx`

**TODO:**
- [ ] Update all avatar displays to use profilePicture URL
- [ ] Add fallback to initials if no picture
- [ ] Refresh user data after profile update
- [ ] Update localStorage after changes
- [ ] Add real-time sync mechanism (optional)

## 📋 Implementation Guide for Remaining Tasks

### Step 1: Database Schema Update
```prisma
model User {
  // ... existing fields
  profilePicture String?  // Add this field
}
```

Run migration:
```bash
cd backend
npx prisma migrate dev --name add_profile_picture
npx prisma generate
```

### Step 2: Backend API Endpoints

**Update Profile:**
```typescript
// PATCH /api/auth/profile
{
  name?: string;
  phone?: string;
}
```

**Upload Profile Picture:**
```typescript
// PATCH /api/auth/profile/picture
// multipart/form-data with 'profilePicture' field
```

### Step 3: Frontend Profile Page

**Components needed:**
- Profile picture upload with preview
- Editable form fields
- Save/Cancel buttons
- Loading states
- Success/Error toasts

### Step 4: Update All Avatar Components

**Replace:**
```tsx
<div className="w-8 h-8 bg-red-800 rounded-full">
  <span>{user.name.charAt(0)}</span>
</div>
```

**With:**
```tsx
{user.profilePicture ? (
  <img src={user.profilePicture} className="w-8 h-8 rounded-full object-cover" />
) : (
  <div className="w-8 h-8 bg-red-800 rounded-full">
    <span>{user.name.charAt(0)}</span>
  </div>
)}
```

## 🎨 Design Notes

### Profile Page Design Goals
- Modern, clean card-based layout
- Large profile picture with upload button overlay
- Editable fields with inline editing or modal
- Responsive design
- Smooth animations
- Clear visual feedback for actions

### Color Scheme
- Primary: Red-800 (#991b1b)
- Dark backgrounds: Gray-900 to Gray-800 gradient
- Text: White on dark, Gray-900 on light
- Accents: Red-400 for errors, Green-600 for success

## 🔗 Related Files
- `frontend/lib/auth.ts` - Auth utilities
- `frontend/lib/axiosInstance.ts` - API client
- `backend/src/middleware/authMiddleware.ts` - Auth middleware
- `backend/src/middleware/upload.ts` - File upload middleware (to be created)

## 📝 Notes
- Profile pictures should be optimized (max 2MB, 500x500px recommended)
- Use proper image validation (JPEG, PNG only)
- Add rate limiting for upload endpoint
- Consider using cloud storage (AWS S3, Cloudinary) for production
- Add image compression on upload
