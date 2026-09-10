import { Router } from 'express';
import { DepartmentController } from '../controllers/departmentController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createDepartmentValidation,
  updateDepartmentValidation,
  getDepartmentByIdValidation,
  deleteDepartmentValidation,
} from '../validations/departmentValidations';

const router = Router();
const departmentController = new DepartmentController();

// Get all departments
router.get(
  '/',
  authenticateToken,
  departmentController.getAllDepartments.bind(departmentController),
);

// Get department by ID
router.get(
  '/:id',
  authenticateToken,
  validateRequest(getDepartmentByIdValidation),
  departmentController.getDepartmentById.bind(departmentController),
);

// Create department (HR/Admin only)
router.post(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createDepartmentValidation),
  departmentController.createDepartment.bind(departmentController),
);

// Update department (HR/Admin only)
router.put(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateDepartmentValidation),
  departmentController.updateDepartment.bind(departmentController),
);

// Delete department (HR/Admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(deleteDepartmentValidation),
  departmentController.deleteDepartment.bind(departmentController),
);

export default router;
