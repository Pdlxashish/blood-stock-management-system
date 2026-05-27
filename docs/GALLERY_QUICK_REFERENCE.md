# 🎨 Gallery Feature - Quick Reference Card

## 🔗 URLs

| Page | URL | Access |
|------|-----|--------|
| **Admin Gallery Management** | `http://localhost:3000/admin-public/gallery` | Admin/Staff only |
| **Public Gallery** | `http://localhost:3000/images` | Everyone |
| **Public Dashboard** | `http://localhost:3000/admin-public` | Everyone |

---

## 🎯 Quick Actions

### Upload Image
1. Go to `/admin-public/gallery`
2. Click **"Upload Image"**
3. Select file → Enter title → Click **"Upload"**

### Edit Image
1. Click **pencil icon** on image card
2. Update fields → Click **"Save Changes"**

### Crop Image
1. Click **crop icon** on image card
2. Drag to select area → Click **"Save Cropped Image"**

### Toggle Publish
1. Click **eye/eye-off icon** on image card
2. Status updates immediately

### Delete Image
1. Click **trash icon** on image card
2. Confirm deletion

---

## 📋 Supported Formats

✅ JPEG / JPG
✅ PNG
✅ GIF
✅ WEBP
✅ AVIF
✅ SVG

**Max Size**: 10MB

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/gallery` | Public | Get all images |
| GET | `/api/gallery?published=true` | Public | Get published only |
| GET | `/api/gallery/:id` | Public | Get single image |
| POST | `/api/gallery` | Admin | Upload image |
| PUT | `/api/gallery/:id` | Admin | Update image |
| DELETE | `/api/gallery/:id` | Admin | Delete image |

---

## 🗂️ File Locations

```
backend/
├── uploads/gallery/          # Image storage
├── src/controllers/
│   └── galleryController.ts  # API logic
└── src/routes/
    └── galleryRoutes.ts      # Routes

frontend/
├── app/admin-public/gallery/
│   └── page.tsx              # Admin page
└── app/(public)/images/
    └── page.tsx              # Public page
```

---

## 🔧 Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://..."
PORT=3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Start Servers

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Images not uploading | Check file size < 10MB, verify admin login |
| Images not showing | Verify image is published, check API URL |
| CORS errors | Backend CORS already configured, restart server |
| Upload fails | Check backend logs, verify uploads/gallery exists |

---

## 📊 Database

**Table**: `Gallery`

**Key Fields**:
- `title` - Image title (required)
- `description` - Image description (optional)
- `imageUrl` - Path to image file
- `isPublished` - Visibility on public page

**View Data**:
```bash
cd backend
npx prisma studio
```

---

## 🎨 Features at a Glance

### Admin Features
✅ Upload (all formats)
✅ Edit (title, description, image)
✅ Crop (free-form)
✅ Delete
✅ Publish/Unpublish
✅ Preview

### Public Features
✅ View published images
✅ Responsive grid
✅ Hover effects
✅ Lazy loading

---

## 📱 Responsive Breakpoints

- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

---

## 🔒 Security

- ✅ Admin/Staff only for management
- ✅ JWT authentication
- ✅ File type validation
- ✅ File size limits
- ✅ SQL injection protection

---

## 📚 Documentation Files

1. **GALLERY_SUMMARY.md** - Complete overview
2. **GALLERY_SETUP.md** - Setup instructions
3. **GALLERY_FEATURE.md** - Detailed documentation
4. **GALLERY_QUICK_REFERENCE.md** - This file

---

## ⚡ Pro Tips

💡 Use descriptive titles for better SEO
💡 Keep images under 5MB for faster loading
💡 Crop images before upload when possible
💡 Use consistent image dimensions
💡 Add descriptions for accessibility

---

## 🎉 Status

✅ **Fully Implemented**
✅ **Database Migrated**
✅ **Dependencies Installed**
✅ **Ready to Use**

---

**Need Help?** Check `GALLERY_SETUP.md` for detailed instructions!
