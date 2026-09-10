import { Router } from 'express';
import { LeaveTypeController } from '../controllers/leaveTypeController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createLeaveTypeValidation,
  updateLeaveTypeValidation,
  getLeaveTypeByIdValidation,
  deleteLeaveTypeValidation,
} from '../validations/leaveValidations';

const router = Router();
const leaveTypeController = new LeaveTypeController();

// Get all active leave types
router.get('/', authenticateToken, leaveTypeController.getAllLeaveTypes);

// Get leave type by ID
router.get(
  '/:id',
  authenticateToken,
  validateRequest(getLeaveTypeByIdValidation),
  leaveTypeController.getLeaveTypeById,
);

// Create leave type (HR/Admin only)
router.post(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createLeaveTypeValidation),
  leaveTypeController.createLeaveType,
);

// Update leave type (HR/Admin only)
router.put(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateLeaveTypeValidation),
  leaveTypeController.updateLeaveType,
);

// Deactivate leave type (HR/Admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(deleteLeaveTypeValidation),
  leaveTypeController.deleteLeaveType,
);

export default router;
