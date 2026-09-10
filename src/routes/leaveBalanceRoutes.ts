import { Router } from 'express';
import { LeaveBalanceController } from '../controllers/leaveBalanceController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  adjustLeaveBalanceValidation,
  getEmployeeLeaveBalancesValidation,
} from '../validations/leaveValidations';

const router = Router();
const leaveBalanceController = new LeaveBalanceController();

// Get my leave balances
router.get('/my-balances', authenticateToken, leaveBalanceController.getMyLeaveBalances);

// Get employee leave balances (HR/Admin/Manager only)
router.get(
  '/employee/:employeeId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getEmployeeLeaveBalancesValidation),
  leaveBalanceController.getEmployeeLeaveBalances,
);

// Adjust leave balance (Admin only)
router.post(
  '/adjust',
  authenticateToken,
  authorize(['ADMIN']),
  validateRequest(adjustLeaveBalanceValidation),
  leaveBalanceController.adjustLeaveBalance,
);

export default router;
