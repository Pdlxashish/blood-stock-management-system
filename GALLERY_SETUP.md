# Gallery Feature - Quick Setup Guide

## ✅ What's Been Done

1. **Database Schema** - Added `Gallery` model to Prisma schema
2. **Backend API** - Created complete CRUD API with file upload support
3. **Admin Interface** - Built comprehensive gallery management page
4. **Public Page** - Updated to fetch images from database
5. **Dependencies** - Installed required packages

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

The backend should start on `http://localhost:3001`

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:3000`

### 3. Access the Gallery Management

1. **Login as Admin**
   - Go to `http://localhost:3000/auth/login`
   - Login with admin credentials

2. **Navigate to Gallery Management**
   - Go to `http://localhost:3000/admin-public/gallery`
   - Or click "Public Dashboard" → "Image Gallery"

3. **Upload Your First Image**
   - Click "Upload Image" button
   - Select an image file
   - Enter title and description
   - Click "Upload"

4. **View on Public Page**
   - Visit `http://localhost:3000/images`
   - Your uploaded image should appear!

## 📋 Features Available

### Admin Gallery Management (`/admin-public/gallery`)

✅ **Upload Images**
- All formats: JPEG, PNG, GIF, WEBP, AVIF, SVG
- Max size: 10MB
- Add title & description
- Publish/unpublish control

✅ **Edit Images**
- Update title & description
- Replace image file
- Toggle publish status

✅ **Crop Images**
- Built-in cropping tool
- Free-form selection
- Saves cropped version

✅ **Manage Images**
- Preview in full size
- Delete images
- Quick publish/unpublish toggle
- Visual status indicators

### Public Gallery (`/images`)

✅ **Display Published Images**
- Responsive grid layout
- Smooth animations
- Image titles & descriptions
- Lazy loading

## 🔧 Configuration

### Backend Environment Variables

Make sure `backend/.env` has:

```env
DATABASE_URL="your_postgresql_connection_string"
PORT=3001
JWT_SECRET="your_jwt_secret"
```

### Frontend Environment Variables

Make sure `frontend/.env.local` has:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📁 File Storage

Images are stored in:
```
backend/uploads/gallery/
```

This directory is automatically created when you upload the first image.

## 🔐 Permissions

Only users with **ADMIN** or **STAFF** roles can:
- Upload images
- Edit images
- Delete images
- Crop images
- Toggle publish status

Public users can only view published images.

## 🧪 Testing the Feature

### Test Upload
1. Go to `/admin-public/gallery`
2. Click "Upload Image"
3. Select a test image
4. Fill in title: "Test Image"
5. Fill in description: "This is a test"
6. Check "Publish immediately"
7. Click "Upload"
8. ✅ Image should appear in the grid

### Test Public View
1. Go to `/images`
2. ✅ Your uploaded image should be visible

### Test Edit
1. Go to `/admin-public/gallery`
2. Click edit icon on an image
3. Change title to "Updated Title"
4. Click "Save Changes"
5. ✅ Title should update

### Test Crop
1. Go to `/admin-public/gallery`
2. Click crop icon on an image
3. Drag to select crop area
4. Click "Save Cropped Image"
5. ✅ Image should be cropped

### Test Unpublish
1. Go to `/admin-public/gallery`
2. Click eye-off icon on an image
3. ✅ Red "Unpublished" badge should appear
4. Go to `/images`
5. ✅ Image should not be visible

### Test Delete
1. Go to `/admin-public/gallery`
2. Click trash icon on an image
3. Confirm deletion
4. ✅ Image should be removed

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### Images not uploading
- Check backend console for errors
- Verify you're logged in as admin
- Check file size (< 10MB)
- Check file format (must be image)

### Images not showing on public page
- Verify image is published (no red badge)
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running

### CORS errors
- Backend should have CORS enabled (already configured)
- Check `backend/src/index.ts` has CORS middleware

## 📊 Database

The Gallery table structure:

```sql
Table: Gallery
- id (String, Primary Key)
- title (String, Required)
- description (String, Optional)
- imageUrl (String, Required)
- imageKey (String, Optional)
- order (Int, Default: 0)
- isPublished (Boolean, Default: true)
- createdAt (DateTime)
- updatedAt (DateTime)
```

To view data:
```bash
cd backend
npx prisma studio
```

## 🎨 Customization

### Change max file size
Edit `backend/src/controllers/galleryController.ts`:
```typescript
export const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Change to 20MB
  fileFilter: fileFilter
});
```

### Change grid columns
Edit `frontend/app/(public)/images/page.tsx`:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {/* Change md:grid-cols-3 to desired number */}
</div>
```

### Add image categories
1. Add `category` field to Gallery model in schema
2. Update API to filter by category
3. Add category selector in admin page
4. Add category filter in public page

## 📚 API Reference

### GET /api/gallery
Get all images (with optional published filter)
```
Query params: ?published=true
Response: { success: true, count: number, data: Gallery[] }
```

### GET /api/gallery/:id
Get single image
```
Response: { success: true, data: Gallery }
```

### POST /api/gallery
Create new image (Admin only)
```
Headers: Authorization: Bearer <token>
Body: FormData with 'image', 'title', 'description', 'isPublished'
Response: { success: true, message: string, data: Gallery }
```

### PUT /api/gallery/:id
Update image (Admin only)
```
Headers: Authorization: Bearer <token>
Body: FormData with optional 'image', 'title', 'description', 'isPublished'
Response: { success: true, message: string, data: Gallery }
```

### DELETE /api/gallery/:id
Delete image (Admin only)
```
Headers: Authorization: Bearer <token>
Response: { success: true, message: string }
```

## ✨ Next Steps

Now that the gallery is set up, you can:

1. **Upload real images** - Replace test images with actual photos
2. **Organize content** - Add meaningful titles and descriptions
3. **Customize styling** - Adjust colors, spacing, animations
4. **Add features** - Implement categories, tags, search
5. **Optimize images** - Add image compression/optimization
6. **Cloud storage** - Integrate AWS S3 or Cloudinary

## 🎉 You're All Set!

The gallery feature is fully functional and ready to use. Start uploading images and they'll automatically appear on the public gallery page!

For detailed documentation, see `GALLERY_FEATURE.md`.
