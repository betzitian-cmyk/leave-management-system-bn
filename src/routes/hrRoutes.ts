import { Router } from 'express';
import { HRController } from '../controllers/hrController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  searchEmployeesValidation,
  getEmployeeDetailsValidation,
  updateEmployeeHRValidation,
  getDepartmentPerformanceValidation,
} from '../validations/hrValidations';

const router = Router();
const hrController = new HRController();

// Get HR dashboard (HR/Admin only)
router.get(
  '/dashboard',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  hrController.getHRDashboard,
);

// Get employee overview (HR/Admin only)
router.get(
  '/employee-overview',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  hrController.getEmployeeOverview,
);

// Search and filter employees (HR/Admin only)
router.get(
  '/search-employees',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchEmployeesValidation),
  hrController.searchEmployees,
);

// Get employee details (HR/Admin only)
router.get(
  '/employee/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getEmployeeDetailsValidation),
  hrController.getEmployeeDetails,
);

// Update employee (HR/Admin only)
router.put(
  '/employee/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateEmployeeHRValidation),
  hrController.updateEmployee,
);

// Get employee analytics (HR/Admin only)
router.get(
  '/employee-analytics',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  hrController.getEmployeeAnalytics,
);

// Get department performance metrics (HR/Admin only)
router.get(
  '/department/:departmentId/performance',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getDepartmentPerformanceValidation),
  hrController.getDepartmentPerformanceMetrics,
);

export default router;
