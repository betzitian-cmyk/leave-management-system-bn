import { Router } from 'express';
import { LeaveRequestController } from '../controllers/leaveRequestController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createLeaveRequestValidation,
  updateLeaveRequestValidation,
  approveLeaveRequestValidation,
  rejectLeaveRequestValidation,
  cancelLeaveRequestValidation,
  getLeaveRequestByIdValidation,
  getLeavesByDepartmentValidation,
  getAllLeavesValidation,
  getMyLeavesValidation,
} from '../validations/leaveValidations';

const router = Router();
const leaveRequestController = new LeaveRequestController();

// Get my leave requests (EMPLOYEE+ only)
router.get(
  '/my-leaves',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getMyLeavesValidation),
  (req, res) => leaveRequestController.getMyLeaves(req, res),
);

// Get all leave requests (HR/Admin/Manager only)
router.get(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getAllLeavesValidation),
  (req, res) => leaveRequestController.getAllLeaves(req, res),
);

// Get leaves by department (HR/Admin/Manager of that department only)
router.get(
  '/department/:departmentId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getLeavesByDepartmentValidation),
  (req, res) => leaveRequestController.getLeavesByDepartment(req, res),
);

// Get team leaves (Manager only)
router.get('/team', authenticateToken, authorize(['MANAGER', 'ADMIN']), (req, res) =>
  leaveRequestController.getTeamLeaves(req, res),
);

// Get leave request by ID (EMPLOYEE+ only)
router.get(
  '/:id',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getLeaveRequestByIdValidation),
  (req, res) => leaveRequestController.getLeaveRequestById(req, res),
);

// Create leave request (EMPLOYEE+ only)
router.post(
  '/',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(createLeaveRequestValidation),
  (req, res) => leaveRequestController.createLeaveRequest(req, res),
);

// Update leave request (EMPLOYEE+ only)
router.put(
  '/:id',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(updateLeaveRequestValidation),
  (req, res) => leaveRequestController.updateLeaveRequest(req, res),
);

// Approve leave request (Manager/HR/Admin only)
router.post(
  '/:id/approve',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(approveLeaveRequestValidation),
  (req, res) => leaveRequestController.approveLeaveRequest(req, res),
);

// Reject leave request (Manager/HR/Admin only)
router.post(
  '/:id/reject',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(rejectLeaveRequestValidation),
  (req, res) => leaveRequestController.rejectLeaveRequest(req, res),
);

// Cancel leave request (EMPLOYEE+ only)
router.post(
  '/:id/cancel',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(cancelLeaveRequestValidation),
  (req, res) => leaveRequestController.cancelLeaveRequest(req, res),
);

export default router;
