# About Page Content Management System

## Overview

The About page content management system allows administrators to edit all content on the public About page through the admin dashboard at `/admin-public/about`. This provides a user-friendly interface for managing:

- Hero section (title and subtitle)
- Mission statement
- Vision statement
- Core values (with icons)
- Organization story
- Impact statistics
- Contact information
- "What We Do" sections

## Architecture

### Database Schema

**Model: `About`**
```prisma
model About {
  id               String   @id @default(cuid())
  
  // Hero Section
  heroTitle        String
  heroSubtitle     String
  
  // Mission & Vision
  missionTitle     String
  missionContent   String
  visionTitle      String
  visionContent    String
  
  // Values (JSON array)
  values           String
  
  // Story Section
  storyTitle       String
  storyContent     String
  
  // Stats (JSON array)
  stats            String
  
  // Contact Information
  contactAddress   String
  contactPhone     String
  contactEmail     String
  contactEmergency String
  
  // What We Do (JSON array)
  whatWeDo         String
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### JSON Field Structures

**Values Array:**
```json
[
  {
    "title": "Community First",
    "description": "We believe in the power of community...",
    "icon": "Users"
  }
]
```

**Stats Array:**
```json
[
  {
    "label": "Active Donors",
    "value": "500+"
  }
]
```

**What We Do Array:**
```json
[
  {
    "title": "Blood Collection",
    "description": "We organize regular blood donation camps..."
  }
]
```

## Backend API

### Endpoints

#### Get About Content
```
GET /api/about
```
- **Access:** Public
- **Returns:** About content object
- **Auto-creates:** If no content exists, creates default content

#### Update About Content
```
PUT /api/about
```
- **Access:** Admin/Staff only (requires authentication)
- **Body:** Partial update of any About fields
- **Returns:** Updated About content object

### Files

- **Controller:** `backend/src/controllers/aboutController.ts`
- **Routes:** `backend/src/routes/aboutRoutes.ts`
- **Migration:** `backend/prisma/migrations/20260525211717_add_about_model/`

## Frontend

### Admin Management Page

**Location:** `/admin-public/about`

**Features:**
- View all About page content in organized sections
- Edit button for each section
- Modal dialogs for editing specific sections
- Add/remove items for array fields (values, stats, what we do)
- Icon selector for values
- Real-time preview of changes
- View-only mode for non-admin users

**Editable Sections:**
1. **Hero Section** - Title and subtitle
2. **Mission** - Title and content
3. **Vision** - Title and content
4. **Values** - Array of values with title, description, and icon
5. **Story** - Title and multi-paragraph content
6. **Stats** - Array of statistics with label and value
7. **Contact** - Address, phone, email, emergency hotline
8. **What We Do** - Array of service descriptions

### Public About Page

**Location:** `/about`

**Features:**
- Fetches content from API on page load
- Displays all sections with proper formatting
- Responsive design
- Loading state
- Error handling

## Usage

### For Administrators

1. **Access the Admin Panel:**
   - Navigate to `/admin-public/about`
   - Login as Admin or Staff if not already authenticated

2. **Edit Content:**
   - Click the "Edit" button on any section
   - Modify the content in the dialog
   - For array fields (values, stats, what we do):
     - Click "Add" to add new items
     - Click trash icon to remove items
     - Edit fields directly in the form
   - Click "Save Changes" to update

3. **View Changes:**
   - Changes are immediately reflected in the admin view
   - Visit `/about` to see the public-facing page

### For Developers

#### Adding New Fields

1. **Update Prisma Schema:**
```prisma
model About {
  // ... existing fields
  newField String @default("Default value")
}
```

2. **Create Migration:**
```bash
cd backend
npx prisma migrate dev --name add_new_field
```

3. **Update Controller:**
```typescript
// In aboutController.ts
if (newField !== undefined) updateData.newField = newField;
```

4. **Update Frontend:**
```typescript
// Add to AboutContent interface
interface AboutContent {
  // ... existing fields
  newField: string;
}

// Add edit section in admin page
{editSection === 'newSection' && (
  <div>
    <Label>New Field</Label>
    <Input
      value={editData.newField || ''}
      onChange={(e) => setEditData({ ...editData, newField: e.target.value })}
    />
  </div>
)}
```

#### Testing the API

**Get Content:**
```bash
curl http://localhost:3001/api/about
```

**Update Content (requires auth token):**
```bash
curl -X PUT http://localhost:3001/api/about \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "heroTitle": "New Title",
    "heroSubtitle": "New Subtitle"
  }'
```

## Default Content

The system includes sensible defaults for all fields:

- **Hero:** "About VitalFlow" with mission statement
- **Mission:** Focus on bridging donors and recipients
- **Vision:** Universal access to safe blood
- **Values:** Community First, Excellence, Compassion
- **Story:** Organization founding and growth narrative
- **Stats:** 500+ donors, 1,200+ lives saved, 25+ hospitals, 3,000+ units
- **Contact:** Placeholder contact information
- **What We Do:** Blood collection, testing, storage, community engagement

## Security

- **Public Read Access:** Anyone can view About content via GET endpoint
- **Admin Write Access:** Only authenticated Admin/Staff can update content
- **Authentication:** Uses JWT token authentication
- **Authorization:** Middleware checks user role before allowing updates

## Routes Summary

```
Public Routes:
├── /about                    # Public about page (fetches from API)

Admin Routes:
├── /admin-public/about       # Admin content management interface

API Routes:
├── GET  /api/about          # Get about content (public)
└── PUT  /api/about          # Update about content (admin only)
```

## Migration

The About model was added via migration:
```
20260525211717_add_about_model
```

To apply:
```bash
cd backend
npx prisma migrate deploy
```

## Future Enhancements

Possible improvements:
- Image upload for hero section background
- Rich text editor for story content
- Multiple language support
- Version history and rollback
- Preview mode before publishing
- SEO metadata fields
- Social media links section
