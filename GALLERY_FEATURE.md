# Gallery Management Feature

## Overview
A comprehensive image gallery management system that allows administrators to manage images displayed on the public gallery page (`http://localhost:3000/images`).

## Features

### Admin Gallery Management (`http://localhost:3000/admin-public/gallery`)

#### 1. **Image Upload**
- Support for all common image formats: JPEG, JPG, PNG, GIF, WEBP, AVIF, SVG
- Maximum file size: 10MB
- Required fields:
  - Title (required)
  - Description (optional)
  - Publish status (checkbox)

#### 2. **Image Editing**
- Edit image title and description
- Replace existing image with a new one
- Toggle publish/unpublish status
- All changes are saved to the database

#### 3. **Image Cropping**
- Built-in image cropping tool using `react-image-crop`
- Free-form cropping (no aspect ratio constraint)
- Saves cropped version directly to the server
- Replaces the original image

#### 4. **Image Management**
- View all uploaded images in a grid layout
- Preview images in full size
- Delete images (removes from database and filesystem)
- Toggle publish/unpublish status with one click
- Visual indicator for unpublished images

#### 5. **Publish Control**
- Published images appear on the public gallery page
- Unpublished images are hidden from public view
- Easy toggle between published/unpublished states

### Public Gallery Page (`http://localhost:3000/images`)
- Displays only published images
- Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Smooth hover effects and transitions
- Lazy loading for better performance
- Fallback placeholder for broken images
- Shows image title and description

## Technical Implementation

### Backend

#### Database Schema
```prisma
model Gallery {
  id          String   @id @default(cuid())
  title       String
  description String?
  imageUrl    String
  imageKey    String?  // For cloud storage reference
  order       Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isPublished])
  @@index([order])
}
```

#### API Endpoints

**Public Endpoints:**
- `GET /api/gallery` - Get all gallery images (with optional `?published=true` filter)
- `GET /api/gallery/:id` - Get single gallery image

**Protected Endpoints (Admin/Staff only):**
- `POST /api/gallery` - Create new gallery image (with file upload)
- `PUT /api/gallery/:id` - Update gallery image (with optional file upload)
- `DELETE /api/gallery/:id` - Delete gallery image
- `PUT /api/gallery/reorder` - Reorder gallery images

#### File Storage
- Images are stored in `backend/uploads/gallery/`
- Unique filenames generated using timestamp + random number
- Old images are automatically deleted when replaced or removed

#### Dependencies
- `multer` - File upload handling
- `@types/multer` - TypeScript definitions

### Frontend

#### Admin Page Features
- Image upload with preview
- Inline editing with modal dialogs
- Image cropping with `react-image-crop`
- Real-time publish/unpublish toggle
- Responsive grid layout
- Loading states and error handling

#### Public Page Features
- Fetches only published images from API
- Responsive design
- Loading spinner during data fetch
- Error handling with fallback images

#### Dependencies
- `react-image-crop` - Image cropping functionality
- `axios` - API requests
- `sonner` - Toast notifications
- `lucide-react` - Icons

## Usage

### For Administrators

1. **Navigate to Gallery Management**
   - Go to `http://localhost:3000/admin-public`
   - Click on "Image Gallery" card
   - Or directly visit `http://localhost:3000/admin-public/gallery`

2. **Upload New Image**
   - Click "Upload Image" button
   - Select an image file (max 10MB)
   - Enter title (required)
   - Enter description (optional)
   - Check "Publish immediately" if you want it visible on public page
   - Click "Upload"

3. **Edit Image**
   - Click the edit icon (pencil) on any image card
   - Update title, description, or replace the image
   - Toggle publish status
   - Click "Save Changes"

4. **Crop Image**
   - Click the crop icon on any image card
   - Drag to select the area you want to keep
   - Click "Save Cropped Image"
   - The original image will be replaced with the cropped version

5. **Toggle Publish Status**
   - Click the eye/eye-off icon to quickly publish/unpublish
   - Unpublished images show a red "Unpublished" badge

6. **Delete Image**
   - Click the trash icon on any image card
   - Confirm deletion
   - Image is removed from database and filesystem

### For Public Users

1. **View Gallery**
   - Visit `http://localhost:3000/images`
   - Browse through all published images
   - Images are displayed in a responsive grid
   - Hover over images for smooth zoom effect

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── galleryController.ts      # Gallery CRUD operations
│   ├── routes/
│   │   └── galleryRoutes.ts          # Gallery API routes
│   └── index.ts                       # Added gallery routes
├── uploads/
│   └── gallery/                       # Image storage directory
└── prisma/
    └── schema.prisma                  # Added Gallery model

frontend/
├── app/
│   ├── (public)/
│   │   └── images/
│   │       └── page.tsx               # Public gallery page
│   └── admin-public/
│       └── gallery/
│           └── page.tsx               # Admin gallery management
└── package.json                       # Added react-image-crop
```

## Environment Variables

Make sure your `.env` files are configured:

**Backend (`backend/.env`):**
```env
DATABASE_URL="your_database_url"
PORT=3001
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Security

- Only authenticated users with ADMIN or STAFF roles can manage gallery
- File type validation (only images allowed)
- File size limit (10MB max)
- Automatic cleanup of old files when replaced or deleted
- SQL injection protection via Prisma ORM
- XSS protection via React's built-in escaping

## Future Enhancements

Potential improvements for future versions:
- Drag-and-drop reordering of images
- Bulk upload functionality
- Image optimization/compression
- Cloud storage integration (AWS S3, Cloudinary)
- Image categories/tags
- Search and filter functionality
- Image analytics (views, downloads)
- Watermark support
- Multiple image sizes/thumbnails

## Troubleshooting

### Images not displaying
- Check if backend server is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure images are published (isPublished = true)

### Upload failing
- Check file size (must be < 10MB)
- Verify file format is supported
- Check backend logs for errors
- Ensure `uploads/gallery` directory exists and is writable

### Crop not working
- Ensure you've selected a crop area before saving
- Check browser console for errors
- Try refreshing the page and cropping again

## Support

For issues or questions, please check:
1. Backend logs: `npm run dev` in backend directory
2. Frontend console: Browser DevTools
3. Database: Verify Gallery table exists and has correct schema
