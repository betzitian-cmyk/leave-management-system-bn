import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitmentController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createJobPostingValidation,
  updateJobPostingValidation,
  publishJobPostingValidation,
  getJobPostingByIdValidation,
  searchJobPostingsValidation,
  createJobApplicationValidation,
  updateJobApplicationValidation,
  getJobApplicationByIdValidation,
  searchJobApplicationsValidation,
  createInterviewValidation,
  updateInterviewValidation,
  getInterviewByIdValidation,
  searchInterviewsValidation,
} from '../validations/recruitmentValidations';

const router = Router();
const recruitmentController = new RecruitmentController();

// Job Posting Routes
router.post(
  '/job-postings',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createJobPostingValidation),
  recruitmentController.createJobPosting.bind(recruitmentController),
);

router.put(
  '/job-postings/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateJobPostingValidation),
  recruitmentController.updateJobPosting.bind(recruitmentController),
);

router.post(
  '/job-postings/:id/publish',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(publishJobPostingValidation),
  recruitmentController.publishJobPosting.bind(recruitmentController),
);

router.get(
  '/job-postings/:id',
  authenticateToken,
  validateRequest(getJobPostingByIdValidation),
  recruitmentController.getJobPostingById.bind(recruitmentController),
);

router.get(
  '/job-postings',
  authenticateToken,
  validateRequest(searchJobPostingsValidation),
  recruitmentController.searchJobPostings.bind(recruitmentController),
);

// Job Application Routes
router.post(
  '/applications',
  authenticateToken,
  validateRequest(createJobApplicationValidation),
  recruitmentController.createJobApplication.bind(recruitmentController),
);

router.put(
  '/applications/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateJobApplicationValidation),
  recruitmentController.updateJobApplication.bind(recruitmentController),
);

router.get(
  '/applications/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getJobApplicationByIdValidation),
  recruitmentController.getJobApplicationById.bind(recruitmentController),
);

router.get(
  '/applications',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchJobApplicationsValidation),
  recruitmentController.searchApplications.bind(recruitmentController),
);

// Interview Routes
router.post(
  '/interviews',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createInterviewValidation),
  recruitmentController.createInterview.bind(recruitmentController),
);

router.put(
  '/interviews/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateInterviewValidation),
  recruitmentController.updateInterview.bind(recruitmentController),
);

router.get(
  '/interviews/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getInterviewByIdValidation),
  recruitmentController.getInterviewById.bind(recruitmentController),
);

router.get(
  '/interviews',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchInterviewsValidation),
  recruitmentController.searchInterviews.bind(recruitmentController),
);

export default router;
