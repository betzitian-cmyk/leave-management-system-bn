import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  getDocumentByIdValidation,
  uploadDocumentValidation,
  getDocumentsByLeaveRequestValidation,
} from '../validations/documentValidations';
import { documentUpload } from '../config/multer';

const router = Router();
const documentController = new DocumentController();

// Upload document for leave request (EMPLOYEE+ only)
router.post(
  '/upload/:leaveRequestId',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(uploadDocumentValidation),
  documentUpload.single('document'),
  (req, res) => documentController.uploadDocument(req, res),
);

// Get document by ID (EMPLOYEE+ only)
router.get(
  '/:id',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getDocumentByIdValidation),
  (req, res) => documentController.getDocumentById(req, res),
);

// Delete document
router.delete(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getDocumentByIdValidation),
  (req, res) => documentController.deleteDocument(req, res),
);

// Get documents for leave request (EMPLOYEE+ only)
router.get(
  '/leave-request/:leaveRequestId',
  authenticateToken,
  authorize(['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getDocumentsByLeaveRequestValidation),
  (req, res) => documentController.getDocumentsByLeaveRequest(req, res),
);

export default router;
