# Donor Verification - Testing Guide

## Testing with Existing Donors

Your database currently has donors. Here are some you can use for testing:

### Test Donor 1: Aaseeka Poudel
- **Email:** `aaseekapoudel18@gmail.com`
- **Phone:** `9876543210`
- **Donor ID:** `cmplfp9560001gk0ni817wmpl`
- **Blood Group:** O+
- **Status:** ACTIVE (Regular donor with 6 donations)

### Test Donor 2: Ashish Gautam
- **Email:** `ashishgautam112@gmail.com`
- **Phone:** `0000000000`
- **Donor ID:** `cmp6caats0002go0n4yyv3jpm`
- **Blood Group:** B+
- **Status:** ACTIVE (Occasional donor with 2 donations)

### Test Donor 3: Aaseeka Tamang
- **Email:** `aaseekatamang18@gmail.com`
- **Phone:** `98777777777`
- **Donor ID:** `cmp5pudqv0005n40n88pg3kmj`
- **Blood Group:** AB+
- **Status:** ACTIVE (Occasional donor with 2 donations)

### Test Donor 4: Manipal
- **Email:** `poudelashish0718@gmail.com`
- **Phone:** `9867918672`
- **Donor ID:** `cmp5oofde0001n40nq4ue4lyd`
- **Blood Group:** B+
- **Status:** ACTIVE (Occasional donor with 2 donations)

### Test Donor 5: Ashish Club (Organization)
- **Email:** `aa@gmail.com`
- **Phone:** `334343423`
- **Donor ID:** `cmp2ttc960003iolhiac7kuh4`
- **Blood Group:** A+
- **Type:** ORGANIZATION
- **Status:** ACTIVE (Regular donor with 9 donations)

## How to Test

### 1. Using the Web Interface

1. Navigate to: `http://localhost:3000/admin-public/donor-verification`
2. Enter one of the following in the search box:
   - Email: `aaseekapoudel18@gmail.com`
   - Phone: `9876543210`
   - Donor ID: `cmplfp9560001gk0ni817wmpl`
3. Click "Search" or press Enter
4. You should see the donor's complete information

### 2. Using API Directly

**Test with email:**
```bash
curl "http://localhost:3001/api/donors/verify?query=aaseekapoudel18@gmail.com"
```

**Test with phone:**
```bash
curl "http://localhost:3001/api/donors/verify?query=9876543210"
```

**Test with donor ID:**
```bash
curl "http://localhost:3001/api/donors/verify?query=cmplfp9560001gk0ni817wmpl"
```

## Expected Results

When you search for **Aaseeka Poudel** (aaseekapoudel18@gmail.com), you should see:

- **Status Badges:**
  - ACTIVE (green)
  - REGULAR (blue) - because they have 6 donations
  - VERIFIED (green with checkmark)

- **Donor Information:**
  - Name: Aaseeka Poudel
  - Email: aaseekapoudel18@gmail.com
  - Phone: 9876543210
  - Blood Group: O+
  - Location: Pokhara

- **Donation Statistics:**
  - Total Donations: 6
  - Lives Saved: 18 (6 × 3)
  - Last Donation: May 25, 2026
  - Days Since: 0 days ago

## Testing Error Cases

### Test 1: Non-existent Donor
- Search for: `nonexistent@example.com`
- Expected: Red error card with "Donor Not Found" message

### Test 2: Empty Search
- Leave search box empty and click Search
- Expected: Toast error "Please enter a donor ID, email, or phone number"

### Test 3: Invalid Format
- Search for: `invalid-email-format`
- Expected: "Donor Not Found" (404 error)

## Understanding Donor Categories

The system automatically categorizes donors based on their donation history:

### REGULAR Donor
- **Criteria:** 5 or more donations
- **Badge Color:** Blue
- **Example:** Aaseeka Poudel (6 donations), Ashish Club (9 donations)

### OCCASIONAL Donor
- **Criteria:** 2-4 donations
- **Badge Color:** Orange
- **Example:** Ashish Gautam (2 donations), Aaseeka Tamang (2 donations)

### FIRST_TIME Donor
- **Criteria:** 0-1 donations
- **Badge Color:** Purple
- **Example:** Any new donor with no or one donation

## Understanding Status

### ACTIVE Status
A donor is marked as ACTIVE if:
- They are eligible to donate (isEligible = true), AND
- They have donated within the last 365 days

### INACTIVE Status
A donor is marked as INACTIVE if:
- They are not eligible to donate (isEligible = false), OR
- They haven't donated in over 365 days

## Troubleshooting

### Issue: "Donor not found" for existing donor

**Possible causes:**
1. Typo in search query
2. Donor doesn't have a donor profile (only user account)
3. Email/phone doesn't match exactly

**Solution:**
- Double-check the spelling
- Ensure the donor has completed their donor profile
- Try searching with a different field (ID, email, or phone)

### Issue: API returns 404

**Check:**
1. Backend server is running: `http://localhost:3001`
2. Database connection is working
3. Donor exists in the database

**Test backend:**
```bash
curl http://localhost:3001/health
```

### Issue: Frontend shows network error

**Check:**
1. Frontend server is running: `http://localhost:3000`
2. Backend server is running: `http://localhost:3001`
3. CORS is configured correctly
4. Check browser console for detailed errors

## Quick Test Script

Save this as `test-donor-verification.sh` (Linux/Mac) or `test-donor-verification.bat` (Windows):

```bash
# Test with existing donor
echo "Testing with email..."
curl "http://localhost:3001/api/donors/verify?query=aaseekapoudel18@gmail.com"

echo "\n\nTesting with phone..."
curl "http://localhost:3001/api/donors/verify?query=9876543210"

echo "\n\nTesting with donor ID..."
curl "http://localhost:3001/api/donors/verify?query=cmplfp9560001gk0ni817wmpl"

echo "\n\nTesting with non-existent donor..."
curl "http://localhost:3001/api/donors/verify?query=nonexistent@example.com"
```

## Creating Test Donors

If you need to create additional test donors for testing:

1. Register a new user account
2. Complete the donor profile with:
   - Blood group
   - Location
   - Contact information
3. The donor will then be searchable in the verification system

## Production Considerations

Before deploying to production:

1. **Add Authentication:** Consider requiring login for donor verification
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **Audit Logging:** Log all verification attempts
4. **Data Masking:** Consider masking sensitive information for non-admin users
5. **GDPR Compliance:** Ensure compliance with data protection regulations

## Support

If you encounter issues:
1. Check the backend logs in the terminal
2. Check the browser console for frontend errors
3. Verify database connectivity
4. Ensure all environment variables are set correctly
