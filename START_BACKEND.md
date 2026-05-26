# 🚀 Start Backend Server

## The backend server is NOT running!

You're getting "No response from server" errors because the backend is not running.

## Quick Start

### Option 1: Start in Current Terminal

```bash
cd backend
npm run dev
```

### Option 2: Start in New Terminal

1. Open a new terminal/command prompt
2. Navigate to backend directory:
   ```bash
   cd c:\Users\poude\blood-stock-management-system\backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Expected Output

When the server starts successfully, you should see:

```
✅ Database connected
🚀 Server running: http://localhost:5000
🌐 API Base: http://localhost:5000/api
```

## Verify Server is Running

Open your browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Server is running 🚀"
}
```

## What Was Fixed

1. ✅ Added `PATCH` method to CORS configuration
2. ✅ Updated donor routes to use PATCH for approve/reject
3. ✅ Updated frontend to use PATCH instead of PUT

## After Starting Backend

1. The "No response from server" error will be resolved
2. You can approve/reject donors from admin pages
3. All API endpoints will work correctly

## Troubleshooting

### Port 5000 Already in Use

If you get an error that port 5000 is already in use:

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Then restart:**
```bash
npm run dev
```

### Database Connection Error

If you get a database connection error:

1. Check your `.env` file has correct `DATABASE_URL`
2. Make sure PostgreSQL is running
3. Verify database credentials

### Module Not Found Error

If you get module errors:

```bash
# Reinstall dependencies
npm install

# Then start
npm run dev
```

## Keep Server Running

**IMPORTANT:** Keep the backend server running in a terminal while using the application!

- Don't close the terminal
- Don't press Ctrl+C (this stops the server)
- If you need to stop it, press Ctrl+C, then restart with `npm run dev`

## Test After Starting

Once the server is running, test the approve functionality:

1. Go to: http://localhost:3000/admin-public/pending-donors
2. Click "Approve" on a pending donor
3. Should work without "No response from server" error

## 🎉 You're Ready!

After starting the backend server, all features will work correctly!
