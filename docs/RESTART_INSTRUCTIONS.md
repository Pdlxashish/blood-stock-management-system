# 🔄 Restart Instructions - Donor Verification System

## ⚠️ IMPORTANT: Backend Must Be Restarted

The backend server needs to be restarted to pick up the new route changes (PATCH endpoints for approve/reject).

## Step-by-Step Restart Process

### 1. Stop Backend Server

If the backend is running in a terminal:
```bash
# Press Ctrl+C to stop the server
```

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Run Migration Script (One-Time)

Mark all existing donors as verified:
```bash
npx tsx scripts/mark-existing-donors-verified.ts
```

**Expected Output:**
```
🔄 Marking all existing donors as VERIFIED...
✅ Updated 20 donors to VERIFIED status
✅ Updated 20 users to verified status

📊 Verification Status Summary:
   VERIFIED: 20
```

### 4. Restart Backend Server

```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Database connected
```

### 5. Verify Routes Are Working

Test the new endpoints:

```bash
# Test approve endpoint (should return 404 if donor doesn't exist, not "route not found")
curl -X PATCH http://localhost:5000/api/donors/test-id/approve \
  -H "Content-Type: application/json" \
  -d '{"verifiedBy": "admin"}'

# Test reject endpoint
curl -X PATCH http://localhost:5000/api/donors/test-id/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "test", "verifiedBy": "admin"}'
```

## Frontend (Optional Restart)

The frontend doesn't need to be restarted, but if you want to ensure everything is fresh:

```bash
# In frontend directory
cd frontend

# Stop with Ctrl+C, then restart
npm run dev
```

## Verification Checklist

After restart, verify these work:

### ✅ Backend Routes
- [ ] `GET /api/donors` - List donors
- [ ] `GET /api/donors/pending` - List pending donors
- [ ] `GET /api/donors/verify?query=email` - Search donor
- [ ] `PATCH /api/donors/:id/approve` - Approve donor
- [ ] `PATCH /api/donors/:id/reject` - Reject donor
- [ ] `GET /api/donors/verification-stats` - Get stats

### ✅ Frontend Pages
- [ ] `/become-donor` - Registration with password toggle
- [ ] `/donor-form` - Medical info form
- [ ] `/verification-request` - Confirmation page
- [ ] `/profile` - Shows verification status
- [ ] `/admin-public/donor-verification` - Admin verification
- [ ] `/admin-public/pending-donors` - Pending list

## Common Issues After Restart

### Issue: "Route not found" error
**Cause:** Backend not restarted or routes not loaded
**Solution:** 
1. Stop backend completely (Ctrl+C)
2. Wait 2 seconds
3. Start again with `npm run dev`
4. Check console for "Server running on port 5000"

### Issue: Old donors still show PENDING
**Cause:** Migration script not run
**Solution:** Run `npx tsx scripts/mark-existing-donors-verified.ts`

### Issue: Frontend shows old data
**Cause:** Browser cache
**Solution:** 
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Open in incognito mode

### Issue: CORS errors
**Cause:** Backend not running or wrong URL
**Solution:** 
1. Check backend is running on port 5000
2. Check `.env` has correct `NEXT_PUBLIC_BACKEND_URL`

## Testing After Restart

### Quick Test Flow

1. **Register New Donor**
   - Go to: http://localhost:3000/become-donor
   - Register with test credentials
   - Login

2. **Complete Medical Info**
   - Fill in donor form
   - Submit

3. **Check Verification Request**
   - Should see "Pending Verification" page
   - Navigate to profile
   - Should see yellow "Pending" badge

4. **Admin Approval**
   - Go to: http://localhost:3000/admin-public/donor-verification
   - Search for donor
   - Click "Approve Donor"
   - Should see success message

5. **Verify Status Update**
   - Go back to profile
   - Should see green "Verified" badge with pulse

## Environment Variables

Make sure these are set correctly:

### Backend `.env`
```env
DATABASE_URL=your_database_url
PORT=5000
JWT_SECRET=your_secret
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Port Conflicts

If port 5000 is already in use:

### Windows
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Mac/Linux
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

## Success Indicators

✅ Backend console shows:
```
Server running on port 5000
Database connected
```

✅ Frontend console shows no errors

✅ Browser Network tab shows:
- 200 responses for API calls
- No CORS errors
- No 404 for approve/reject endpoints

✅ Database shows:
- Existing donors have `verificationStatus = 'VERIFIED'`
- New donors have `verificationStatus = 'PENDING'`

## Need Help?

If issues persist:

1. Check all console logs (backend, frontend, browser)
2. Verify database connection
3. Check environment variables
4. Review error messages in browser DevTools
5. Consult documentation files:
   - DONOR_VERIFICATION_IMPLEMENTATION.md
   - VERIFICATION_TESTING_GUIDE.md
   - VERIFICATION_CHANGES_SUMMARY.md

## Next Steps

Once backend is restarted and verified:

1. Follow VERIFICATION_TESTING_GUIDE.md for comprehensive testing
2. Test all scenarios (approve, reject, pending)
3. Verify profile status updates
4. Check admin dashboard functionality
5. Test with multiple donors

## 🎉 You're Ready!

After following these steps, your donor verification system should be fully operational!
