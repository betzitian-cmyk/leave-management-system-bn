import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';

const router = Router();
const auditController = new AuditController();

// Get recent security events (Admin/HR only)
router.get(
  '/security-events',
  authenticateToken,
  authorize(['ADMIN', 'HR_MANAGER']),
  auditController.getRecentSecurityEvents.bind(auditController),
);

// Clean up old audit logs (Admin only)
router.post(
  '/cleanup',
  authenticateToken,
  authorize(['ADMIN']),
  auditController.cleanupOldLogs.bind(auditController),
);

export default router;
