import { Router, Request, Response, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protected route example
const handler: RequestHandler = (req, res) => {
  res.json({
    message: 'Access granted to protected resource',
    user: (req as any).user,
  });
};

router.get('/protected-resource', authenticateToken, handler);

export default router;
