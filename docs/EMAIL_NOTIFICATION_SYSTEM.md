# Email Notification System for Donor Verification

## 🎯 Overview

Complete email notification system for donor verification workflow with automatic emails sent at each stage.

## ✨ Features Implemented

### 1. **Rejection Email** ✅
When admin rejects a donor profile, an automatic email is sent to the donor.

**Trigger**: Admin clicks "Reject" and submits rejection reason

**Email Content**:
- Subject: "Donor Profile Verification Update"
- Rejection reason displayed prominently
- Instructions on how to request re-verification
- Link to profile page
- Professional, empathetic tone

### 2. **Approval Email** ✅
When admin approves a donor profile, an automatic email is sent to the donor.

**Trigger**: Admin clicks "Approve" for pending or re-verification request

**Email Content**:
- Subject: "✅ Donor Profile Verified - Welcome!"
- Congratulations message
- Next steps for the donor
- Link to dashboard
- Welcome to the community

### 3. **Re-verification Request Notification** ✅
When a rejected donor requests re-verification, admin receives a notification email.

**Trigger**: Donor clicks "Request Re-verification" from their profile

**Email Content**:
- Subject: "🔄 New Re-verification Request"
- Donor's name and email
- Donor's message (if provided)
- Link to admin verification page
- Call to action to review

## 📧 Email Templates

### **Rejection Email Template**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🩸 Blood Donation System                                    │
│ Donor Profile Verification Update                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Hello [Donor Name],                                          │
│                                                              │
│ After reviewing your donor profile, we regret to inform     │
│ you that your profile verification could not be completed.  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📋 Reason for Rejection:                             │   │
│ │ [Rejection Reason Text]                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ 🔄 What You Can Do:                                         │
│ • Review the rejection reason carefully                     │
│ • Update your profile information if needed                 │
│ • Request re-verification from your profile page            │
│ • Contact our support team if you have questions            │
│                                                              │
│ [Go to Profile Button]                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Approval Email Template**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🎉 Congratulations!                                          │
│ Your Donor Profile is Verified                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Hello [Donor Name],                                          │
│                                                              │
│ Great news! Your donor profile has been successfully        │
│ verified by our team.                                        │
│                                                              │
│ ✅ You are now a verified blood donor!                      │
│                                                              │
│ What's Next?                                                 │
│ • Access your donor dashboard                               │
│ • View upcoming blood donation events                       │
│ • Schedule your donation appointments                       │
│ • Track your donation history                               │
│ • Earn certificates for your contributions                  │
│                                                              │
│ [Go to Dashboard Button]                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Re-verification Request Notification (to Admin)**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 Re-verification Request                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ New Re-verification Request                                  │
│                                                              │
│ A rejected donor has requested re-verification.             │
│                                                              │
│ Donor Information:                                           │
│ • Name: [Donor Name]                                        │
│ • Email: [Donor Email]                                      │
│                                                              │
│ Donor's Message:                                             │
│ [Message from donor explaining changes]                     │
│                                                              │
│ [Review Request Button]                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Workflow with Emails

### **Scenario 1: Donor Rejection**
```
1. Admin reviews pending donor
   ↓
2. Admin clicks "Reject"
   ↓
3. Admin enters rejection reason
   ↓
4. Admin clicks "Reject Donor"
   ↓
5. Backend updates donor status to REJECTED
   ↓
6. 📧 Rejection email sent to donor automatically
   ↓
7. Donor receives email with rejection reason
   ↓
8. Email includes link to profile page
```

### **Scenario 2: Donor Requests Re-verification**
```
1. Rejected donor logs in
   ↓
2. Donor sees rejection alert in profile
   ↓
3. Donor clicks "Request Re-verification"
   ↓
4. Donor enters optional message
   ↓
5. Donor clicks "Submit Request"
   ↓
6. Backend updates reverificationRequested = true
   ↓
7. 📧 Notification email sent to admin automatically
   ↓
8. Admin receives email with donor's request
   ↓
9. Email includes link to review page
```

### **Scenario 3: Admin Approves Re-verification**
```
1. Admin goes to pending donors page
   ↓
2. Admin clicks "Rejected" tab
   ↓
3. Admin sees donor with re-verification request
   ↓
4. Admin clicks "Approve Re-verification"
   ↓
5. Backend updates status to VERIFIED
   ↓
6. 📧 Approval email sent to donor automatically
   ↓
7. Donor receives congratulations email
   ↓
8. Email includes link to dashboard
```

## 🛠️ Technical Implementation

### **Backend Changes**:

#### **1. Email Service Functions** (`emailService.ts`):
```typescript
// Send rejection email
sendDonorRejectionEmail(email, name, rejectionReason)

// Send approval email
sendDonorApprovalEmail(email, name)

// Send re-verification notification to admin
sendReverificationRequestEmail(adminEmail, donorName, donorEmail, message)
```

#### **2. Donor Controller Updates**:

**Reject Donor**:
```typescript
export const rejectDonor = async (req, res) => {
  // ... update donor status ...
  
  // Send rejection email
  await sendDonorRejectionEmail(
    donor.user.email,
    donor.user.name,
    rejectionReason
  );
  
  res.json({ message: "Donor rejected. Rejection email sent." });
};
```

**Approve Donor**:
```typescript
export const approveDonor = async (req, res) => {
  // ... update donor status ...
  
  // Send approval email
  await sendDonorApprovalEmail(
    donor.user.email,
    donor.user.name
  );
  
  res.json({ message: "Donor verified. Approval email sent." });
};
```

**Request Re-verification**:
```typescript
export const requestReverification = async (req, res) => {
  // ... update donor ...
  
  // Send notification to admin
  await sendReverificationRequestEmail(
    adminEmail,
    donor.user.name,
    donor.user.email,
    reverificationMessage
  );
  
  res.json({ message: "Re-verification request submitted." });
};
```

### **Environment Variables**:

Added to `.env`:
```env
# Admin Email (for notifications)
ADMIN_EMAIL=Poudelashish0718@gmail.com
```

## 📊 Email Sending Logic

### **Error Handling**:
- Emails are sent asynchronously
- If email fails, operation still succeeds
- Errors are logged but don't block the process
- User sees success message regardless

### **Email Configuration**:
- Uses existing Gmail SMTP setup
- Same credentials as OTP emails
- Professional HTML templates
- Responsive design
- Mobile-friendly

## ✅ Features Summary

### **1. Automatic Rejection Email** ✅
- Sent when admin rejects donor
- Includes rejection reason
- Provides re-verification instructions
- Links to profile page

### **2. Automatic Approval Email** ✅
- Sent when admin approves donor
- Congratulations message
- Next steps guidance
- Links to dashboard

### **3. Admin Notification Email** ✅
- Sent when donor requests re-verification
- Includes donor information
- Shows donor's message
- Links to review page

### **4. Professional Templates** ✅
- HTML email templates
- Branded with system colors
- Clear call-to-action buttons
- Responsive design

### **5. Error Handling** ✅
- Graceful email failures
- Operations succeed even if email fails
- Detailed logging
- No user-facing errors

## 🎯 User Experience

### **For Donors**:
1. **Rejection**: Receive clear explanation via email
2. **Re-verification**: Easy process from profile page
3. **Approval**: Congratulations email with next steps
4. **Transparency**: Always informed of status changes

### **For Admins**:
1. **Notifications**: Alerted when re-verification requested
2. **Context**: See donor's message in email
3. **Quick Access**: Direct links to review page
4. **Efficiency**: No manual email sending needed

## 🚀 Testing

### **Test Rejection Email**:
1. Go to pending donors page
2. Select a donor
3. Click "Reject"
4. Enter reason: "Incomplete address information"
5. Submit
6. Check donor's email inbox
7. Verify rejection email received

### **Test Re-verification Request**:
1. Login as rejected donor
2. Go to profile page
3. Click "Request Re-verification"
4. Enter message
5. Submit
6. Check admin email inbox
7. Verify notification received

### **Test Approval Email**:
1. Go to pending donors page
2. Click "Rejected" tab
3. Find donor with re-verification request
4. Click "Approve Re-verification"
5. Confirm
6. Check donor's email inbox
7. Verify approval email received

## 📝 Email Content Customization

All email templates can be customized in `emailService.ts`:
- Subject lines
- Body content
- Button text
- Colors and styling
- Footer information

## 🎉 Benefits

1. **Automated Communication**: No manual email sending
2. **Professional**: Branded, well-designed emails
3. **Transparent**: Donors always know their status
4. **Efficient**: Admins notified of re-verification requests
5. **User-Friendly**: Clear instructions and links
6. **Reliable**: Error handling ensures operations succeed

## 🔐 Security

- Emails sent via secure Gmail SMTP
- No sensitive data in email content
- Links use HTTPS (in production)
- Admin email configurable via environment variable
- Donor email addresses from verified database

## 📧 Email Delivery

- Emails sent immediately after action
- Asynchronous to avoid blocking
- Logged for debugging
- Graceful failure handling
- No retry logic (one-time send)

## ✨ Summary

Complete email notification system implemented with:
- ✅ Rejection emails with reason
- ✅ Approval/congratulations emails
- ✅ Admin notification for re-verification requests
- ✅ Professional HTML templates
- ✅ Automatic sending on actions
- ✅ Error handling and logging
- ✅ Mobile-responsive design
- ✅ Clear call-to-action buttons
- ✅ Configurable admin email

All emails are sent automatically when admins take actions or donors request re-verification! 🚀
