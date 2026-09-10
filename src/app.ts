// filepath: src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import configurePassport from './config/passport';
import { logger, requestLogger } from './utils/logger';
import authRoutes from './routes/authRoutes';
import leaveTypeRoutes from './routes/leaveTypeRoutes';
import leaveRequestRoutes from './routes/leaveRequestRoutes';
import leaveBalanceRoutes from './routes/leaveBalanceRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middleware/errorHandler';
import employeeRoutes from './routes/employeeRoutes';
import departmentRoutes from './routes/departmentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import documentRoutes from './routes/documentRoutes';
import managerRoutes from './routes/managerRoutes';
import auditRoutes from './routes/auditRoutes';
import hrRoutes from './routes/hrRoutes';
import recruitmentRoutes from './routes/recruitmentRoutes';
import compensationRoutes from './routes/compensationRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import profileRoutes from './routes/profileRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  requestLogger(req);
  next();
});

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
configurePassport();

// Load the Swagger document
try {
  const swaggerDocument = yaml.load(
    fs.readFileSync(path.join(__dirname, '../docs/swagger-combined.yaml'), 'utf8'),
  );

  // Set up Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info('📚 Swagger documentation loaded successfully');
} catch (error) {
  logger.error('❌ Failed to load Swagger documentation', { error: error.message });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/compensation', compensationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);

logger.info('🚀 All routes registered successfully');

// Error handling
app.use(errorHandler);

export default app;
