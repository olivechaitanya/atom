# AtomQuest - In-House Goal Setting & Tracking Portal

A full-stack enterprise-grade web application for digitizing the entire employee goal lifecycle - from creation and alignment to quarterly tracking and performance analytics.

Built for **ATOMQUEST HACKATHON 1.0**

## 🚀 Tech Stack

### Frontend
- **React 19.2.6** with TypeScript
- **Vite 8.0.12** for build tooling
- **Zustand** for state management
- **Recharts** for data visualization
- **Lucide React** for icons
- **Tailwind CSS** for styling (custom dark theme)

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM**
- **JWT** authentication
- **express-validator** for request validation

## ✨ Features

### Core Functionality
- ✅ **Authentication & RBAC** - Secure login with role-based access (Employee, Manager, Admin)
- ✅ **Goal Creation** - Create goals with real-time weightage validation (100% total, min 10% per goal, max 8 goals)
- ✅ **Manager Approval Workflow** - Approve/reject goal sheets with inline editing and comments
- ✅ **Quarterly Check-ins** - Track achievements with status updates (Not Started, On Track, Completed)
- ✅ **Progress Calculation Engine** - Support for Numeric, Percentage, Timeline, and Zero-based UoM types
- ✅ **Audit Trail** - Immutable logging of all changes
- ✅ **Notifications System** - Real-time notifications for approvals, submissions, and reminders
- ✅ **Shared Goals** - Department-level KPIs pushed to multiple employees
- ✅ **Analytics Dashboard** - QoQ trends, department performance, goal distribution
- ✅ **Reports** - CSV export with filtering and detailed breakdowns
- ✅ **Admin Panel** - User management, escalations, audit logs, cycle configuration

## 📁 Project Structure

```
atom-quest/
├── backend/                 # Node.js/Express API
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Calculation utilities
│   │   ├── seed.js          # Demo data seeding
│   │   └── server.js        # Express server
│   └── package.json
├── src/                     # React Frontend
│   ├── components/          # Reusable components
│   ├── pages/               # Page components
│   ├── services/            # API client
│   ├── store.ts             # Zustand state management
│   ├── types.ts             # TypeScript types
│   ├── data.ts              # Demo data & utilities
│   └── main.tsx
└── package.json
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/atomquest?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev --name init
```

6. Seed database with demo data:
```bash
npm run seed
```

7. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👤 Demo Credentials

After seeding the database, use these credentials:

- **Admin**: admin@atomquest.com / demo123
- **Manager**: sarah.mgr@atomquest.com / demo123
- **Employee**: john.emp@atomquest.com / demo123
- **Employee**: jane.emp@atomquest.com / demo123
- **Employee**: raj.emp@atomquest.com / demo123

## 🎯 User Roles

### Employee
- Create and edit personal goals
- Submit goal sheets for approval
- Update quarterly achievements
- View personal dashboard and reports

### Manager
- Review and approve team goal sheets
- Edit targets and weightages inline
- Reject/return sheets for rework
- View team analytics and progress
- Conduct quarterly check-ins

### Admin
- Manage all users and goal sheets
- Configure goal cycles and deadlines
- View audit logs and escalations
- Unlock locked goal sheets
- Organization-wide analytics

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Goal Sheets
- `GET /api/goalsheets` - Get all goal sheets
- `POST /api/goalsheets` - Create goal sheet
- `POST /api/goalsheets/:id/submit` - Submit for approval
- `POST /api/goalsheets/:id/approve` - Approve sheet
- `POST /api/goalsheets/:id/reject` - Reject sheet
- `POST /api/goalsheets/:id/unlock` - Unlock sheet (admin)

### Goals
- `POST /api/goals` - Add goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Achievements
- `PUT /api/achievements` - Update achievement

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

See [backend/README.md](./backend/README.md) for complete API documentation.

## 🧪 Testing

```bash
# Frontend linting
npm run lint

# Frontend build
npm run build

# Frontend preview
npm run preview
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Connect your Git repository
2. Configure build command: `npm run build`
3. Set environment variable: `VITE_API_URL`

### Backend (Railway/Render/AWS)
1. Deploy the backend folder
2. Set environment variables
3. Configure PostgreSQL database
4. Run migrations: `npx prisma migrate deploy`
5. Seed database: `npm run seed`

## 📝 License

This project is created for ATOMQUEST HACKATHON 1.0

## 🤝 Contributing

This is a hackathon project. For improvements or issues, please create an issue in the repository.
