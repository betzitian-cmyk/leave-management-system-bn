// src/routes/attendanceRoutes.ts

import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createAttendanceValidation,
  updateAttendanceValidation,
} from '../validations/attendanceValidations';

const router = Router();
const attendanceController = new AttendanceController();

/**
 * @route   POST /api/attendance
 * @desc    Create attendance record
 * @access  Private (HR, Admin, Manager)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(createAttendanceValidation),
  (req, res) => attendanceController.createAttendance(req, res),
);

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records with filters
 * @access  Private (HR, Admin, Manager)
 */
router.get('/', authenticateToken, authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']), (req, res) =>
  attendanceController.getAttendances(req, res),
);

/**
 * @route   GET /api/attendance/summary/:employeeId
 * @desc    Get attendance summary for an employee
 * @access  Private (HR, Admin, Manager, Employee - own data)
 */
router.get(
  '/summary/:employeeId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  (req, res) => attendanceController.getAttendanceSummary(req, res),
);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (HR, Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateAttendanceValidation),
  (req, res) => attendanceController.updateAttendance(req, res),
);

/**
 * @route   POST /api/attendance/fingerprint-kiosk
 * @desc    Mark attendance using fingerprint (kiosk mode - auto-identify employee)
 * @access  Private (HR, Admin, Manager)
 */
router.post(
  '/fingerprint-kiosk',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  (req, res) => attendanceController.markAttendanceByFingerprint(req, res),
);

/**
 * @route   POST /api/attendance/fingerprint
 * @desc    Mark attendance with fingerprint (manual - requires employee ID)
 * @access  Private (HR, Admin, Manager)
 */
router.post(
  '/fingerprint',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(createAttendanceValidation),
  (req, res) => attendanceController.markAttendanceWithFingerprint(req, res),
);

/**
 * @route   POST /api/attendance/fingerprint/enroll/:employeeId
 * @desc    Enroll employee fingerprint
 * @access  Private (HR, Admin)
 */
router.post(
  '/fingerprint/enroll/:employeeId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  (req, res) => attendanceController.enrollFingerprint(req, res),
);

/**
 * @route   PUT /api/attendance/fingerprint/update/:employeeId
 * @desc    Update employee fingerprint
 * @access  Private (HR, Admin)
 */
router.put(
  '/fingerprint/update/:employeeId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  (req, res) => attendanceController.updateFingerprint(req, res),
);

/**
 * @route   DELETE /api/attendance/fingerprint/remove/:employeeId
 * @desc    Remove employee fingerprint
 * @access  Private (HR, Admin)
 */
router.delete(
  '/fingerprint/remove/:employeeId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  (req, res) => attendanceController.removeFingerprint(req, res),
);

/**
 * @route   GET /api/attendance/fingerprint/status
 * @desc    Get fingerprint enrollment status
 * @access  Private (HR, Admin, Manager)
 */
router.get(
  '/fingerprint/status',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  (req, res) => attendanceController.getFingerprintStatus(req, res),
);

/**
 * @route   GET /api/attendance/fingerprint/devices
 * @desc    Get fingerprint device info
 * @access  Private (HR, Admin)
 */
router.get(
  '/fingerprint/devices',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  (req, res) => attendanceController.getFingerprintDevices(req, res),
);

export default router;
