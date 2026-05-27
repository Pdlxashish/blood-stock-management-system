# Gallery Upload Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:3001`
2. Frontend server running on `http://localhost:3000`
3. Admin account credentials

## Test Steps

### 1. Admin Login
1. Navigate to `http://localhost:3000/auth/admin`
2. Enter admin credentials
3. Click "Sign In as Admin"
4. Verify redirect to dashboard
5. **Check browser console** - should see auth state logged

### 2. Navigate to Gallery Management
1. Go to `http://localhost:3000/admin-public/gallery`
2. Verify page loads without errors
3. Check that "Upload Image" button is visible (confirms admin status)
4. **Check browser console** - should see auth state with `isAdmin: true`

### 3. Upload New Image
1. Click "Upload Image" button
2. Select an image file (JPEG, PNG, GIF, WEBP, AVIF, or SVG)
3. Enter a title (required)
4. Enter a description (optional)
5. Check/uncheck "Publish immediately"
6. Click "Upload"
7. **Expected**: Success toast message "Image uploaded successfully"
8. **Expected**: Image appears in gallery grid
9. **Check browser console**: Should NOT see any 401 Unauthorized errors

### 4. Edit Existing Image
1. Click the edit button (pencil icon) on any image
2. Modify the title or description
3. Optionally upload a replacement image
4. Click "Save Changes"
5. **Expected**: Success toast message "Image updated successfully"
6. **Expected**: Changes are reflected in the gallery

### 5. Crop Image
1. Click the crop button (crop icon) on any image
2. Draw a crop area on the image
3. Click "Save Cropped Image"
4. **Expected**: Success toast message "Image cropped successfully"
5. **Expected**: Image is updated with cropped version

### 6. Toggle Publish Status
1. Click the eye/eye-off button on any image
2. **Expected**: Success toast message
3. **Expected**: Image status changes (Published/Unpublished badge)

### 7. Delete Image
1. Click the delete button (trash icon) on any image
2. Confirm deletion in the alert dialog
3. **Expected**: Success toast message "Image deleted successfully"
4. **Expected**: Image is removed from gallery

## Debugging

### If you still get "Unauthorized" errors:

1. **Check localStorage**:
   ```javascript
   // Open browser console and run:
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```

2. **Check Network Tab**:
   - Open DevTools → Network tab
   - Try uploading an image
   - Click on the `/api/gallery` request
   - Check "Request Headers" section
   - Verify `Authorization: Bearer <token>` is present

3. **Check Backend Logs**:
   - Look at the terminal running the backend
   - Should see the POST request logged
   - If you see "Unauthorized", check JWT_SECRET in backend/.env

4. **Verify JWT_SECRET**:
   ```bash
   # In backend directory
   cat .env | grep JWT_SECRET
   ```
   - Should have a value set
   - If missing, add: `JWT_SECRET=your-secret-key-here`

5. **Check Token Expiration**:
   - Tokens might expire after a certain time
   - Try logging out and logging back in
   - Then test upload again

### Common Issues

**Issue**: "Please login as admin to upload images"
- **Cause**: Auth store not hydrated or user role not ADMIN/STAFF
- **Fix**: Refresh page and wait for auth state to load

**Issue**: "Failed to upload image" with no specific error
- **Cause**: Backend not running or CORS issue
- **Fix**: Verify backend is running on port 3001

**Issue**: Image uploads but shows broken image icon
- **Cause**: Static file serving not configured
- **Fix**: Verify backend has `app.use('/uploads', express.static('uploads'))`

**Issue**: "Only image files are allowed!"
- **Cause**: Invalid file type
- **Fix**: Use JPEG, PNG, GIF, WEBP, AVIF, or SVG files only

## Success Criteria
✅ All operations complete without "Unauthorized" errors
✅ Images upload and display correctly
✅ Edit, crop, publish/unpublish, and delete all work
✅ No console errors related to authentication
✅ Network requests show Authorization header with valid token

## Additional Notes
- The fix uses `axiosInstance` which automatically includes the token from localStorage
- No changes were made to the authentication flow
- The token is still stored in both localStorage and Zustand store
- All other admin pages using `axiosInstance` will also work correctly
