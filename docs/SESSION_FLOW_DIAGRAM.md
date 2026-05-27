# 🔐 Session Management Flow Diagrams

## Admin Login & Session Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

User visits /auth/admin
         │
         ▼
┌────────────────────┐
│  Enter Credentials │
│  ID: mukunday@...  │
│  Password: ****    │
└────────┬───────────┘
         │
         ▼
POST /api/auth/admin-login
         │
         ▼
┌────────────────────────────────┐
│  Backend Validates             │
│  ✓ Check hardcoded credentials │
│  ✓ Find/Create user in DB      │
│  ✓ Generate JWT (30d expiry)   │
└────────┬───────────────────────┘
         │
         ▼
Response: { token, admin: { id, email, role: 'ADMIN' } }
         │
         ▼
┌────────────────────────────────┐
│  Frontend Stores in localStorage│
│  • token                        │
│  • user (JSON)                  │
│  • isAdmin = 'true'             │
└────────┬───────────────────────┘
         │
         ▼
Redirect to /dashboard
         │
         ▼
┌────────────────────────────────┐
│  AdminProtected Component      │
│  ✓ Check isAuthenticated       │
│  ✓ Check isAdmin()              │
│  ✓ Render dashboard            │
└────────────────────────────────┘
```

## Donor Login & Session Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DONOR LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

User visits /login
         │
         ▼
┌────────────────────┐
│  Enter Credentials │
│  Email: donor@...  │
│  Password: ****    │
└────────┬───────────┘
         │
         ▼
POST /api/auth/login
         │
         ▼
┌────────────────────────────────┐
│  Backend Validates             │
│  ✓ Find user by email          │
│  ✓ Check emailVerified         │
│  ✓ Compare password hash       │
│  ✓ Generate JWT (30d expiry)   │
└────────┬───────────────────────┘
         │
         ├─── emailVerified = false ───┐
         │                             │
         │                             ▼
         │                    Return 403 Error
         │                    "Please verify email"
         │                             │
         │                             ▼
         │                    Frontend redirects to
         │                    /verify-otp
         │
         ▼
emailVerified = true
         │
         ▼
Response: { token, user: { id, email, role: 'DONOR' } }
         │
         ▼
┌────────────────────────────────┐
│  Frontend Stores in localStorage│
│  • token                        │
│  • user (JSON)                  │
│  • NO isAdmin flag              │
└────────┬───────────────────────┘
         │
         ▼
Redirect to /donor-form (if no profile)
    or /home (if profile exists)
         │
         ▼
┌────────────────────────────────┐
│  Route Protection              │
│  ✓ Check token exists          │
│  ✓ Check role = 'DONOR'        │
│  ✓ Render donor content        │
└────────────────────────────────┘
```

## API Request Flow with Token

```
┌─────────────────────────────────────────────────────────────────────┐
│                    API REQUEST WITH TOKEN                            │
└─────────────────────────────────────────────────────────────────────┘

Frontend makes API call
(e.g., GET /api/donors)
         │
         ▼
┌────────────────────────────────┐
│  Axios Request Interceptor     │
│  1. Get token from localStorage│
│  2. Attach to Authorization    │
│     header: "Bearer <token>"   │
└────────┬───────────────────────┘
         │
         ▼
Request sent to backend
         │
         ▼
┌────────────────────────────────┐
│  Backend Auth Middleware       │
│  1. Extract Authorization      │
│  2. Verify Bearer format       │
│  3. Extract token              │
│  4. Verify JWT signature       │
│  5. Check expiry               │
│  6. Find user in DB            │
│  7. Attach user to req.user    │
└────────┬───────────────────────┘
         │
         ├─── Token Invalid ───┐
         │                     │
         │                     ▼
         │            Return 401 Unauthorized
         │                     │
         │                     ▼
         │            Frontend catches error
         │            Redirects to login
         │
         ▼
Token Valid
         │
         ▼
┌────────────────────────────────┐
│  Route Handler                 │
│  • Access req.user             │
│  • Check role if needed        │
│  • Process request             │
│  • Return response             │
└────────────────────────────────┘
```

## Session Validation on Page Load

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PAGE LOAD SESSION CHECK                           │
└─────────────────────────────────────────────────────────────────────┘

User navigates to protected route
(e.g., /dashboard or /home)
         │
         ▼
┌────────────────────────────────┐
│  Component Mounts              │
│  useAuth() hook executes       │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Check localStorage            │
│  • token exists?               │
│  • user data exists?           │
└────────┬───────────────────────┘
         │
         ├─── No Token ───┐
         │                │
         │                ▼
         │       Redirect to login
         │
         ▼
Token Exists
         │
         ▼
┌────────────────────────────────┐
│  Parse User Data               │
│  • Get role                    │
│  • Get isAdmin flag            │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  AdminProtected Component      │
│  (for admin routes)            │
│                                │
│  ✓ isAuthenticated?            │
│  ✓ isAdmin()?                  │
│    - Check isAdmin flag        │
│    - Check role = 'ADMIN'      │
└────────┬───────────────────────┘
         │
         ├─── Not Admin ───┐
         │                 │
         │                 ▼
         │        If role = 'DONOR'
         │        → Redirect to /home
         │        Else
         │        → Redirect to /auth/admin
         │
         ▼
Admin Verified
         │
         ▼
Render Protected Content
```

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TOKEN LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────────┘

Login Successful
         │
         ▼
┌────────────────────────────────┐
│  JWT Token Generated           │
│  • Payload: { id: userId }     │
│  • Secret: JWT_SECRET          │
│  • Expiry: 30 days             │
│  • Algorithm: HS256            │
└────────┬───────────────────────┘
         │
         ▼
Token sent to frontend
         │
         ▼
┌────────────────────────────────┐
│  Stored in localStorage        │
│  Key: 'token'                  │
│  Value: 'eyJhbGc...'           │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Token Usage (30 days)         │
│  • Attached to every API call  │
│  • Validated by backend        │
│  • User stays logged in        │
└────────┬───────────────────────┘
         │
         ├─── Day 30 ───┐
         │              │
         │              ▼
         │     Token Expires
         │              │
         │              ▼
         │     Next API call fails
         │     with 401 Unauthorized
         │              │
         │              ▼
         │     Frontend redirects
         │     to login
         │
         ├─── User Logs Out ───┐
         │                     │
         │                     ▼
         │            localStorage.clear()
         │            Token removed
         │                     │
         │                     ▼
         │            Redirect to login
         │
         ▼
Token remains valid
(continues to work)
```

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ROLE-BASED ACCESS CONTROL                          │
└─────────────────────────────────────────────────────────────────────┘

API Request with Token
         │
         ▼
┌────────────────────────────────┐
│  protect Middleware            │
│  ✓ Validates token             │
│  ✓ Attaches req.user           │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  authorize Middleware          │
│  authorize('ADMIN', 'DONOR')   │
└────────┬───────────────────────┘
         │
         ▼
Check req.user.role
         │
         ├─── role = 'ADMIN' ───┐
         │                      │
         │                      ▼
         │              ✅ Access Granted
         │              Continue to handler
         │
         ├─── role = 'DONOR' ───┐
         │                      │
         │                      ▼
         │              ✅ Access Granted
         │              Continue to handler
         │
         ├─── role = 'OTHER' ───┐
         │                      │
         │                      ▼
         │              ❌ 403 Forbidden
         │              "Requires: ADMIN, DONOR"
         │
         ▼
Route Handler Executes
```

## Frontend Route Protection

```
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND ROUTE PROTECTION                           │
└─────────────────────────────────────────────────────────────────────┘

                    User Navigates
                          │
                          ▼
              ┌───────────────────────┐
              │   Route Type?         │
              └───────┬───────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   Public Route   Admin Route   Donor Route
   /login         /dashboard    /home
   /about         /donors       /profile
        │             │             │
        │             ▼             │
        │    ┌──────────────┐      │
        │    │AdminProtected│      │
        │    └──────┬───────┘      │
        │           │              │
        │           ▼              │
        │    Check Session         │
        │           │              │
        │     ┌─────┴─────┐        │
        │     │           │        │
        │     ▼           ▼        │
        │  Valid      Invalid      │
        │  Admin      Session      │
        │     │           │        │
        │     ▼           ▼        │
        │  Render    Redirect      │
        │  Content   /auth/admin   │
        │                          │
        ▼                          ▼
   Render                    Check Session
   Public                          │
   Content                   ┌─────┴─────┐
                             │           │
                             ▼           ▼
                          Valid      Invalid
                          Donor      Session
                             │           │
                             ▼           ▼
                          Render    Redirect
                          Content   /login
```

## Session Storage Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    localStorage STRUCTURE                            │
└─────────────────────────────────────────────────────────────────────┘

localStorage
    │
    ├── token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    │   │
    │   └── JWT Token (30-day expiry)
    │       • Header: { alg: "HS256", typ: "JWT" }
    │       • Payload: { id: "user-id", iat: 1234567890, exp: 1237159890 }
    │       • Signature: HMACSHA256(header + payload, JWT_SECRET)
    │
    ├── user: '{"id":"...","email":"...","name":"...","role":"..."}'
    │   │
    │   └── User Object (JSON string)
    │       {
    │         "id": "cm3abc123",
    │         "email": "user@example.com",
    │         "name": "John Doe",
    │         "role": "ADMIN" | "DONOR",
    │         "isVerified": true
    │       }
    │
    └── isAdmin: "true" (only for admin users)
        │
        └── Admin Flag (string "true" or null)
            • Set during admin login
            • Used for quick admin check
            • Validated against user.role
```

## Security Checks Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                                 │
└─────────────────────────────────────────────────────────────────────┘

Layer 1: Frontend Route Protection
    ↓
    • AdminProtected component
    • useAuth() hook
    • localStorage checks
    • Role validation
    ↓
Layer 2: Axios Request Interceptor
    ↓
    • Token attachment
    • Authorization header
    • Request logging
    ↓
Layer 3: Backend Auth Middleware
    ↓
    • Token extraction
    • JWT verification
    • Signature validation
    • Expiry check
    • User lookup in DB
    ↓
Layer 4: Role Authorization
    ↓
    • authorize() middleware
    • Role matching
    • Permission check
    ↓
Layer 5: Route Handler
    ↓
    • Business logic
    • Data access
    • Response generation

✅ All layers must pass for successful request
❌ Any layer failure → Redirect to login
```
