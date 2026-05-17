# AtomQuest Backend API

Backend API for the AtomQuest Goal Tracking Portal - built with Node.js, Express, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your database in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/atomquest?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
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

6. Seed the database with demo data:
```bash
npm run seed
```

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:5000`

## Render Deployment

### Build Command
```bash
npm install
npm run build
npx prisma migrate deploy
npm run seed
```

### Start Command
```bash
npm start
```

### Environment Variables (Required on Render)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - Token expiration time (default: "7d")
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (set to "production")
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated, or "*" for all)

### Important Notes for Render
1. **Migrations**: The `npx prisma migrate deploy` command runs pending migrations on the production database
2. **Seeding**: The `npm run seed` command creates demo users if the database is empty
3. **Postinstall**: The `postinstall` script automatically runs `prisma generate` to create the Prisma client
4. **Database**: Ensure your PostgreSQL database is created and the DATABASE_URL is correctly set in Render environment variables

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register a new user (demo purposes)

### Users

- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users (admin/manager only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)

### Goal Sheets

- `GET /api/goalsheets` - Get all goal sheets (filtered by role)
- `GET /api/goalsheets/:id` - Get goal sheet by ID
- `POST /api/goalsheets` - Create goal sheet
- `POST /api/goalsheets/:id/submit` - Submit goal sheet
- `POST /api/goalsheets/:id/approve` - Approve goal sheet (manager/admin)
- `POST /api/goalsheets/:id/reject` - Reject goal sheet (manager/admin)
- `POST /api/goalsheets/:id/unlock` - Unlock goal sheet (admin only)

### Goals

- `POST /api/goals` - Add goal to sheet
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Achievements

- `PUT /api/achievements` - Update achievement

### Comments

- `POST /api/comments` - Add comment to goal sheet

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

### Cycles

- `GET /api/cycles` - Get all cycles
- `GET /api/cycles/active` - Get active cycle
- `POST /api/cycles` - Create cycle (admin only)
- `PUT /api/cycles/:id` - Update cycle (admin only)

### Audit Logs

- `GET /api/audit` - Get audit logs (admin only)

### Escalations

- `GET /api/escalations` - Get all escalations (admin/manager)
- `PUT /api/escalations/:id/resolve` - Resolve escalation

## Database Schema

The database includes the following models:

- **User** - System users with roles (EMPLOYEE, MANAGER, ADMIN)
- **GoalCycle** - Goal setting cycles with phases
- **GoalSheet** - Employee goal sheets
- **Goal** - Individual goals with UoM types
- **Achievement** - Quarterly achievement tracking
- **Comment** - Comments on goal sheets
- **AuditLog** - Immutable audit trail
- **Notification** - User notifications
- **Escalation** - Escalation tracking

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Demo Credentials

After running the seed script, you can use these credentials:

- **Admin**: admin@atomquest.com / demo123
- **Manager**: sarah.mgr@atomquest.com / demo123
- **Employee**: john.emp@atomquest.com / demo123
- **Employee**: jane.emp@atomquest.com / demo123
- **Employee**: raj.emp@atomquest.com / demo123

## Development

### Prisma Studio

View and edit your database:
```bash
npx prisma studio
```

### Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

### Reset database:
```bash
npx prisma migrate reset
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config/
│   │   └── database.js    # Prisma client
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── errorHandler.js # Error handling
│   ├── routes/
│   │   ├── auth.js        # Auth endpoints
│   │   ├── users.js       # User endpoints
│   │   ├── goalsheets.js  # Goal sheet endpoints
│   │   ├── goals.js       # Goal endpoints
│   │   ├── achievements.js # Achievement endpoints
│   │   ├── comments.js    # Comment endpoints
│   │   ├── notifications.js # Notification endpoints
│   │   ├── audit.js       # Audit log endpoints
│   │   ├── cycles.js      # Cycle endpoints
│   │   └── escalations.js # Escalation endpoints
│   ├── utils/
│   │   └── calculation.js # Progress calculation utilities
│   ├── seed.js            # Database seed script
│   └── server.js          # Express server
├── .env                   # Environment variables
├── .env.example           # Environment variables template
└── package.json           # Dependencies
```

## Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords for database
- Enable HTTPS in production
- Implement rate limiting for production
- Use environment-specific configurations
