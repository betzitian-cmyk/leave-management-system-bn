import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

// Role-based authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // If no token in header, check query parameters (for export/download links)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    try {
      const validationResult = await authService.validateToken(token);
      if (!validationResult.valid) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
      }
      // Add the user info to the request for use in route handlers
      (req as any).user = validationResult.user;
      next();
    } catch (error) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

// Role authorization middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!user || !user.role || !allowedRoles.includes(user.role)) {
        res.status(403).json({
          message: 'Access denied: You do not have the required permissions',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  };
};
