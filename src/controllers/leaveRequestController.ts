// filepath: src/controllers/leaveRequestController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { LeaveRequest, Employee, LeaveType, LeaveBalance, Holiday } from '../models';
import { LeaveCalculator } from '../utils/leaveCalculator';
import { LeaveBalanceInitializer } from '../utils/leaveBalanceInitializer';
import { NotificationService } from '../services/notificationService';
import { ManagerService } from '../services/managerService';
import { LeaveService } from '../services/leaveService';
import { AuditService } from '../services/auditService';

export class LeaveRequestController {
  private leaveCalculator = new LeaveCalculator();
  private leaveService = new LeaveService();
  private managerService = new ManagerService();
  private auditService = new AuditService();
  private notificationService = new NotificationService();

  async getMyLeaves(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      // Get query parameters for filtering and pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const leaveTypeId = req.query.leaveTypeId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : null;

      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      const leaveRequestRepository = getRepository(LeaveRequest);
      let query = leaveRequestRepository
        .createQueryBuilder('lr')
        .leftJoinAndSelect('lr.leaveType', 'lt')
        .leftJoinAndSelect('lr.employee', 'emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.user', 'user')
        .where('lr.employeeId = :employeeId', { employeeId: employee.id });

      // Apply filters
      if (status) {
        query = query.andWhere('lr.status = :status', { status });
      }

      if (leaveTypeId) {
        query = query.andWhere('lr.leaveTypeId = :leaveTypeId', { leaveTypeId });
      }

      if (year) {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        query = query
          .andWhere('lr.startDate >= :startOfYear', { startOfYear })
          .andWhere('lr.startDate <= :endOfYear', { endOfYear });
      }

      // Get total count for pagination
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by creation date
      query = query.orderBy('lr.createdAt', 'DESC');

      const leaves = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: leaves,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave requests', error });
    }
  }

  // Add to the LeaveRequestController
  async getAllLeaves(req: Request, res: Response): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);

      // Get query parameters for filtering and pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const leaveTypeId = req.query.leaveTypeId as string;
      const departmentId = req.query.departmentId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const employeeId = req.query.employeeId as string;

      let query = leaveRequestRepository
        .createQueryBuilder('lr')
        .leftJoinAndSelect('lr.leaveType', 'lt')
        .leftJoinAndSelect('lr.employee', 'emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.user', 'user');

      // Apply filters
      if (status) {
        query = query.andWhere('lr.status = :status', { status });
      }

      if (leaveTypeId) {
        query = query.andWhere('lr.leaveTypeId = :leaveTypeId', { leaveTypeId });
      }

      if (departmentId) {
        query = query.andWhere('emp.departmentId = :departmentId', { departmentId });
      }

      if (employeeId) {
        query = query.andWhere('lr.employeeId = :employeeId', { employeeId });
      }

      if (startDate) {
        query = query.andWhere('lr.startDate >= :startDate', { startDate: new Date(startDate) });
      }

      if (endDate) {
        query = query.andWhere('lr.endDate <= :endDate', { endDate: new Date(endDate) });
      }

      // Get total count for pagination
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by start date
      query = query.orderBy('lr.startDate', 'DESC');

      const leaves = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: leaves,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve leave requests',
        error: error.message,
      });
    }
  }

  async getLeavesByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.params;
      const userId = (req as any).user.id;

      // Check if user has access to this department
      const employeeRepository = getRepository(Employee);
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Check permissions: must be admin, HR, or manager of the department
      const hasAccess =
        currentEmployee.position === 'ADMIN' ||
        currentEmployee.position === 'HR_MANAGER' ||
        (currentEmployee.position === 'MANAGER' && currentEmployee.departmentId === departmentId);

      if (!hasAccess) {
        res.status(403).json({ message: 'Access denied: insufficient permissions' });
        return;
      }

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaves = await leaveRequestRepository
        .createQueryBuilder('lr')
        .innerJoin('lr.employee', 'e')
        .where('e.departmentId = :deptId', { deptId: departmentId })
        .leftJoinAndSelect('lr.leaveType', 'lt')
        .leftJoinAndSelect('lr.employee', 'emp')
        .orderBy('lr.startDate', 'ASC')
        .getMany();

      res.status(200).json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve department leave requests', error });
    }
  }

  async getTeamLeaves(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Check if user is a manager
      if (
        employee.position !== 'MANAGER' &&
        employee.position !== 'DEPARTMENT_MANAGER' &&
        employee.position !== 'ADMIN'
      ) {
        res.status(403).json({ message: 'Access denied: only managers can view team leaves' });
        return;
      }

      // Get team members using manager service
      const teamMembers = await this.managerService.getTeamMembers(employee.id, true);
      const teamMemberIds = teamMembers.map((member) => member.id);

      if (teamMemberIds.length === 0) {
        res.status(200).json([]);
        return;
      }

      // Get team's leaves
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaves = await leaveRequestRepository
        .createQueryBuilder('lr')
        .where('lr.employeeId IN (:...teamIds)', { teamIds: teamMemberIds })
        .andWhere('lr.status = :status', { status: 'APPROVED' })
        .andWhere('lr.endDate >= :today', { today: new Date() })
        .leftJoinAndSelect('lr.leaveType', 'lt')
        .leftJoinAndSelect('lr.employee', 'emp')
        .orderBy('lr.startDate', 'ASC')
        .getMany();

      res.status(200).json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve team leave requests', error });
    }
  }

  async getLeaveRequestById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id },
        relations: ['leaveType', 'employee', 'employee.user', 'employee.department', 'documents'],
      });

      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found' });
        return;
      }

      // Check if user has access to this leave request
      const employeeRepository = getRepository(Employee);
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Allow access if: owner, manager, admin, or HR
      const hasAccess =
        leaveRequest.employeeId === currentEmployee.id ||
        currentEmployee.position === 'ADMIN' ||
        currentEmployee.position === 'HR_MANAGER' ||
        (await this.managerService.canManage(currentEmployee.id, leaveRequest.employeeId));

      if (!hasAccess) {
        res.status(403).json({ message: 'Access denied: insufficient permissions' });
        return;
      }

      res.status(200).json({
        success: true,
        data: leaveRequest,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave request', error });
    }
  }

  async createLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      const { leaveTypeId, startDate, endDate, reason } = req.body;

      // Validate leave type exists
      const leaveTypeRepository = getRepository(LeaveType);
      const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });
      if (!leaveType) {
        res.status(404).json({ message: 'Leave type not found' });
        return;
      }

      // Use the leave service for comprehensive validation
      const validation = await this.leaveService.validateLeaveRequest(
        employee.id,
        leaveTypeId,
        new Date(startDate),
        new Date(endDate),
      );

      if (!validation.valid) {
        res.status(400).json({
          message: 'Leave request validation failed',
          errors: validation.errors,
        });
        return;
      }

      // Calculate business days
      const holidayRepository = getRepository(Holiday);
      const holidays = await holidayRepository.find();
      const holidayDates = holidays.map((h) => h.date);

      const days = this.leaveCalculator.calculateBusinessDays(
        new Date(startDate),
        new Date(endDate),
        holidayDates,
      );

      // Ensure a minimal number of days
      if (days <= 0) {
        res.status(400).json({ message: 'Leave request must include at least one business day' });
        return;
      }

      // Get or initialize leave balance
      const currentYear = new Date().getFullYear();
      const balance = await LeaveBalanceInitializer.ensureLeaveBalance(
        employee.id,
        leaveTypeId,
        currentYear,
      );

      // Check if employee has enough balance
      const availableBalance =
        Number(balance.allocated) +
        Number(balance.carryOver) +
        Number(balance.adjustment || 0) -
        Number(balance.used) -
        Number(balance.pending);

      if (availableBalance < days) {
        res.status(400).json({
          message: 'Insufficient leave balance',
          available: availableBalance,
          requested: days,
        });
        return;
      }

      // Create leave request
      const leaveRequestRepository = getRepository(LeaveRequest);
      const newRequest = leaveRequestRepository.create({
        employeeId: employee.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: 'PENDING',
      });

      const savedRequest = await leaveRequestRepository.save(newRequest);

      // Update pending balance
      balance.pending = Number(balance.pending) + days;
      await getRepository(LeaveBalance).save(balance);

      // Send notification
      await this.notificationService.sendLeaveRequestCreatedNotification(savedRequest.id);

      res.status(201).json(savedRequest);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to create leave request', error: error.message });
    }
  }

  async approveLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { comments } = req.body;
      const userId = (req as any).user.id;

      const employeeRepository = getRepository(Employee);
      const approver = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!approver) {
        res.status(404).json({ message: 'Approver not found' });
        return;
      }

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id },
        relations: ['employee'],
      });

      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found' });
        return;
      }

      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ message: `Leave request is already ${leaveRequest.status}` });
        return;
      }

      // Check if approver has permission to approve this request
      const canApprove =
        approver.position === 'ADMIN' ||
        approver.position === 'HR_MANAGER' ||
        (await this.managerService.canManage(approver.id, leaveRequest.employeeId));

      if (!canApprove) {
        res
          .status(403)
          .json({ message: 'Access denied: insufficient permissions to approve this request' });
        return;
      }

      // Update the leave request
      leaveRequest.status = 'APPROVED';
      leaveRequest.approvedById = approver.id;
      leaveRequest.approvalDate = new Date();
      leaveRequest.comments = comments;

      await leaveRequestRepository.save(leaveRequest);

      // Update leave balances with proper numeric handling
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      const balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: currentYear,
        },
      });

      if (balance) {
        // Convert to numbers and then back to ensure proper numeric format
        const used = Number(balance.used) + Number(leaveRequest.days);
        const pending = Number(balance.pending) - Number(leaveRequest.days);

        // Update with properly formatted numeric values
        balance.used = used;
        balance.pending = pending;

        await leaveBalanceRepository.save(balance);
      }

      // Send notification
      await this.notificationService.sendLeaveStatusUpdateNotification(leaveRequest.id, true);

      // Log audit event for leave approval
      await this.auditService.logLeaveApproval(leaveRequest.id, approver.id, 'APPROVED', comments);

      res.status(200).json({ message: 'Leave request approved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve leave request', error });
    }
  }

  async rejectLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { comments } = req.body;
      const userId = (req as any).user.id;

      const employeeRepository = getRepository(Employee);
      const approver = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!approver) {
        res.status(404).json({ message: 'Approver not found' });
        return;
      }

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id },
      });

      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found' });
        return;
      }

      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ message: `Leave request is already ${leaveRequest.status}` });
        return;
      }

      // Check if approver has permission to reject this request
      const canReject =
        approver.position === 'ADMIN' ||
        approver.position === 'HR_MANAGER' ||
        (await this.managerService.canManage(approver.id, leaveRequest.employeeId));

      if (!canReject) {
        res
          .status(403)
          .json({ message: 'Access denied: insufficient permissions to reject this request' });
        return;
      }

      // Update the leave request
      leaveRequest.status = 'REJECTED';
      leaveRequest.approvedById = approver.id;
      leaveRequest.approvalDate = new Date();
      leaveRequest.comments = comments;

      await leaveRequestRepository.save(leaveRequest);

      // Update pending balance with proper numeric handling
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      const balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: currentYear,
        },
      });

      if (balance) {
        // Convert to number and then back to ensure proper numeric format
        const pending = Number(balance.pending) - Number(leaveRequest.days);
        balance.pending = pending;

        await leaveBalanceRepository.save(balance);
      }

      // Send notification
      await this.notificationService.sendLeaveStatusUpdateNotification(leaveRequest.id, false);

      // Log audit event for leave rejection
      await this.auditService.logLeaveApproval(leaveRequest.id, approver.id, 'REJECTED', comments);

      res.status(200).json({ message: 'Leave request rejected successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to reject leave request', error });
    }
  }

  async cancelLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;

      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id, employeeId: employee.id },
      });

      if (!leaveRequest) {
        res
          .status(404)
          .json({ message: 'Leave request not found or you do not have permission to cancel it' });
        return;
      }

      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ message: `Cannot cancel a ${leaveRequest.status} leave request` });
        return;
      }

      // Update the leave request
      leaveRequest.status = 'CANCELLED';
      await leaveRequestRepository.save(leaveRequest);

      // Update pending balance with proper numeric handling
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      const balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: currentYear,
        },
      });

      if (balance) {
        // Convert to number and then back to ensure proper numeric format
        const pending = Number(balance.pending) - Number(leaveRequest.days);
        balance.pending = pending;

        await leaveBalanceRepository.save(balance);
      }

      // Send notification
      await this.notificationService.sendLeaveCancellationNotification(leaveRequest.id);

      res.status(200).json({ message: 'Leave request cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to cancel leave request', error });
    }
  }

  /**
   * Update leave request
   */
  async updateLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { startDate, endDate, reason } = req.body;
      const userId = (req as any).user.id;

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id },
        relations: ['employee', 'leaveType'],
      });

      if (!leaveRequest) {
        res.status(404).json({
          success: false,
          message: 'Leave request not found',
        });
        return;
      }

      // Get current employee
      const employeeRepository = getRepository(Employee);
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!currentEmployee) {
        res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
        return;
      }

      // Business Rule: Only PENDING requests can be updated
      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({
          success: false,
          message: `Cannot update ${leaveRequest.status} leave request. Only PENDING requests can be modified.`,
        });
        return;
      }

      // Check if user has permission to update this request
      const canUpdate =
        leaveRequest.employeeId === currentEmployee.id ||
        currentEmployee.position === 'ADMIN' ||
        currentEmployee.position === 'HR_MANAGER' ||
        (await this.managerService.canManage(currentEmployee.id, leaveRequest.employeeId));

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions to update this request',
        });
        return;
      }

      // Store old values for balance recalculation
      const oldDays = leaveRequest.days;

      // Update fields if provided
      if (startDate) {
        leaveRequest.startDate = new Date(startDate);
      }
      if (endDate) {
        leaveRequest.endDate = new Date(endDate);
      }
      if (reason) {
        leaveRequest.reason = reason;
      }

      // Recalculate days if dates changed
      if (startDate || endDate) {
        // Validate dates
        if (leaveRequest.endDate < leaveRequest.startDate) {
          res.status(400).json({
            success: false,
            message: 'End date cannot be before start date',
          });
          return;
        }

        // Check for overlapping leaves (exclude current request)
        const hasOverlap = await this.leaveService.checkLeaveOverlap(
          leaveRequest.employeeId,
          leaveRequest.startDate,
          leaveRequest.endDate,
          id, // Exclude current request from overlap check
        );

        if (hasOverlap) {
          res.status(400).json({
            success: false,
            message: 'Leave request overlaps with existing approved or pending requests',
          });
          return;
        }

        // Recalculate business days
        const holidayRepository = getRepository(Holiday);
        const holidays = await holidayRepository.find();
        const holidayDates = holidays.map((h) => h.date);

        const newDays = this.leaveCalculator.calculateBusinessDays(
          leaveRequest.startDate,
          leaveRequest.endDate,
          holidayDates,
        );

        if (newDays <= 0) {
          res.status(400).json({
            success: false,
            message: 'Leave request must include at least one business day',
          });
          return;
        }

        // Update leave balance if days changed
        if (newDays !== oldDays) {
          const leaveBalanceRepository = getRepository(LeaveBalance);
          const currentYear = new Date().getFullYear();
          const balance = await leaveBalanceRepository.findOne({
            where: {
              employeeId: leaveRequest.employeeId,
              leaveTypeId: leaveRequest.leaveTypeId,
              year: currentYear,
            },
          });

          if (balance) {
            // Adjust pending balance: remove old days, add new days
            const daysDifference = newDays - oldDays;
            const newPending = Number(balance.pending) + daysDifference;

            // Check if enough balance available for the change
            const availableBalance =
              Number(balance.allocated) +
              Number(balance.carryOver) +
              Number(balance.adjustment || 0) -
              Number(balance.used) -
              Number(balance.pending);

            if (availableBalance + oldDays < newDays) {
              res.status(400).json({
                success: false,
                message: 'Insufficient leave balance for the updated dates',
                available: availableBalance + oldDays,
                requested: newDays,
              });
              return;
            }

            balance.pending = newPending;
            await leaveBalanceRepository.save(balance);
          }

          leaveRequest.days = newDays;
        }
      }

      // Save updated leave request
      const updatedRequest = await leaveRequestRepository.save(leaveRequest);

      // Send notification about the update (reuse existing notification)
      await this.notificationService.sendLeaveRequestCreatedNotification(updatedRequest.id);

      // Log audit event for leave update
      await this.auditService.logSecurityEvent({
        userId: currentEmployee.id,
        action: 'CRITICAL_UPDATE',
        entityType: 'LeaveRequest',
        entityId: updatedRequest.id,
        description: `Leave request updated. Old days: ${oldDays}, New days: ${updatedRequest.days}`,
      });

      res.status(200).json({
        success: true,
        message: 'Leave request updated successfully',
        data: updatedRequest,
      });
    } catch (error: any) {
      console.error('Error updating leave request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update leave request',
        error: error.message,
      });
    }
  }
}
