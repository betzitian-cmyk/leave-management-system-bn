import { Request, Response } from 'express';
import { HRService } from '../services/hrService';
import { getRepository } from 'typeorm';
import { Employee, Department, LeaveRequest, LeaveBalance, LeaveType } from '../models';

export class HRController {
  private hrService = new HRService();
  /**
   * Get HR dashboard overview
   */
  async getHRDashboard(req: Request, res: Response): Promise<void> {
    try {
      const summary = await this.hrService.getHRDashboardSummary();

      res.json({
        success: true,
        data: summary,
        message: 'HR dashboard data retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve HR dashboard data',
        error: error.message,
      });
    }
  }

  /**
   * Get employee overview statistics
   */
  async getEmployeeOverview(req: Request, res: Response): Promise<void> {
    try {
      const overview = await this.hrService.getEmployeeOverview();

      res.json({
        success: true,
        data: overview,
        message: 'Employee overview retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee overview',
        error: error.message,
      });
    }
  }

  /**
   * Search and filter employees
   */
  async searchEmployees(req: Request, res: Response): Promise<void> {
    try {
      const {
        departmentId,
        position,
        status,
        hireDateFrom,
        hireDateTo,
        searchTerm,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        departmentId: departmentId as string,
        position: position as string,
        status: status as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE',
        hireDateFrom: hireDateFrom ? new Date(hireDateFrom as string) : undefined,
        hireDateTo: hireDateTo ? new Date(hireDateTo as string) : undefined,
        searchTerm: searchTerm as string,
      };

      const result = await this.hrService.searchEmployees(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Employee search completed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search employees',
        error: error.message,
      });
    }
  }

  /**
   * Get employee analytics
   */
  async getEmployeeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.hrService.getEmployeeAnalytics();

      res.json({
        success: true,
        data: analytics,
        message: 'Employee analytics retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get detailed employee information
   */
  async getEmployeeDetails(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const employee = await this.hrService.getEmployeeDetails(employeeId);

      if (!employee) {
        res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
        return;
      }

      res.json({
        success: true,
        data: employee,
        message: 'Employee details retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee details',
        error: error.message,
      });
    }
  }

  /**
   * Update employee information (HR operations)
   */
  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const updates = req.body;

      // Validate updates
      const allowedFields = [
        'firstName',
        'lastName',
        'email',
        'position',
        'departmentId',
        'managerId',
        'hireDate',
        'profilePicture',
        'status',
      ];

      const filteredUpdates: any = {};
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      const updatedEmployee = await this.hrService.updateEmployee(employeeId, filteredUpdates);

      res.json({
        success: true,
        data: updatedEmployee,
        message: 'Employee updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update employee',
        error: error.message,
      });
    }
  }

  /**
   * Get HR reports
   */
  async getHRReports(req: Request, res: Response): Promise<void> {
    try {
      const { reportType, startDate, endDate, departmentId } = req.query;

      let reportData: any = {};

      switch (reportType) {
        case 'employee_summary':
          reportData = await this.hrService.getEmployeeOverview();
          break;
        case 'analytics':
          reportData = await this.hrService.getEmployeeAnalytics();
          break;
        case 'department_performance':
          const analytics = await this.hrService.getEmployeeAnalytics();
          reportData = analytics.departmentPerformance;
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Invalid report type',
          });
          return;
      }

      res.json({
        success: true,
        data: reportData,
        message: 'HR report generated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate HR report',
        error: error.message,
      });
    }
  }

  /**
   * Bulk employee operations
   */
  async bulkEmployeeOperations(req: Request, res: Response): Promise<void> {
    try {
      const { operation, employeeIds, data } = req.body;

      if (!operation || !employeeIds || !Array.isArray(employeeIds)) {
        res.status(400).json({
          success: false,
          message: 'Invalid bulk operation parameters',
        });
        return;
      }

      let results: any[] = [];

      switch (operation) {
        case 'update_status':
          // Update employee status in bulk
          for (const employeeId of employeeIds) {
            try {
              const updated = await this.hrService.updateEmployee(employeeId, {
                status: data.status,
              });
              results.push({ employeeId, success: true, data: updated });
            } catch (error: any) {
              results.push({ employeeId, success: false, error: error.message });
            }
          }
          break;

        case 'update_department':
          // Update employee department in bulk
          for (const employeeId of employeeIds) {
            try {
              const updated = await this.hrService.updateEmployee(employeeId, {
                departmentId: data.departmentId,
              });
              results.push({ employeeId, success: true, data: updated });
            } catch (error: any) {
              results.push({ employeeId, success: false, error: error.message });
            }
          }
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Unsupported bulk operation',
          });
          return;
      }

      res.json({
        success: true,
        data: results,
        message: `Bulk operation '${operation}' completed successfully`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk employee operations',
        error: error.message,
      });
    }
  }

  /**
   * Get department performance metrics
   */
  async getDepartmentPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.params;
      // TODO: Implement get department performance metrics functionality
      res.status(200).json({ message: 'Get department performance metrics not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
