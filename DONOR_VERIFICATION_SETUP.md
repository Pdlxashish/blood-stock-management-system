# Donor Verification System

## Overview

The Donor Verification system allows staff and administrators to quickly search and verify donor information using their Donor ID, email address, or phone number. This feature is accessible through the admin-public dashboard and provides comprehensive donor details including donation history, eligibility status, and verification status.

## Architecture

### Backend API

**Endpoint:** `GET /api/donors/verify?query={searchQuery}`

**Access:** Public (no authentication required for verification)

**Search Criteria:**
- Donor ID (exact match)
- Email address (case-insensitive)
- Phone number (exact match)

**Response Data:**
```typescript
{
  status: "success",
  data: {
    id: string;                    // Donor ID
    userId: string;                // Associated user ID
    bloodGroup: string;            // Blood type (e.g., A_POSITIVE)
    donorType: string;             // PERSON or ORGANIZATION
    location: string;              // Primary location
    city: string | null;           // City
    address: string | null;        // Full address
    dateOfBirth: string | null;    // Date of birth
    weight: number | null;         // Weight in kg
    latitude: number | null;       // Geolocation
    longitude: number | null;      // Geolocation
    lastDonationDate: string | null; // Last donation date
    totalDonations: number;        // Total donation count
    isEligible: boolean;           // Eligibility status
    medicalNotes: string | null;   // Medical notes/restrictions
    status: 'ACTIVE' | 'INACTIVE'; // Calculated status
    donorTypeCategory: 'REGULAR' | 'FIRST_TIME' | 'OCCASIONAL'; // Calculated category
    daysSinceLastDonation: number | null; // Days since last donation
    livesSaved: number;            // Estimated lives saved (donations * 3)
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      isVerified: boolean;
    };
  }
}
```

### Status Calculation Logic

**Donor Status:**
- `ACTIVE`: Eligible and donated within the last 365 days
- `INACTIVE`: Not eligible OR no donation in the last 365 days

**Donor Type Category:**
- `REGULAR`: 5 or more donations
- `OCCASIONAL`: 2-4 donations
- `FIRST_TIME`: 0-1 donations

### Frontend Page

**Location:** `/admin-public/donor-verification`

**Features:**
- Search input with real-time validation
- Support for Enter key to search
- Loading states during search
- Error handling with user-friendly messages
- Comprehensive donor information display
- Visual status badges
- Donation statistics
- Medical notes display (if any)
- Verification status indicator

## Usage

### For Staff/Administrators

1. **Access the Page:**
   - Navigate to `/admin-public/donor-verification`
   - No login required (public dashboard)

2. **Search for a Donor:**
   - Enter one of the following:
     - Donor ID (e.g., `cm123abc456def`)
     - Email address (e.g., `john.doe@example.com`)
     - Phone number (e.g., `+1234567890`)
   - Click "Search" or press Enter

3. **View Results:**
   - **Donor Information**: Name, contact details, blood group, location
   - **Status Badges**: Active/Inactive, donor type, verification status
   - **Donation Statistics**: Total donations, lives saved, last donation date
   - **Medical Notes**: Any medical restrictions or notes
   - **Verification Status**: Whether the donor is verified in the system

### Search Examples

**By Donor ID:**
```
cm123abc456def
```

**By Email:**
```
john.doe@example.com
```

**By Phone:**
```
+1234567890
```

## Implementation Details

### Backend Controller

**File:** `backend/src/controllers/donorController.ts`

**Function:** `verifyDonor`

Key features:
- Searches across donor ID, user email, and user phone
- Case-insensitive email search
- Calculates derived fields (status, category, days since donation)
- Returns 404 if donor not found
- Includes user information in response

### Backend Routes

**File:** `backend/src/routes/donorRoutes.ts`

```typescript
router.get("/verify", asyncHandler(donorController.verifyDonor));
```

**Note:** The `/verify` route must be defined BEFORE the `/:id` route to avoid route conflicts.

### Frontend Component

**File:** `frontend/app/admin-public/donor-verification/page.tsx`

Key features:
- Real-time search with axios
- Loading and error states
- Responsive design
- Blood group formatting (A_POSITIVE → A+)
- Date formatting
- Conditional rendering based on data availability
- Toast notifications for user feedback

## Status Badges

The system displays several status badges:

1. **Active/Inactive Badge:**
   - Green: Active donor (eligible and recent donation)
   - Gray: Inactive donor

2. **Donor Type Badge:**
   - Blue: Regular donor (5+ donations)
   - Purple: First-time donor (0-1 donations)
   - Orange: Occasional donor (2-4 donations)

3. **Verified Badge:**
   - Green with checkmark: User is verified
   - Not shown if user is not verified

4. **Eligibility Badge:**
   - Red "NOT ELIGIBLE": Shown only if donor is not eligible

## Error Handling

### Backend Errors

- **400 Bad Request**: Missing or invalid search query
- **404 Not Found**: Donor not found with given criteria
- **500 Internal Server Error**: Database or server error

### Frontend Error Display

- Toast notification with error message
- Error card with alert icon
- User-friendly error messages
- Maintains search input for retry

## Data Privacy Considerations

- No authentication required for verification (public dashboard feature)
- All donor information is displayed to staff
- Medical notes are highlighted in a warning-style card
- Phone numbers and emails are displayed in full

## Future Enhancements

Possible improvements:
- Add authentication requirement for sensitive data
- Export donor information to PDF
- Print donor verification certificate
- View full donation history
- Update donor eligibility status
- Add notes or flags to donor records
- Bulk donor verification
- QR code scanning for quick verification
- Integration with ID card scanning

## Testing

### Manual Testing

1. **Test with existing donor:**
   - Create a donor in the system
   - Search by their email
   - Verify all information displays correctly

2. **Test with non-existent donor:**
   - Search with random email
   - Verify error message displays

3. **Test different search methods:**
   - Search by ID
   - Search by email
   - Search by phone
   - Verify all methods work

4. **Test edge cases:**
   - Empty search query
   - Special characters in search
   - Very long search strings

### API Testing

**Test successful search:**
```bash
curl "http://localhost:3001/api/donors/verify?query=john@example.com"
```

**Test not found:**
```bash
curl "http://localhost:3001/api/donors/verify?query=nonexistent@example.com"
```

**Test missing query:**
```bash
curl "http://localhost:3001/api/donors/verify"
```

## Routes Summary

```
Frontend:
├── /admin-public/donor-verification  # Donor verification page

Backend API:
└── GET /api/donors/verify?query={searchQuery}  # Verify donor endpoint
```

## Dependencies

### Backend
- Prisma ORM for database queries
- Express.js for routing
- asyncHandler middleware for error handling

### Frontend
- React hooks (useState)
- axios for API calls
- sonner for toast notifications
- lucide-react for icons
- shadcn/ui components

## Security Notes

- Currently no authentication required (public dashboard)
- Consider adding role-based access control for sensitive operations
- Implement rate limiting to prevent abuse
- Log all verification attempts for audit trail
- Consider masking sensitive information for non-admin users

## Troubleshooting

### "Donor not found" error
- Verify the donor exists in the database
- Check that the search query matches exactly (for ID and phone)
- Ensure email search is case-insensitive

### API connection errors
- Verify backend server is running on port 3001
- Check CORS configuration
- Verify API_URL in frontend environment variables

### Route conflicts
- Ensure `/verify` route is defined before `/:id` route
- Check route order in donorRoutes.ts
