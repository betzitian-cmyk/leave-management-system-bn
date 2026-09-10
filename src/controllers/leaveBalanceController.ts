// filepath: src/controllers/leaveBalanceController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Employee, LeaveBalance, LeaveType, AuditLog } from '../models';

export class LeaveBalanceController {
  async getMyLeaveBalances(req: Request, res: Response): Promise<void> {
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

      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();

      const balances = await leaveBalanceRepository.find({
        where: {
          employeeId: employee.id,
          year: currentYear,
        },
        relations: ['leaveType'],
      });

      // Calculate available balance for each leave type
      const balancesWithAvailable = balances.map((balance) => ({
        ...balance,
        available:
          Number(balance.allocated) +
          Number(balance.carryOver) +
          Number(balance.adjustment || 0) -
          Number(balance.used) -
          Number(balance.pending),
      }));

      res.json(balancesWithAvailable);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave balances', error });
    }
  }

  async getEmployeeLeaveBalances(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const userId = (req as any).user.id;

      // Check if requester is HR/Admin or the employee's manager
      const employeeRepository = getRepository(Employee);
      const requester = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      const targetEmployee = await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['department', 'user', 'manager'],
      });

      if (!requester || !targetEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Check permissions (this is simplified, you'll need proper role checks)
      const isManager = targetEmployee.managerId === requester.id;
      const isAdmin = requester.position === 'ADMIN'; // Replace with actual admin check

      if (!isManager && !isAdmin && requester.id !== targetEmployee.id) {
        res
          .status(403)
          .json({ message: 'You do not have permission to view these leave balances' });
        return;
      }

      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();

      const balances = await leaveBalanceRepository.find({
        where: {
          employeeId,
          year: currentYear,
        },
        relations: ['leaveType'],
      });

      // Calculate available balance for each leave type
      const balancesWithAvailable = balances.map((balance) => ({
        ...balance,
        available:
          Number(balance.allocated) +
          Number(balance.carryOver) +
          Number(balance.adjustment || 0) -
          Number(balance.used) -
          Number(balance.pending),
      }));

      res.status(200).json(balancesWithAvailable);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave balances', error });
    }
  }

  async adjustLeaveBalance(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, leaveTypeId, adjustment, reason } = req.body;
      const userId = (req as any).user.id;

      // Validate input
      if (!employeeId || !leaveTypeId || adjustment === undefined || !reason) {
        res.status(400).json({
          message: 'All fields are required: employeeId, leaveTypeId, adjustment, reason',
        });
        return;
      }

      // Check if requester is HR/Admin
      const employeeRepository = getRepository(Employee);
      const requester = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!requester) {
        res.status(404).json({ message: 'Requester not found' });
        return;
      }

      // Check if requester has admin privileges
      if (requester.position !== 'ADMIN') {
        res.status(403).json({ message: 'Only administrators can adjust leave balances' });
        return;
      }

      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();

      let balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId,
          leaveTypeId,
          year: currentYear,
        },
      });

      if (!balance) {
        // Create a new balance if it doesn't exist
        const leaveTypeRepository = getRepository(LeaveType);
        const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });

        if (!leaveType) {
          res.status(404).json({ message: 'Leave type not found' });
          return;
        }

        balance = leaveBalanceRepository.create({
          employeeId,
          leaveTypeId,
          year: currentYear,
          allocated: 0,
          used: 0,
          pending: 0,
          carryOver: 0,
          adjustment: 0,
        });
      }

      // Store old values for audit
      const oldValues = { ...balance };

      // Update the balance with proper numeric handling
      const currentAdjustment = Number(balance.adjustment || 0);
      const newAdjustment = currentAdjustment + Number(adjustment);

      balance.adjustment = newAdjustment;
      balance.adjustmentReason = reason;

      const updatedBalance = await leaveBalanceRepository.save(balance);

      // Create audit log
      const auditLogRepository = getRepository(AuditLog);
      await auditLogRepository.save({
        userId: requester.user?.id,
        action: 'ADJUST_BALANCE',
        entityType: 'LeaveBalance',
        entityId: balance.id,
        oldValues,
        newValues: updatedBalance,
        ipAddress: req.ip,
      });

      res.status(200).json({
        message: 'Leave balance adjusted successfully',
        balance: {
          ...updatedBalance,
          available:
            Number(updatedBalance.allocated) +
            Number(updatedBalance.carryOver) +
            Number(updatedBalance.adjustment) -
            Number(updatedBalance.used) -
            Number(updatedBalance.pending),
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to adjust leave balance', error });
    }
  }
}
