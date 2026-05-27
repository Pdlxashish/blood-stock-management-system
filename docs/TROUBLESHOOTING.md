# 🔧 Troubleshooting Guide

## ❌ Error: "No response from server"

### Problem
```
No response from server: [object XMLHttpRequest]
Error approving donor: AxiosError: Network Error
```

### Cause
**Backend server is not running!**

### Solution
Start the backend server:

```bash
cd backend
npm run dev
```

### Verify
Check if server is running:
```
http://localhost:5000/health
```

Should return:
```json
{"status": "ok", "message": "Server is running 🚀"}
```

---

## ❌ Error: "Route not found"

### Problem
```
Route /api/donors/:id/approve not found
```

### Cause
Backend server needs to be restarted to pick up new routes

### Solution
1. Stop backend (Ctrl+C)
2. Restart: `npm run dev`

---

## ❌ Error: "CORS policy"

### Problem
```
Access to XMLHttpRequest blocked by CORS policy
```

### Cause
CORS not configured for PATCH method

### Solution
Already fixed! The backend `index.ts` now includes PATCH in CORS methods.

Just restart the backend:
```bash
cd backend
npm run dev
```

---

## ❌ Error: "Port 5000 already in use"

### Problem
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Cause
Another process is using port 5000

### Solution

**Windows:**
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Restart backend
npm run dev
```

**Mac/Linux:**
```bash
# Find and kill
lsof -ti:5000 | xargs kill -9

# Restart backend
npm run dev
```

---

## ❌ Error: "Database connection failed"

### Problem
```
Error: Can't reach database server
```

### Cause
PostgreSQL not running or wrong credentials

### Solution
1. Check PostgreSQL is running
2. Verify `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```
3. Test connection:
   ```bash
   npx prisma db pull
   ```

---

## ❌ Error: "Module not found"

### Problem
```
Error: Cannot find module 'express'
```

### Cause
Dependencies not installed

### Solution
```bash
cd backend
npm install
npm run dev
```

---

## ❌ Error: "Prisma Client not generated"

### Problem
```
Error: @prisma/client did not initialize yet
```

### Cause
Prisma client needs to be generated

### Solution
```bash
cd backend
npx prisma generate
npm run dev
```

---

## ❌ Frontend: "Failed to fetch"

### Problem
Frontend shows "Failed to fetch" or network errors

### Cause
1. Backend not running
2. Wrong backend URL

### Solution
1. Start backend: `cd backend && npm run dev`
2. Check `.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```
3. Restart frontend (Ctrl+C, then `npm run dev`)

---

## ❌ Profile doesn't show verification status

### Problem
Profile page doesn't display verification badge

### Cause
1. Donor profile doesn't exist
2. API call failing

### Solution
1. Check browser console for errors
2. Open DevTools → Network tab
3. Look for `/api/donors?userId=...` call
4. If 404: User needs to complete donor-form
5. If 500: Check backend logs

---

## ❌ Existing donors show "Not Verified"

### Problem
Old donors show as not verified

### Cause
Migration script not run

### Solution
```bash
cd backend
npx tsx scripts/mark-existing-donors-verified.ts
```

Expected output:
```
✅ Updated 20 donors to VERIFIED status
✅ Updated 20 users to verified status
```

---

## ❌ Password eye icon not working

### Problem
Eye icon doesn't toggle password visibility

### Cause
1. Icons not imported
2. State not updating

### Solution
Already fixed! The code includes:
- Eye and EyeOff imports
- showPassword state
- Toggle functionality

Just refresh browser (Ctrl+Shift+R)

---

## ❌ Approve button does nothing

### Problem
Clicking "Approve Donor" doesn't work

### Cause
1. Backend not running
2. Not authenticated
3. Wrong endpoint

### Solution
1. Start backend
2. Login as admin
3. Check browser console for errors
4. Verify endpoint is PATCH (not PUT)

---

## 🔍 Debugging Checklist

### Backend
- [ ] Server is running (`npm run dev`)
- [ ] Port 5000 is accessible
- [ ] Database is connected
- [ ] No errors in terminal
- [ ] Health check works: http://localhost:5000/health

### Frontend
- [ ] Server is running (`npm run dev`)
- [ ] Port 3000 is accessible
- [ ] `.env.local` has correct backend URL
- [ ] No errors in browser console
- [ ] Network tab shows successful API calls

### Database
- [ ] PostgreSQL is running
- [ ] Database exists
- [ ] Migrations are applied
- [ ] Prisma client is generated

### Authentication
- [ ] User is logged in
- [ ] Token is valid
- [ ] User has correct role (ADMIN for verification)

---

## 🛠️ Quick Fixes

### Reset Everything

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Clear Cache

```bash
# Backend
cd backend
rm -rf node_modules
rm -rf dist
npm install

# Frontend
cd frontend
rm -rf .next
rm -rf node_modules
npm install
```

### Restart Services

```bash
# Stop all (Ctrl+C in each terminal)

# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm run dev
```

---

## 📞 Still Having Issues?

### Check Logs

**Backend logs:**
- Look at terminal where backend is running
- Check for error messages

**Frontend logs:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### Verify Configuration

**Backend `.env`:**
```env
DATABASE_URL=postgresql://...
PORT=5000
JWT_SECRET=your_secret
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get donors
curl http://localhost:5000/api/donors

# Approve donor (with auth token)
curl -X PATCH http://localhost:5000/api/donors/DONOR_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verifiedBy": "admin"}'
```

---

## ✅ Success Indicators

### Backend Running
```
✅ Database connected
🚀 Server running: http://localhost:5000
```

### Frontend Running
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

### API Working
- Health check returns 200
- No CORS errors
- Approve/reject works
- Profile shows status

---

## 🎯 Most Common Issue

**90% of errors are caused by backend not running!**

**Solution:** Always make sure backend is running:
```bash
cd backend
npm run dev
```

Keep the terminal open and don't close it!
