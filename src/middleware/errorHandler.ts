// filepath: src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { errorLogger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Centralized app/server error logging
  errorLogger(err, `HTTP ${req.method} ${req.originalUrl}`);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
};
