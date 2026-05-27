# Implementation Plan - New Features

## 🎯 Features to Implement

### **1. Unverify Button for Verified Donors** ✅
**Location**: `/admin-public/pending-donors` - Verified tab

**Features**:
- Add "Unverify" button on verified donor cards
- Dialog to enter unverification reason
- Send email notification to donor
- Update donor status to REJECTED
- Show reason in donor profile

**Backend**:
- Add `unverifyDonor` endpoint
- Add `sendDonorUnverificationEmail` function
- Update donor status and add reason

**Frontend**:
- Add "Unverify" button to verified donor cards
- Create unverify dialog
- Handle unverify action

---

### **2. Notification System** ✅
**Location**: `/home` page (donor dashboard)

**Notification Types**:
- Event alerts (new events, event reminders)
- Blood request notifications
- Verification status changes (approved/rejected)
- Certificate earned notifications
- Donation reminders

**Backend**:
- Create `Notification` model in schema
- Add notification endpoints
- Create notifications on events:
  - Donor verified/rejected
  - New event created
  - Blood requested
  - Certificate issued

**Frontend**:
- Add notification bell icon in header
- Show unread count badge
- Notification dropdown/panel
- Mark as read functionality
- Real-time updates (optional)

---

### **3. 90-Day Countdown Timer** ✅
**Location**: `/home` page - Right corner below donor ID

**Features**:
- Calculate days until next eligible donation
- Visual countdown display
- Color-coded status:
  - Red: Not eligible yet
  - Yellow: Almost eligible (< 7 days)
  - Green: Eligible now
- Progress bar or circular progress
- Animated countdown

**Logic**:
- Last donation date + 90 days = next eligible date
- Calculate remaining days
- Update daily

---

### **4. Enhanced Home Page UI** ✅
**Location**: `/home` page

**Improvements**:
- Add shadcn animations
- Smooth transitions
- Hover effects
- Card animations
- Loading skeletons
- Better color scheme
- Improved layout
- Responsive design
- Interactive elements

**Components to Enhance**:
- Statistics cards (with animations)
- Profile card (with hover effects)
- Events section (with transitions)
- Recent donations (with animations)
- Quick actions (with hover states)

---

## 📋 Implementation Order

### **Phase 1: Backend Setup** (Priority: High)
1. Create Notification model in schema
2. Add unverify endpoint
3. Add notification endpoints
4. Add email functions
5. Run migrations

### **Phase 2: Unverify Feature** (Priority: High)
1. Add unverify button to verified donors
2. Create unverify dialog
3. Implement unverify logic
4. Test email notifications

### **Phase 3: Notification System** (Priority: Medium)
1. Create notification components
2. Add notification bell icon
3. Implement notification dropdown
4. Add notification creation logic
5. Test notifications

### **Phase 4: Countdown Timer** (Priority: Medium)
1. Create countdown component
2. Calculate eligibility logic
3. Add visual indicators
4. Add animations
5. Position in layout

### **Phase 5: UI Enhancements** (Priority: Low)
1. Add shadcn animations
2. Improve card designs
3. Add hover effects
4. Add transitions
5. Improve responsiveness
6. Test on different screens

---

## 🗄️ Database Schema Changes

### **New Model: Notification**
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  link        String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

enum NotificationType {
  EVENT_ALERT
  BLOOD_REQUEST
  VERIFICATION_APPROVED
  VERIFICATION_REJECTED
  CERTIFICATE_EARNED
  DONATION_REMINDER
  GENERAL
}
```

---

## 📧 New Email Templates

### **1. Unverification Email**
```
Subject: Donor Profile Unverified - Action Required
Content:
- Unverification notice
- Reason for unverification
- Steps to re-verify
- Contact support link
```

---

## 🎨 UI Components to Create

### **1. NotificationBell Component**
- Bell icon with badge
- Unread count
- Dropdown on click
- List of notifications
- Mark as read button

### **2. CountdownTimer Component**
- Circular progress or card
- Days remaining
- Color-coded status
- Animated numbers
- Eligibility message

### **3. Enhanced Cards**
- Animated statistics cards
- Hover effects
- Smooth transitions
- Loading states
- Interactive elements

---

## 🚀 Implementation Timeline

**Day 1**: Backend setup (schema, migrations, endpoints)
**Day 2**: Unverify feature (button, dialog, email)
**Day 3**: Notification system (model, endpoints, UI)
**Day 4**: Countdown timer (component, logic, animations)
**Day 5**: UI enhancements (animations, effects, polish)

---

## ✅ Testing Checklist

### **Unverify Feature**:
- [ ] Button appears on verified donors
- [ ] Dialog opens with reason input
- [ ] Unverify succeeds
- [ ] Email sent to donor
- [ ] Donor status changes to REJECTED
- [ ] Reason visible in profile

### **Notification System**:
- [ ] Notifications created on events
- [ ] Bell icon shows unread count
- [ ] Dropdown shows notifications
- [ ] Mark as read works
- [ ] Notifications persist

### **Countdown Timer**:
- [ ] Timer shows correct days
- [ ] Colors change based on status
- [ ] Animation works
- [ ] Updates correctly
- [ ] Positioned correctly

### **UI Enhancements**:
- [ ] Animations smooth
- [ ] Hover effects work
- [ ] Responsive on mobile
- [ ] Loading states show
- [ ] No performance issues

---

## 📝 Notes

- Use shadcn/ui components for consistency
- Add framer-motion for animations
- Keep email templates professional
- Test on different screen sizes
- Ensure accessibility
- Add loading states
- Handle errors gracefully

---

This is a comprehensive implementation that will significantly enhance the user experience! 🚀
