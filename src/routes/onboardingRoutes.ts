import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createOnboardingValidation,
  updateOnboardingValidation,
  getOnboardingByIdValidation,
  searchOnboardingsValidation,
  createOnboardingTaskValidation,
  updateOnboardingTaskValidation,
  getOnboardingTaskByIdValidation,
} from '../validations/onboardingValidations';

const router = Router();
const onboardingController = new OnboardingController();

// Onboarding Routes
router.post(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createOnboardingValidation),
  onboardingController.createOnboarding.bind(onboardingController),
);

router.put(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateOnboardingValidation),
  onboardingController.updateOnboarding.bind(onboardingController),
);

router.get(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getOnboardingByIdValidation),
  onboardingController.getOnboardingById.bind(onboardingController),
);

router.get(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchOnboardingsValidation),
  onboardingController.searchOnboardings.bind(onboardingController),
);

// Onboarding Task Routes
router.post(
  '/tasks',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createOnboardingTaskValidation),
  onboardingController.createOnboardingTask.bind(onboardingController),
);

router.put(
  '/tasks/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateOnboardingTaskValidation),
  onboardingController.updateOnboardingTask.bind(onboardingController),
);

router.get(
  '/tasks/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getOnboardingTaskByIdValidation),
  onboardingController.getOnboardingTaskById.bind(onboardingController),
);

export default router;
