// src/controllers/attendanceController.ts

import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendanceService';
import { FingerprintService } from '../services/fingerprintService';

export class AttendanceController {
  private attendanceService: AttendanceService;
  private fingerprintService: FingerprintService;

  constructor() {
    this.attendanceService = new AttendanceService();
    this.fingerprintService = new FingerprintService();
  }

  /**
   * Create attendance record
   * POST /api/attendance
   */
  async createAttendance(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const attendance = await this.attendanceService.createAttendance(req.body, currentUserId);

      res.status(201).json({
        success: true,
        data: attendance,
        message: 'Attendance recorded successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record attendance',
      });
    }
  }

  /**
   * Mark attendance using fingerprint (kiosk mode)
   * POST /api/attendance/fingerprint-kiosk
   */
  async markAttendanceByFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const result = await this.attendanceService.markAttendanceByFingerprint(currentUserId);

      res.status(201).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark attendance via fingerprint',
      });
    }
  }

  /**
   * Mark attendance with fingerprint (manual - requires employee ID)
   * POST /api/attendance/fingerprint
   */
  async markAttendanceWithFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      // Capture fingerprint from device and verify
      const attendance = await this.attendanceService.createAttendance(
        req.body,
        currentUserId,
        true, // shouldCaptureFingerprint = true
      );

      res.status(201).json({
        success: true,
        data: attendance,
        message: 'Attendance marked successfully via fingerprint',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark attendance via fingerprint',
      });
    }
  }

  /**
   * Update attendance record
   * PUT /api/attendance/:id
   */
  async updateAttendance(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const currentUserId = (req as any).user.id;
      const attendance = await this.attendanceService.updateAttendance(id, req.body, currentUserId);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Attendance updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update attendance',
      });
    }
  }

  /**
   * Get attendance records
   * GET /api/attendance
   */
  async getAttendances(req: Request, res: Response): Promise<void> {
    try {
      const query = {
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await this.attendanceService.getAttendances(query);

      res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
        message: 'Attendances retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve attendances',
      });
    }
  }

  /**
   * Get attendance summary for an employee
   * GET /api/attendance/summary/:employeeId
   */
  async getAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const summary = await this.attendanceService.getAttendanceSummary(
        employeeId,
        startDate,
        endDate,
      );

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Attendance summary retrieved successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve attendance summary',
      });
    }
  }

  /**
   * Enroll employee fingerprint
   * POST /api/attendance/fingerprint/enroll/:employeeId
   */
  async enrollFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const currentUserId = (req as any).user.id;

      const result = await this.attendanceService.enrollFingerprint(employeeId, currentUserId);

      res.status(201).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to enroll fingerprint',
      });
    }
  }

  /**
   * Update employee fingerprint
   * PUT /api/attendance/fingerprint/update/:employeeId
   */
  async updateFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const currentUserId = (req as any).user.id;

      const result = await this.attendanceService.updateFingerprint(employeeId, currentUserId);

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update fingerprint',
      });
    }
  }

  /**
   * Remove employee fingerprint
   * DELETE /api/attendance/fingerprint/remove/:employeeId
   */
  async removeFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const currentUserId = (req as any).user.id;

      const result = await this.attendanceService.removeFingerprint(employeeId, currentUserId);

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove fingerprint',
      });
    }
  }

  /**
   * Get fingerprint enrollment status
   * GET /api/attendance/fingerprint/status?employeeId=xxx (optional)
   */
  async getFingerprintStatus(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      const status = await this.attendanceService.getFingerprintStatus(employeeId);

      res.status(200).json({
        success: true,
        data: status,
        message: 'Fingerprint status retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve fingerprint status',
      });
    }
  }

  /**
   * Get fingerprint device info
   * GET /api/attendance/fingerprint/devices
   */
  async getFingerprintDevices(req: Request, res: Response): Promise<void> {
    try {
      const deviceInfo = await this.fingerprintService.getDeviceInfo();

      res.status(200).json({
        success: true,
        data: deviceInfo,
        message: 'Fingerprint device info retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve fingerprint device info',
      });
    }
  }
}
