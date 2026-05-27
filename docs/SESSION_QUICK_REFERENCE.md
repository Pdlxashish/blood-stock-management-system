# 🔐 Session Management - Quick Reference Card

## 🎯 At a Glance

| Feature | Admin | Donor |
|---------|-------|-------|
| **Login URL** | `/auth/admin` | `/login` |
| **Token Expiry** | 30 days | 30 days |
| **Email Verification** | ❌ Not required | ✅ Required |
| **localStorage Keys** | `token`, `user`, `isAdmin` | `token`, `user` |
| **Protected Routes** | `/dashboard/*` | `/home`, `/profile` |
| **Role Check** | `isAdmin()` | `role === 'DONOR'` |

---

## 🔑 Admin Credentials

```
ID: mukunday@gmail.com
Password: muku
```

---

## 📦 localStorage Structure

### Admin Session
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: '{"id":"...","email":"mukunday@gmail.com","role":"ADMIN"}',
  isAdmin: "true"
}
```

### Donor Session
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: '{"id":"...","email":"donor@example.com","role":"DONOR"}'
  // NO isAdmin key
}
```

---

## 🧪 Quick Tests

### Check Current Session
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Is Admin:', localStorage.getItem('isAdmin'));
```

### Check Token Expiry
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

### Clear Session
```javascript
localStorage.clear();
location.reload();
```

---

## 🔒 Security Checks

### Frontend Protection
```typescript
// Admin routes
<AdminProtected>
  {children}
</AdminProtected>

// Checks:
// 1. isAuthenticated()
// 2. isAdmin()
// 3. Redirects if invalid
```

### Backend Protection
```typescript
// Protected route
router.get('/donors', 
  protect,                    // Validates token
  authorize('ADMIN'),         // Checks role
  getDonors
);
```

---

## 🚦 Session Flow

### Login
```
User Login → Backend Validates → Generate JWT → Store in localStorage → Redirect
```

### API Request
```
Frontend Request → Axios Adds Token → Backend Validates → Process → Response
```

### Page Load
```
Component Mount → Check localStorage → Validate Session → Render or Redirect
```

---

## 🐛 Troubleshooting

### "Unauthorized" Error
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// If null, login again
// If exists, check expiry (see above)
```

### "Forbidden" Error
```javascript
// Check user role
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user.role);

// Admin routes require role = 'ADMIN'
// Donor routes require role = 'DONOR'
```

### Redirected to Login
```javascript
// Session expired or invalid
// Clear and login again
localStorage.clear();
// Then login
```

---

## 📍 Key Files

### Frontend
- `frontend/lib/auth.ts` - Auth utilities
- `frontend/hooks/useAuth.ts` - Auth hook
- `frontend/components/AdminProtected.tsx` - Admin protection
- `frontend/lib/axiosInstance.ts` - Token attachment

### Backend
- `backend/src/middleware/authMiddleware.ts` - Token validation
- `backend/src/controllers/authController.ts` - Login logic
- `backend/.env` - JWT_SECRET

---

## 🔧 Common Commands

### Backend Console
```bash
# Check OTP (after registration)
# Look for: 🔐 [REGISTER] Generated OTP for EMAIL : XXXXXX

# Check token validation
# Look for: [protect] ✅ User authenticated: EMAIL Role: ROLE
```

### Browser Console
```javascript
// Check session
localStorage.getItem('token')

// Check role
JSON.parse(localStorage.getItem('user')).role

// Logout
localStorage.clear(); location.reload();
```

---

## ⚡ Quick Actions

### Test Admin Access
1. Go to `/auth/admin`
2. Login with admin credentials
3. Should redirect to `/dashboard`
4. Check console: `localStorage.getItem('isAdmin')` → `"true"`

### Test Donor Access
1. Register at `/become-donor`
2. Get OTP from backend console
3. Verify at `/verify-otp`
4. Login at `/login`
5. Should redirect to `/donor-form` or `/home`

### Test Unauthorized Access
1. Login as donor
2. Try accessing `/dashboard`
3. Should redirect to `/home`
4. Check console for security logs

---

## 📊 Status Indicators

### ✅ Session Valid
- Token exists in localStorage
- Token not expired
- User data present
- Role matches route requirements

### ❌ Session Invalid
- No token in localStorage
- Token expired
- User data missing
- Role doesn't match route

---

## 🎯 Remember

1. **Admin**: Hardcoded credentials, no email verification
2. **Donor**: Email verification required before login
3. **Token**: 30-day expiry, stored in localStorage
4. **OTP**: Now visible in backend console!
5. **Protection**: Both frontend and backend validation

---

## 📚 Full Documentation

- `SESSION_MANAGEMENT_ANALYSIS.md` - Complete technical guide
- `SESSION_FLOW_DIAGRAM.md` - Visual flow diagrams
- `SESSION_CHECK_SUMMARY.md` - Detailed summary

---

## ✨ Quick Copy-Paste

### Check Session (Browser Console)
```javascript
console.log({
  token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  isAdmin: localStorage.getItem('isAdmin'),
  tokenExpiry: (() => {
    const token = localStorage.getItem('token');
    if (!token) return 'NO TOKEN';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000).toLocaleString();
  })()
});
```

### Test API Call (Browser Console)
```javascript
fetch('http://localhost:3001/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log);
```

---

**Your session management is working perfectly! 🎉**
