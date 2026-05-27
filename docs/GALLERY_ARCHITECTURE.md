# 🏗️ Gallery System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GALLERY MANAGEMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   PUBLIC USERS       │         │   ADMIN USERS        │
│                      │         │                      │
│  View Gallery        │         │  Manage Gallery      │
│  /images             │         │  /admin-public/      │
│                      │         │  gallery             │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                │
           │                                │
           ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│                     http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  Public Gallery    │         │  Admin Gallery     │         │
│  │  Page              │         │  Management        │         │
│  │                    │         │                    │         │
│  │  - Display images  │         │  - Upload images   │         │
│  │  - Grid layout     │         │  - Edit images     │         │
│  │  - Responsive      │         │  - Crop images     │         │
│  │                    │         │  - Delete images   │         │
│  └────────┬───────────┘         └────────┬───────────┘         │
│           │                              │                      │
└───────────┼──────────────────────────────┼──────────────────────┘
            │                              │
            │    HTTP Requests (axios)     │
            │                              │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express)                       │
│                     http://localhost:3001                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Gallery Routes                         │  │
│  │                  /api/gallery/*                           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │              Gallery Controller                           │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Upload     │  │    Edit      │  │   Delete     │   │  │
│  │  │   Handler    │  │   Handler    │  │   Handler    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Multer     │  │  Validation  │  │  File Mgmt   │   │  │
│  │  │  Middleware  │  │   Logic      │  │   Logic      │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│                      via Prisma ORM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    Gallery Table                        │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  id              String (PK)                            │    │
│  │  title           String                                 │    │
│  │  description     String?                                │    │
│  │  imageUrl        String                                 │    │
│  │  imageKey        String?                                │    │
│  │  order           Int                                    │    │
│  │  isPublished     Boolean                                │    │
│  │  createdAt       DateTime                               │    │
│  │  updatedAt       DateTime                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FILE STORAGE (Local)                          │
│                backend/uploads/gallery/                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  gallery-1234567890-123456789.jpg                               │
│  gallery-1234567891-987654321.png                               │
│  gallery-1234567892-456789123.webp                              │
│  ...                                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Image Upload Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │ 1. Select image file
     │ 2. Enter title & description
     │ 3. Click "Upload"
     ▼
┌─────────────────┐
│  Admin Gallery  │
│     Page        │
└────┬────────────┘
     │ 4. Create FormData
     │ 5. POST /api/gallery
     ▼
┌─────────────────┐
│   Backend API   │
│  (with Multer)  │
└────┬────────────┘
     │ 6. Validate file
     │ 7. Save to disk
     │ 8. Generate filename
     ▼
┌─────────────────┐
│   File System   │
│  uploads/       │
│  gallery/       │
└────┬────────────┘
     │ 9. File saved
     ▼
┌─────────────────┐
│   Database      │
│  (Prisma)       │
└────┬────────────┘
     │ 10. Record created
     ▼
┌─────────────────┐
│   Response      │
│  { success,     │
│    data }       │
└────┬────────────┘
     │ 11. Update UI
     ▼
┌─────────────────┐
│  Gallery Grid   │
│  (refreshed)    │
└─────────────────┘
```

### 2. Public View Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Visit /images
     ▼
┌─────────────────┐
│  Public Gallery │
│     Page        │
└────┬────────────┘
     │ 2. useEffect()
     │ 3. GET /api/gallery?published=true
     ▼
┌─────────────────┐
│   Backend API   │
└────┬────────────┘
     │ 4. Query database
     │    WHERE isPublished = true
     ▼
┌─────────────────┐
│   Database      │
└────┬────────────┘
     │ 5. Return published images
     ▼
┌─────────────────┐
│   Response      │
│  { data: [...] }│
└────┬────────────┘
     │ 6. Set state
     │ 7. Render grid
     ▼
┌─────────────────┐
│  Display Images │
│  (Grid Layout)  │
└─────────────────┘
```

### 3. Image Edit Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │ 1. Click edit icon
     ▼
┌─────────────────┐
│  Edit Dialog    │
└────┬────────────┘
     │ 2. Load current data
     │ 3. Modify fields
     │ 4. Optional: select new image
     │ 5. Click "Save"
     ▼
┌─────────────────┐
│  Admin Gallery  │
│     Page        │
└────┬────────────┘
     │ 6. Create FormData
     │ 7. PUT /api/gallery/:id
     ▼
┌─────────────────┐
│   Backend API   │
└────┬────────────┘
     │ 8. Validate data
     │ 9. If new image:
     │    - Delete old file
     │    - Save new file
     ▼
┌─────────────────┐
│   Database      │
└────┬────────────┘
     │ 10. Update record
     ▼
┌─────────────────┐
│   Response      │
└────┬────────────┘
     │ 11. Refresh gallery
     ▼
┌─────────────────┐
│  Updated Grid   │
└─────────────────┘
```

### 4. Image Crop Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │ 1. Click crop icon
     ▼
┌─────────────────┐
│  Crop Dialog    │
│ (react-image-   │
│  crop)          │
└────┬────────────┘
     │ 2. Load image
     │ 3. Drag to select area
     │ 4. Click "Save Cropped"
     ▼
┌─────────────────┐
│  Canvas API     │
└────┬────────────┘
     │ 5. Draw cropped region
     │ 6. Convert to Blob
     │ 7. Create File object
     ▼
┌─────────────────┐
│  Admin Gallery  │
│     Page        │
└────┬────────────┘
     │ 8. Create FormData
     │ 9. PUT /api/gallery/:id
     ▼
┌─────────────────┐
│   Backend API   │
└────┬────────────┘
     │ 10. Delete old file
     │ 11. Save cropped file
     ▼
┌─────────────────┐
│   Database      │
└────┬────────────┘
     │ 12. Update imageUrl
     ▼
┌─────────────────┐
│  Cropped Image  │
│   Displayed     │
└─────────────────┘
```

### 5. Image Delete Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │ 1. Click delete icon
     │ 2. Confirm deletion
     ▼
┌─────────────────┐
│  Admin Gallery  │
│     Page        │
└────┬────────────┘
     │ 3. DELETE /api/gallery/:id
     ▼
┌─────────────────┐
│   Backend API   │
└────┬────────────┘
     │ 4. Find image record
     │ 5. Get imageKey
     ▼
┌─────────────────┐
│   File System   │
└────┬────────────┘
     │ 6. Delete file
     ▼
┌─────────────────┐
│   Database      │
└────┬────────────┘
     │ 7. Delete record
     ▼
┌─────────────────┐
│   Response      │
└────┬────────────┘
     │ 8. Refresh gallery
     ▼
┌─────────────────┐
│  Updated Grid   │
│ (image removed) │
└─────────────────┘
```

---

## Component Architecture

### Frontend Components

```
app/
├── admin-public/
│   └── gallery/
│       └── page.tsx
│           ├── State Management
│           │   ├── images[]
│           │   ├── loading
│           │   ├── selectedImage
│           │   ├── form states
│           │   └── dialog states
│           │
│           ├── API Functions
│           │   ├── fetchImages()
│           │   ├── handleUpload()
│           │   ├── handleEdit()
│           │   ├── handleDelete()
│           │   ├── handleCrop()
│           │   └── handleTogglePublish()
│           │
│           └── UI Components
│               ├── Header
│               ├── Gallery Grid
│               ├── Upload Dialog
│               ├── Edit Dialog
│               ├── Crop Dialog
│               └── Preview Dialog
│
└── (public)/
    └── images/
        └── page.tsx
            ├── State Management
            │   ├── images[]
            │   └── loading
            │
            ├── API Functions
            │   └── fetchImages()
            │
            └── UI Components
                ├── Header
                ├── Gallery Grid
                └── Image Cards
```

### Backend Components

```
backend/
├── src/
│   ├── controllers/
│   │   └── galleryController.ts
│   │       ├── Multer Configuration
│   │       │   ├── storage
│   │       │   ├── fileFilter
│   │       │   └── limits
│   │       │
│   │       └── Handler Functions
│   │           ├── getAllGalleryImages()
│   │           ├── getGalleryImage()
│   │           ├── createGalleryImage()
│   │           ├── updateGalleryImage()
│   │           ├── deleteGalleryImage()
│   │           └── reorderGalleryImages()
│   │
│   └── routes/
│       └── galleryRoutes.ts
│           ├── Public Routes
│           │   ├── GET /
│           │   └── GET /:id
│           │
│           └── Protected Routes
│               ├── POST /
│               ├── PUT /:id
│               ├── DELETE /:id
│               └── PUT /reorder
│
└── uploads/
    └── gallery/
        └── [image files]
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Authentication
┌─────────────────────────────────────────────────────────────────┐
│  JWT Token Validation                                            │
│  - Token in Authorization header                                 │
│  - Verify signature                                              │
│  - Check expiration                                              │
└─────────────────────────────────────────────────────────────────┘

Layer 2: Authorization
┌─────────────────────────────────────────────────────────────────┐
│  Role-Based Access Control                                       │
│  - Check user role (ADMIN or STAFF)                             │
│  - Deny access if unauthorized                                   │
└─────────────────────────────────────────────────────────────────┘

Layer 3: Input Validation
┌─────────────────────────────────────────────────────────────────┐
│  File Validation                                                 │
│  - Check file type (images only)                                │
│  - Check file size (max 10MB)                                   │
│  - Validate MIME type                                            │
│  - Validate file extension                                       │
└─────────────────────────────────────────────────────────────────┘

Layer 4: Data Validation
┌─────────────────────────────────────────────────────────────────┐
│  Request Data Validation                                         │
│  - Required fields present                                       │
│  - Data types correct                                            │
│  - String lengths within limits                                  │
└─────────────────────────────────────────────────────────────────┘

Layer 5: Database Security
┌─────────────────────────────────────────────────────────────────┐
│  Prisma ORM Protection                                           │
│  - Parameterized queries                                         │
│  - SQL injection prevention                                      │
│  - Type safety                                                   │
└─────────────────────────────────────────────────────────────────┘

Layer 6: File System Security
┌─────────────────────────────────────────────────────────────────┐
│  Secure File Handling                                            │
│  - Unique filenames (timestamp + random)                        │
│  - Isolated storage directory                                    │
│  - No user-controlled filenames                                  │
│  - Automatic cleanup on delete                                   │
└─────────────────────────────────────────────────────────────────┘

Layer 7: Frontend Security
┌─────────────────────────────────────────────────────────────────┐
│  React Security                                                  │
│  - XSS protection (automatic escaping)                          │
│  - CSRF protection                                               │
│  - Secure token storage                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                          │
└─────────────────────────────────────────────────────────────────┘

Frontend
├── Framework: Next.js 16.2.1
├── Language: TypeScript
├── UI Library: React 19.2.4
├── Styling: Tailwind CSS
├── HTTP Client: Axios
├── Image Crop: react-image-crop
├── Notifications: Sonner
└── Icons: Lucide React

Backend
├── Framework: Express.js
├── Language: TypeScript
├── ORM: Prisma
├── File Upload: Multer
├── Authentication: JWT
└── Validation: Custom middleware

Database
├── DBMS: PostgreSQL
├── ORM: Prisma
└── Migrations: Prisma Migrate

File Storage
└── Local: backend/uploads/gallery/

Development Tools
├── Package Manager: npm
├── Code Editor: VS Code
└── Version Control: Git
```

---

## Performance Considerations

```
Frontend Optimizations:
├── Lazy loading images
├── Optimized re-renders
├── Efficient state management
├── Debounced API calls
└── Code splitting

Backend Optimizations:
├── Indexed database queries
├── Efficient file handling
├── Proper error handling
├── Transaction support
└── Connection pooling

Database Optimizations:
├── Indexed isPublished field
├── Indexed order field
├── Optimized queries
└── Proper data types
```

---

This architecture provides a scalable, secure, and maintainable gallery management system! 🚀
