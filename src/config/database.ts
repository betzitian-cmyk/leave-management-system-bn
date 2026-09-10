// src/config/database.ts

import { createConnection, Connection } from 'typeorm';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
dotenv.config();

import {
  // Authentication Models (must come first due to dependencies)
  User,
  Role,

  // Core Models
  Employee,
  Department,
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  Document,
  Holiday,
  Notification,
  AuditLog,
  Attendance,

  // New HR Models
  JobPosting,
  JobApplication,
  Interview,
  Salary,
  Benefit,
  EmployeeBenefit,
  Bonus,
  Onboarding,
  OnboardingTask,
} from '../models';

export const initializeDatabase = async (): Promise<Connection> => {
  try {
    logger.info('🔄 Initializing database connection...');

    const connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        // Authentication Models (must come first due to dependencies)
        User,
        Role,

        // Core Models
        Employee,
        Department,
        LeaveType,
        LeaveRequest,
        LeaveBalance,
        Document,
        Holiday,
        Notification,
        AuditLog,
        Attendance,

        // New HR Models
        JobPosting,
        JobApplication,
        Interview,
        Salary,
        Benefit,
        EmployeeBenefit,
        Bonus,
        Onboarding,
        OnboardingTask,
      ],
      synchronize: true,
      // Disable verbose SQL query logging - only show errors and warnings
      logging: ['error', 'warn'],
    });

    logger.info('✅ Database connected successfully');
    logger.info('🔇 SQL query logging disabled (only errors/warnings shown)');
    return connection;
  } catch (error) {
    logger.error('❌ Database connection failed', { error: error.message, stack: error.stack });
    throw error;
  }
};
