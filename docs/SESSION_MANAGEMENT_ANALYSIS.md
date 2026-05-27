# 🔐 Session Management Analysis

## Overview

Your application uses **JWT (JSON Web Token) based authentication** with localStorage for session management. Here's a complete analysis of how sessions work for both Admin and Donor users.

## 🏗️ Architecture

### Backend (JWT-based)
- **Token Generation**: JWT tokens with 30-day expiry
- **Token Verification**: Middleware validates tokens on protected routes
- **Token Storage**: Client-side (localStorage)
- **Secret Key**: `JWT_SECRET` in `.env`

### Frontend (localStorage-based)
- **Token Storage**: `localStorage.getItem('token')`
- **User Data**: `localStorage.getItem('user')`
- **Admin Flag**: `localStorage.getItem('isAdmin')`
- **Session Check**: On component mount and route changes

---

## 📊 Session Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN PROCESS                             │
└─────────────────────────────────────────────────────────────┘

1. User Login (Admin or Donor)
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT token (30-day expiry)
   ↓
4. Frontend receives: { token, user: { id, email, name, role } }
   ↓
5. Frontend stores in localStorage:
   - token
   - user (JSON string)
   - isAdmin (if admin)
   ↓
6. Axios interceptor attaches token to all requests
   ↓
7. Backend middleware validates token on protected routes

┌─────────────────────────────────────────────────────────────┐
│                  SESSION VALIDATION                          │
└─────────────────────────────────────────────────────────────┘

Every Protected Route:
   ↓
1. useAuth() hook checks localStorage
   ↓
2. AdminProtected/DonorProtected component validates
   ↓
3. If invalid → Redirect to login
   ↓
4. If valid → Render protected content
```

---

## 🔒 Admin Session Management

### Login Flow (`/auth/admin`)

**File**: `frontend/app/auth/admin/page.tsx`

```typescript
// Admin login stores:
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(admin));
localStorage.setItem('isAdmin', 'true');
```

### Protection Mechanism

**File**: `frontend/components/AdminProtected.tsx`

```typescript
export function AdminProtected({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // CHECK 1: Must be authenticated
    if (!isAuthenticated) {
      router.push('/auth/admin');
      return;
    }
    
    // CHECK 2: Must be admin
    if (!isAdmin()) {
      if (user?.role === 'DONOR') {
        router.push('/home');
      } else {
        router.push('/auth/admin');
      }
      return;
    }
  }, [user, isAuthenticated]);
  
  // Only render if authenticated AND admin
  if (isAuthenticated && isAdmin()) {
    return <>{children}</>;
  }
  
  return null;
}
```

### Admin Routes Protected

All routes under `/dashboard/*` are protected:
- `/dashboard` - Main dashboard
- `/dashboard/donors` - Donor management
- `/dashboard/blood-stock` - Blood inventory
- `/dashboard/events` - Event management
- `/dashboard/reports` - Reports
- etc.

### Admin Session Validation

**File**: `frontend/lib/auth.ts`

```typescript
export const isAdmin = (): boolean => {
  const isAdminFlag = localStorage.getItem('isAdmin') === 'true';
  const user = getUser();
  return isAdminFlag || user?.role === 'ADMIN';
};
```

**Checks**:
1. ✅ `isAdmin` flag in localStorage
2. ✅ User role is 'ADMIN'

---

## 👤 Donor Session Management

### Login Flow (`/login`)

**File**: `frontend/app/(public)/login/page.tsx`

```typescript
// Donor login stores:
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
// NO isAdmin flag
```

### Email Verification Check

```typescript
// Login checks if email is verified
if (user.role === 'DONOR' && !user.emailVerified) {
  return res.status(403).json({
    message: 'Please verify your email first',
    requiresEmailVerification: true
  });
}
```

### Donor Routes

Donor-specific routes:
- `/home` - Donor dashboard
- `/profile` - Donor profile
- `/donor-form` - Complete donor profile
- `/verification-request` - Request verification

### Donor Session Validation

**File**: `frontend/app/donor-form/page.tsx`

```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    router.push('/login');
    return;
  }
  
  const user = JSON.parse(userData);
  if (user.role !== 'DONOR') {
    router.push('/login');
    return;
  }
}, []);
```

---

## 🔐 Backend Token Validation

### Auth Middleware

**File**: `backend/src/middleware/authMiddleware.ts`

```typescript
export const protect = async (req, res, next) => {
  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // 2. Extract token
  const token = authHeader.split(' ')[1];
  
  // 3. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 4. Get user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });
  
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  // 5. Attach user to request
  req.user = user;
  next();
};
```

### Role-Based Authorization

```typescript
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden - Requires: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};
```

### Protected Routes Example

```typescript
// Admin only
router.get('/donors', protect, authorize('ADMIN'), getDonors);

// Donor only
router.post('/donor-profile', protect, authorize('DONOR'), createDonorProfile);

// Both admin and donor
router.get('/profile', protect, authorize('ADMIN', 'DONOR'), getProfile);
```

---

## 🔄 Axios Request Interceptor

**File**: `frontend/lib/axiosInstance.ts`

```typescript
axiosInstance.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = getToken();
  
  console.log('[axiosInstance] Request to:', config.url);
  console.log('[axiosInstance] Token found:', token ? 'YES' : 'NO');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[axiosInstance] NO TOKEN - Request will be unauthorized');
  }
  
  return config;
});
```

### Token Retrieval

```typescript
const getToken = (): string | null => {
  // Try direct localStorage
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;
  
  // Try Zustand persisted store (backward compatibility)
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error parsing auth storage:", error);
  }
  
  return null;
};
```

---

## ⚠️ Current Issues & Recommendations

### ✅ What's Working Well

1. **JWT Token Generation**: 30-day expiry, secure secret
2. **Backend Middleware**: Proper token validation
3. **Role-Based Access**: Admin vs Donor separation
4. **Frontend Protection**: AdminProtected component
5. **Axios Interceptor**: Automatic token attachment
6. **Console Logging**: Good debugging information

### ⚠️ Potential Issues

#### 1. **No Token Refresh Mechanism**
**Problem**: Tokens expire after 30 days, user must re-login
**Impact**: Poor UX for active users

**Recommendation**:
```typescript
// Add token refresh endpoint
POST /api/auth/refresh
{
  "refreshToken": "..."
}

// Response
{
  "token": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

#### 2. **localStorage Security**
**Problem**: Tokens stored in localStorage are vulnerable to XSS attacks
**Impact**: If XSS vulnerability exists, tokens can be stolen

**Recommendation**:
- Consider using httpOnly cookies for tokens
- Implement Content Security Policy (CSP)
- Add XSS protection headers

#### 3. **No Session Timeout**
**Problem**: No automatic logout after inactivity
**Impact**: Security risk if user leaves browser open

**Recommendation**:
```typescript
// Add inactivity timeout
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    logout();
    alert('Session expired due to inactivity');
  }, INACTIVITY_TIMEOUT);
};

// Reset on user activity
window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('keypress', resetInactivityTimer);
```

#### 4. **No Token Validation on Frontend**
**Problem**: Frontend doesn't verify token expiry
**Impact**: User might see protected content briefly before 401 error

**Recommendation**:
```typescript
import jwt_decode from 'jwt-decode';

export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  
  try {
    const decoded: any = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// Use in useAuth hook
useEffect(() => {
  if (isTokenExpired()) {
    clearAuth();
    router.push('/login');
  }
}, []);
```

#### 5. **Multiple Token Storage Locations**
**Problem**: Token can be in `localStorage.token` or `auth-storage`
**Impact**: Confusion, potential bugs

**Recommendation**: Standardize on one storage method

#### 6. **No CSRF Protection**
**Problem**: No CSRF tokens for state-changing operations
**Impact**: Vulnerable to CSRF attacks

**Recommendation**:
- Add CSRF tokens for POST/PUT/DELETE requests
- Use SameSite cookie attribute

---

## 🧪 Testing Session Management

### Test Admin Session

```bash
# 1. Login as admin
POST http://localhost:3001/api/auth/admin-login
{
  "id": "mukunday@gmail.com",
  "password": "muku"
}

# 2. Check localStorage
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('isAdmin'));

# 3. Try accessing protected route
GET http://localhost:3001/api/donors
Authorization: Bearer <token>

# 4. Try accessing without token (should fail)
GET http://localhost:3001/api/donors
# No Authorization header
```

### Test Donor Session

```bash
# 1. Register donor
POST http://localhost:3001/api/auth/register
{
  "name": "Test Donor",
  "email": "donor@test.com",
  "password": "test123",
  "phone": "9876543210"
}

# 2. Verify email with OTP
POST http://localhost:3001/api/otp/verify
{
  "email": "donor@test.com",
  "otp": "123456"
}

# 3. Login
POST http://localhost:3001/api/auth/login
{
  "email": "donor@test.com",
  "password": "test123"
}

# 4. Check localStorage
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('isAdmin')); // Should be null

# 5. Try accessing donor route
GET http://localhost:3001/api/auth/profile
Authorization: Bearer <token>
```

### Test Session Expiry

```javascript
// In browser console
// 1. Get current token
const token = localStorage.getItem('token');

// 2. Decode token to see expiry
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));
const decoded = JSON.parse(jsonPayload);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

### Test Role-Based Access

```bash
# 1. Login as donor
# 2. Try accessing admin route (should fail)
GET http://localhost:3001/api/donors
Authorization: Bearer <donor-token>

# Expected: 403 Forbidden

# 3. Login as admin
# 4. Try accessing admin route (should succeed)
GET http://localhost:3001/api/donors
Authorization: Bearer <admin-token>

# Expected: 200 OK with donor list
```

---

## 📋 Session Management Checklist

### Admin Dashboard
- [x] Login stores token in localStorage
- [x] Login stores user data in localStorage
- [x] Login sets isAdmin flag
- [x] AdminProtected component validates session
- [x] Redirects to /auth/admin if not authenticated
- [x] Redirects to /home if user is donor
- [x] Axios attaches token to requests
- [x] Backend validates token
- [x] Backend checks admin role
- [ ] Token refresh mechanism
- [ ] Session timeout
- [ ] Token expiry check on frontend

### Donor Dashboard
- [x] Login stores token in localStorage
- [x] Login stores user data in localStorage
- [x] Email verification required before login
- [x] Donor routes check authentication
- [x] Redirects to /login if not authenticated
- [x] Axios attaches token to requests
- [x] Backend validates token
- [x] Backend checks donor role
- [ ] Token refresh mechanism
- [ ] Session timeout
- [ ] Token expiry check on frontend

---

## 🔧 Recommended Improvements

### Priority 1: Security

1. **Add Token Expiry Check**
```typescript
// frontend/lib/auth.ts
import jwt_decode from 'jwt-decode';

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded: any = jwt_decode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

2. **Add Session Timeout**
```typescript
// frontend/hooks/useSessionTimeout.ts
export function useSessionTimeout(timeout = 30 * 60 * 1000) {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        alert('Session expired');
      }, timeout);
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [timeout]);
}
```

### Priority 2: User Experience

1. **Add Token Refresh**
```typescript
// backend/src/controllers/authController.ts
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  
  // Generate new access token
  const newToken = generateToken(decoded.id);
  
  res.json({ token: newToken });
};
```

2. **Add Remember Me**
```typescript
// Extend token expiry if "Remember Me" is checked
const tokenExpiry = rememberMe ? '30d' : '1d';
const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: tokenExpiry });
```

### Priority 3: Monitoring

1. **Add Session Logging**
```typescript
// Log all authentication events
console.log('[AUTH] User logged in:', user.email);
console.log('[AUTH] Token generated, expires:', expiryDate);
console.log('[AUTH] Session validated for:', user.email);
```

2. **Add Error Tracking**
```typescript
// Track authentication failures
if (error instanceof jwt.TokenExpiredError) {
  console.error('[AUTH] Token expired for user:', decoded.id);
  // Send to error tracking service
}
```

---

## 📊 Summary

### Current State: ✅ Good Foundation

Your session management is **functional and secure** with:
- JWT-based authentication
- Role-based access control
- Protected routes on frontend and backend
- Token validation middleware
- Proper error handling

### Recommended Enhancements: 🚀

1. **Add token refresh** for better UX
2. **Implement session timeout** for security
3. **Add token expiry validation** on frontend
4. **Consider httpOnly cookies** for tokens
5. **Add CSRF protection** for state-changing operations

### Overall Rating: 7/10

Good for development, needs enhancements for production.
