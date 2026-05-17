import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import goalSheetRoutes from './routes/goalsheets.js';
import goalRoutes from './routes/goals.js';
import achievementRoutes from './routes/achievements.js';
import commentRoutes from './routes/comments.js';
import notificationRoutes from './routes/notifications.js';
import auditRoutes from './routes/audit.js';
import cycleRoutes from './routes/cycles.js';
import escalationRoutes from './routes/escalations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AtomQuest API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goalsheets', goalSheetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/escalations', escalationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AtomQuest API server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});