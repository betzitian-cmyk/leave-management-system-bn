import { Router } from 'express';
import { EmployeeController } from '../controllers/employeeController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createEmployeeProfileValidation,
  updateEmployeeValidation,
  getEmployeeByIdValidation,
  getAllEmployeesValidation,
} from '../validations/employeeValidations';

const router = Router();
const employeeController = new EmployeeController();

// Create employee profile (HR/Admin only)
router.post(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createEmployeeProfileValidation),
  (req, res) => employeeController.createEmployeeProfile(req, res),
);

// Get all employees (HR/Admin only - full access)
router.get(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getAllEmployeesValidation),
  (req, res) => employeeController.getAllEmployees(req, res),
);

// Get my department employees (Manager only - restricted access)
router.get(
  '/my-department',
  authenticateToken,
  authorize(['MANAGER']),
  validateRequest(getAllEmployeesValidation),
  (req, res) => employeeController.getMyDepartmentEmployees(req, res),
);

// Get employee by ID
router.get(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  validateRequest(getEmployeeByIdValidation),
  (req, res) => employeeController.getEmployeeById(req, res),
);

// Update employee
router.put(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateEmployeeValidation),
  (req, res) => employeeController.updateEmployee(req, res),
);

export default router;
