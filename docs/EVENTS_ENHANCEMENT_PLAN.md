# Events System Enhancement Plan

## Overview
Enhance the events system with banner/poster images, map-based location selection, and improved UI.

## Features to Implement

### 1. Database Schema Updates
- Add `banner` field to Event model (image URL)
- Add `poster` field to Event model (image URL)
- Add `latitude` field to Event model (for map coordinates)
- Add `longitude` field to Event model (for map coordinates)

### 2. Backend Updates
- Update Event model in Prisma schema
- Create migration for new fields
- Update event controller to handle image uploads
- Add routes for banner/poster upload
- Extend upload middleware to handle event images

### 3. Admin Dashboard - Event Creation/Edit
- Add banner image upload field
- Add poster image upload field
- Replace location text input with map picker
- Use Leaflet or Google Maps for location selection
- Store latitude/longitude coordinates
- Preview uploaded images

### 4. Public Events Page (`/events`)
- Display event banners in card view
- Make event cards clickable
- Show event posters in detail view
- Add map view for event location
- Improve overall UI/UX

### 5. Event Detail Page (`/events/[id]`)
- Create new detail page
- Display full event information
- Show banner and poster images
- Interactive map showing event location
- Registration/participation buttons
- Share functionality

## Technology Stack
- **Maps**: Leaflet (open-source, no API key needed) or Google Maps
- **Image Upload**: Multer (already installed)
- **Map Library**: react-leaflet for frontend
- **Geocoding**: OpenStreetMap Nominatim (free) or Google Geocoding API

## Implementation Steps
1. Update Prisma schema
2. Create migration
3. Update backend controllers and routes
4. Install map libraries
5. Create map picker component
6. Update admin event form
7. Update public events page
8. Create event detail page
9. Add map view component

## Files to Create/Modify
- `backend/prisma/schema.prisma`
- `backend/src/controllers/eventController.ts`
- `backend/src/routes/eventRoutes.ts`
- `frontend/app/(admin)/dashboard/events/page.tsx`
- `frontend/app/(public)/events/page.tsx`
- `frontend/app/(public)/events/[id]/page.tsx` (new)
- `frontend/components/MapPicker.tsx` (new)
- `frontend/components/MapView.tsx` (new)
