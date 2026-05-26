# 🎨 Gallery Management System - Complete Guide

## 📖 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Documentation](#documentation)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [FAQs](#faqs)

---

## 🎯 Overview

The Gallery Management System allows administrators to manage images that are displayed on the public gallery page. It provides a complete solution for uploading, editing, cropping, and organizing images with an intuitive admin interface.

### Key Capabilities

- ✅ **Upload** images in any format (JPEG, PNG, GIF, WEBP, AVIF, SVG)
- ✅ **Edit** image titles, descriptions, and replace images
- ✅ **Crop** images with a built-in cropping tool
- ✅ **Delete** images from both database and filesystem
- ✅ **Publish/Unpublish** control for visibility
- ✅ **Responsive** design for all devices

---

## 🌟 Features

### Admin Features (`/admin-public/gallery`)

| Feature | Description | Status |
|---------|-------------|--------|
| **Upload** | Upload images with title & description | ✅ |
| **Edit** | Modify image details and replace files | ✅ |
| **Crop** | Built-in image cropping tool | ✅ |
| **Delete** | Remove images completely | ✅ |
| **Publish Control** | Show/hide images on public page | ✅ |
| **Preview** | View images in full size | ✅ |
| **Responsive** | Works on all screen sizes | ✅ |

### Public Features (`/images`)

| Feature | Description | Status |
|---------|-------------|--------|
| **Display** | Show all published images | ✅ |
| **Grid Layout** | Responsive 1/2/3 column grid | ✅ |
| **Animations** | Smooth hover effects | ✅ |
| **Lazy Loading** | Optimized image loading | ✅ |
| **Fallback** | Placeholder for broken images | ✅ |

---

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- PostgreSQL database running
- Backend and frontend servers configured

### Step 1: Start Backend

```bash
cd backend
npm run dev
```

Server starts at: `http://localhost:3001`

### Step 2: Start Frontend

```bash
cd frontend
npm run dev
```

Server starts at: `http://localhost:3000`

### Step 3: Access Gallery Management

1. Login as admin at `http://localhost:3000/auth/login`
2. Navigate to `http://localhost:3000/admin-public/gallery`
3. Click "Upload Image" to add your first image

### Step 4: View Public Gallery

Visit `http://localhost:3000/images` to see published images

---

## 📚 Documentation

### Complete Documentation Files

| File | Description | Use Case |
|------|-------------|----------|
| **GALLERY_SUMMARY.md** | Complete implementation overview | Understanding what was built |
| **GALLERY_SETUP.md** | Detailed setup instructions | Initial setup and configuration |
| **GALLERY_FEATURE.md** | Feature documentation | Learning all features |
| **GALLERY_QUICK_REFERENCE.md** | Quick reference card | Daily usage reference |
| **GALLERY_ARCHITECTURE.md** | System architecture | Understanding the system |
| **README_GALLERY.md** | This file | Complete guide |

### Quick Links

- 📋 [Quick Reference](GALLERY_QUICK_REFERENCE.md) - For daily use
- 🔧 [Setup Guide](GALLERY_SETUP.md) - For initial setup
- 📖 [Feature Details](GALLERY_FEATURE.md) - For learning features
- 🏗️ [Architecture](GALLERY_ARCHITECTURE.md) - For understanding system

---

## 📖 Usage Guide

### For Administrators

#### 1. Upload New Image

**Steps:**
1. Go to `/admin-public/gallery`
2. Click **"Upload Image"** button
3. Click **"Choose File"** and select an image
4. Enter **title** (required)
5. Enter **description** (optional)
6. Check **"Publish immediately"** if you want it visible
7. Click **"Upload"**

**Supported Formats:**
- JPEG / JPG
- PNG
- GIF
- WEBP
- AVIF
- SVG

**Limits:**
- Max file size: 10MB
- Title: Required
- Description: Optional

#### 2. Edit Image

**Steps:**
1. Find the image in the grid
2. Click the **pencil icon** (Edit)
3. Update title, description, or select new image
4. Toggle publish status if needed
5. Click **"Save Changes"**

**What You Can Edit:**
- ✅ Title
- ✅ Description
- ✅ Replace image file
- ✅ Publish status

#### 3. Crop Image

**Steps:**
1. Find the image in the grid
2. Click the **crop icon**
3. Drag to select the area you want to keep
4. Adjust the selection as needed
5. Click **"Save Cropped Image"**

**Notes:**
- Free-form cropping (no aspect ratio constraint)
- Original image is replaced with cropped version
- Cannot undo after saving

#### 4. Toggle Publish Status

**Steps:**
1. Find the image in the grid
2. Click the **eye icon** (to unpublish) or **eye-off icon** (to publish)
3. Status updates immediately

**Visual Indicators:**
- Published: No badge
- Unpublished: Red "Unpublished" badge

#### 5. Preview Image

**Steps:**
1. Find the image in the grid
2. Click the **eye icon** in the action buttons
3. View full-size image with details
4. Click outside or close button to exit

#### 6. Delete Image

**Steps:**
1. Find the image in the grid
2. Click the **trash icon**
3. Confirm deletion in the popup
4. Image is removed from database and filesystem

**Warning:** This action cannot be undone!

### For Public Users

#### View Gallery

**Steps:**
1. Visit `http://localhost:3000/images`
2. Browse through all published images
3. Hover over images for zoom effect
4. View titles and descriptions

**Features:**
- Responsive grid layout
- Smooth animations
- Lazy loading
- Fallback for broken images

---

## 🔌 API Reference

### Public Endpoints

#### Get All Images

```http
GET /api/gallery
```

**Query Parameters:**
- `published` (optional): Filter by publish status
  - Example: `/api/gallery?published=true`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "clx123...",
      "title": "Blood Donation Drive",
      "description": "Community event",
      "imageUrl": "/uploads/gallery/gallery-123.jpg",
      "order": 0,
      "isPublished": true,
      "createdAt": "2026-05-26T10:00:00Z",
      "updatedAt": "2026-05-26T10:00:00Z"
    }
  ]
}
```

#### Get Single Image

```http
GET /api/gallery/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "title": "Blood Donation Drive",
    "description": "Community event",
    "imageUrl": "/uploads/gallery/gallery-123.jpg",
    "order": 0,
    "isPublished": true,
    "createdAt": "2026-05-26T10:00:00Z",
    "updatedAt": "2026-05-26T10:00:00Z"
  }
}
```

### Protected Endpoints (Admin/Staff Only)

#### Upload Image

```http
POST /api/gallery
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
- `image` (file, required): Image file
- `title` (string, required): Image title
- `description` (string, optional): Image description
- `isPublished` (boolean, optional): Publish status

**Response:**
```json
{
  "success": true,
  "message": "Gallery image created successfully",
  "data": { ... }
}
```

#### Update Image

```http
PUT /api/gallery/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
- `image` (file, optional): New image file
- `title` (string, optional): New title
- `description` (string, optional): New description
- `isPublished` (boolean, optional): New publish status

**Response:**
```json
{
  "success": true,
  "message": "Gallery image updated successfully",
  "data": { ... }
}
```

#### Delete Image

```http
DELETE /api/gallery/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Gallery image deleted successfully"
}
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: Images not uploading

**Possible Causes:**
- File size too large (> 10MB)
- Invalid file format
- Not logged in as admin
- Backend server not running

**Solutions:**
1. Check file size: `ls -lh image.jpg` (should be < 10MB)
2. Verify file format is supported
3. Confirm you're logged in with admin role
4. Check backend is running: `curl http://localhost:3001/health`

#### Issue: Images not showing on public page

**Possible Causes:**
- Image is unpublished
- Backend server not running
- Wrong API URL in frontend
- CORS issues

**Solutions:**
1. Check image has no "Unpublished" badge in admin
2. Verify backend is running on port 3001
3. Check `NEXT_PUBLIC_API_URL` in `.env.local`
4. Check browser console for CORS errors

#### Issue: Upload fails with error

**Possible Causes:**
- Missing authentication token
- Invalid file type
- Server error

**Solutions:**
1. Check browser console for error message
2. Verify you're logged in
3. Check backend logs for detailed error
4. Try a different image file

#### Issue: Crop not working

**Possible Causes:**
- No crop area selected
- Browser compatibility
- JavaScript error

**Solutions:**
1. Ensure you've dragged to select a crop area
2. Try a different browser (Chrome recommended)
3. Check browser console for errors
4. Refresh page and try again

#### Issue: Delete not working

**Possible Causes:**
- Missing permissions
- File system permissions
- Database error

**Solutions:**
1. Verify you have admin role
2. Check backend has write permissions to uploads folder
3. Check backend logs for errors

---

## ❓ FAQs

### General Questions

**Q: What image formats are supported?**
A: JPEG, JPG, PNG, GIF, WEBP, AVIF, and SVG.

**Q: What's the maximum file size?**
A: 10MB per image.

**Q: Can I upload multiple images at once?**
A: Not currently. Upload one image at a time.

**Q: Where are images stored?**
A: In `backend/uploads/gallery/` directory.

**Q: Can I organize images into categories?**
A: Not in the current version. This is a potential future enhancement.

### Admin Questions

**Q: How do I hide an image from the public page?**
A: Click the eye-off icon to unpublish it.

**Q: Can I undo a crop?**
A: No, cropping replaces the original. Make a backup before cropping if needed.

**Q: Can I reorder images?**
A: Not in the UI currently, but the API supports it via the `order` field.

**Q: What happens when I delete an image?**
A: It's removed from both the database and filesystem permanently.

### Public User Questions

**Q: Why can't I see all images?**
A: Only published images are visible on the public page.

**Q: Can I download images?**
A: Right-click and "Save image as..." works for most browsers.

**Q: Why do some images load slowly?**
A: Large images may take time. Lazy loading helps optimize performance.

### Technical Questions

**Q: Can I use cloud storage instead of local storage?**
A: Yes, but you'll need to modify the controller to integrate with AWS S3, Cloudinary, etc.

**Q: How do I backup images?**
A: Copy the `backend/uploads/gallery/` directory and export the Gallery table from the database.

**Q: Can I customize the grid layout?**
A: Yes, edit the grid classes in the page components.

**Q: Is there an API rate limit?**
A: No rate limiting is currently implemented.

---

## 🔐 Security

### Authentication & Authorization

- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin/Staff only)
- ✅ Protected API endpoints

### File Security

- ✅ File type validation
- ✅ File size limits
- ✅ Secure filename generation
- ✅ Isolated storage directory

### Data Security

- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping)
- ✅ CORS configuration
- ✅ Input validation

---

## 📊 Database Schema

```sql
CREATE TABLE "Gallery" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT NOT NULL,
  "imageKey" TEXT,
  "order" INTEGER DEFAULT 0,
  "isPublished" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Gallery_isPublished_idx" ON "Gallery"("isPublished");
CREATE INDEX "Gallery_order_idx" ON "Gallery"("order");
```

---

## 🎨 Customization

### Change Max File Size

Edit `backend/src/controllers/galleryController.ts`:

```typescript
export const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter
});
```

### Change Grid Columns

Edit `frontend/app/(public)/images/page.tsx`:

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
```

### Add Image Categories

1. Add `category` field to Gallery model
2. Update API to filter by category
3. Add category selector in admin page
4. Add category filter in public page

---

## 🚀 Future Enhancements

Potential features for future versions:

- [ ] Drag-and-drop reordering
- [ ] Bulk upload
- [ ] Image optimization/compression
- [ ] Cloud storage integration
- [ ] Categories and tags
- [ ] Search and filter
- [ ] Image analytics
- [ ] Watermark support
- [ ] Multiple image sizes
- [ ] Gallery themes

---

## 📞 Support

### Getting Help

1. **Check Documentation**: Review the documentation files
2. **Check Logs**: Look at backend and frontend logs
3. **Browser Console**: Check for JavaScript errors
4. **Database**: Use Prisma Studio to inspect data

### Useful Commands

```bash
# View backend logs
cd backend
npm run dev

# View database
cd backend
npx prisma studio

# Check API health
curl http://localhost:3001/health

# Check gallery API
curl http://localhost:3001/api/gallery
```

---

## ✅ Checklist

### Initial Setup
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Admin account created

### First Upload
- [ ] Login as admin
- [ ] Navigate to gallery management
- [ ] Upload test image
- [ ] Verify image appears in grid
- [ ] Check public page shows image

### Feature Testing
- [ ] Upload works
- [ ] Edit works
- [ ] Crop works
- [ ] Delete works
- [ ] Publish toggle works
- [ ] Public page displays correctly

---

## 🎉 Conclusion

You now have a fully functional gallery management system! Start uploading images and they'll automatically appear on your public gallery page.

For more details, check the other documentation files:
- [Quick Reference](GALLERY_QUICK_REFERENCE.md)
- [Setup Guide](GALLERY_SETUP.md)
- [Feature Details](GALLERY_FEATURE.md)
- [Architecture](GALLERY_ARCHITECTURE.md)

Happy managing! 🎨📸
