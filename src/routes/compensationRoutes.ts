import { Router } from 'express';
import { CompensationController } from '../controllers/compensationController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createSalaryValidation,
  updateSalaryValidation,
  getSalaryByIdValidation,
  searchSalariesValidation,
  createBenefitValidation,
  updateBenefitValidation,
  getBenefitByIdValidation,
  searchBenefitsValidation,
  assignBenefitToEmployeeValidation,
  updateEmployeeBenefitValidation,
  createBonusValidation,
  updateBonusValidation,
  getBonusByIdValidation,
  searchBonusesValidation,
} from '../validations/compensationValidations';

const router = Router();
const compensationController = new CompensationController();

// Salary Routes
router.post(
  '/salaries',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createSalaryValidation),
  compensationController.createSalary.bind(compensationController),
);

router.put(
  '/salaries/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateSalaryValidation),
  compensationController.updateSalary.bind(compensationController),
);

router.get(
  '/salaries/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getSalaryByIdValidation),
  compensationController.getSalaryById.bind(compensationController),
);

router.get(
  '/salaries',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchSalariesValidation),
  compensationController.searchSalaries.bind(compensationController),
);

// Benefit Routes
router.post(
  '/benefits',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createBenefitValidation),
  compensationController.createBenefit.bind(compensationController),
);

router.put(
  '/benefits/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateBenefitValidation),
  compensationController.updateBenefit.bind(compensationController),
);

router.get(
  '/benefits/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getBenefitByIdValidation),
  compensationController.getBenefitById.bind(compensationController),
);

router.get(
  '/benefits',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchBenefitsValidation),
  compensationController.searchBenefits.bind(compensationController),
);

// Employee Benefit Routes
router.post(
  '/employee-benefits',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(assignBenefitToEmployeeValidation),
  compensationController.assignBenefitToEmployee.bind(compensationController),
);

router.put(
  '/employee-benefits/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateEmployeeBenefitValidation),
  compensationController.updateEmployeeBenefit.bind(compensationController),
);

// Bonus Routes
router.post(
  '/bonuses',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createBonusValidation),
  compensationController.createBonus.bind(compensationController),
);

router.put(
  '/bonuses/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateBonusValidation),
  compensationController.updateBonus.bind(compensationController),
);

router.get(
  '/bonuses/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getBonusByIdValidation),
  compensationController.getBonusById.bind(compensationController),
);

router.get(
  '/bonuses',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchBonusesValidation),
  compensationController.searchBonuses.bind(compensationController),
);

export default router;
