# 🩸 Blood Bank Management System

A comprehensive web-based blood bank management system built with Next.js, Express, and PostgreSQL.

## 📁 Project Structure

```
blood-bank-management/
├── backend/              # Backend API (Node.js + Express + Prisma)
│   ├── src/             # Source code
│   ├── prisma/          # Database schema and migrations
│   └── docs/            # Backend documentation
│
├── frontend/            # Frontend (Next.js + React + TailwindCSS)
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/            # Utilities and queries
│   └── docs/           # Frontend documentation
│
└── docs/               # General documentation
```

## 📚 Documentation

### 📖 Main Documentation Folders

- **[Backend Documentation](./backend/docs/)** - API, database, authentication, testing
- **[Frontend Documentation](./frontend/docs/)** - Pages, components, features, guides
- **[General Documentation](./docs/)** - Workflows, processes, testing checklists

### 🔍 Quick Access

#### Backend
- [Authentication API](./backend/docs/AUTH_API.md)
- [Database Setup](./backend/docs/DATABASE_FIX.md)
- [Blood Collection API](./backend/docs/BLOOD_COLLECTION_IMPLEMENTATION.md)
- [Testing Guide](./backend/docs/POSTMAN_TESTING_GUIDE.md)

#### Frontend
- [Authentication Flow](./frontend/docs/AUTHENTICATION_FLOW.md)
- [Blood Stock Page](./frontend/docs/BLOOD_STOCK_DYNAMIC_UPDATE.md)
- [Donors Page](./frontend/docs/DONORS_PAGE_UPDATE.md)
- [TanStack Query Guide](./frontend/docs/TANSTACK_QUERY_GUIDE.md)

#### General
- [Blood Donation Workflow](./docs/CORRECT_BLOOD_WORKFLOW.md)
- [Testing Checklist](./docs/TESTING_CHECKLIST.md)
- [Project Summary](./docs/FIXES_SUMMARY.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blood-bank-management
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npx prisma db push
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your .env.local file
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## ✨ Key Features

### 🩸 Blood Management
- ✅ Blood collection from donors
- ✅ Blood stock tracking by group
- ✅ Blood distribution to hospitals
- ✅ Expiry date monitoring
- ✅ Low stock alerts

### 👥 Donor Management
- ✅ Donor registration (web & walk-in)
- ✅ Donor profiles with location
- ✅ Donation history tracking
- ✅ Eligibility status
- ✅ Search and filter donors

### 📅 Event Management
- ✅ Blood donation events
- ✅ Participant registration
- ✅ Volunteer management
- ✅ Event tracking

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Donor, Admin, Staff)
- ✅ Protected routes
- ✅ User profile management

### 📊 Dashboard & Reports
- ✅ Real-time blood stock overview
- ✅ Donation statistics
- ✅ Low stock alerts
- ✅ Recent activities

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Zod

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** TanStack Query
- **Forms:** React Hook Form
- **Maps:** Leaflet
- **Notifications:** Sonner

## 📱 User Roles

### 👤 Donor
- Register and create profile
- View donation history
- Register for events
- View certificates

### 👨‍💼 Admin/Staff
- Manage blood stock
- Record blood collections
- Issue blood to hospitals
- Manage donors
- Organize events
- Generate certificates

## 🔄 Blood Flow Process

### Collection
```
Donor → Blood Bank → Record Donation → Create Blood Pack → Update Stock
```

### Distribution
```
Hospital Request → Check Stock → Issue Blood → Update Pack Status → Decrease Stock
```

## 🧪 Testing

See [Testing Checklist](./docs/TESTING_CHECKLIST.md) for complete testing guide.

### Run Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 API Documentation

API documentation is available at:
- [Authentication API](./backend/docs/AUTH_API.md)
- [Postman Collection](./backend/Blood_Donation_Auth_API.postman_collection.json)

## 🤝 Contributing

1. Read the documentation in respective folders
2. Follow the coding standards
3. Write tests for new features
4. Update documentation

## 📄 License

[Add your license here]

## 👥 Team

[Add team members here]

## 📞 Support

For detailed documentation, refer to:
- [Backend Docs](./backend/docs/)
- [Frontend Docs](./frontend/docs/)
- [General Docs](./docs/)

---

**Note:** This is a comprehensive blood bank management system designed to streamline blood donation, storage, and distribution processes.
