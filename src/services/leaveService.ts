import { getRepository } from 'typeorm';
import { LeaveRequest, Employee, LeaveType, LeaveBalance, Holiday } from '../models';
import { LeaveCalculator } from '../utils/leaveCalculator';

export class LeaveService {
  private leaveCalculator = new LeaveCalculator();

  /**
   * Check if a leave request overlaps with existing approved/pending requests
   */
  async checkLeaveOverlap(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string,
  ): Promise<boolean> {
    const leaveRequestRepository = getRepository(LeaveRequest);

    const overlappingRequests = await leaveRequestRepository
      .createQueryBuilder('lr')
      .where('lr.employeeId = :employeeId', { employeeId })
      .andWhere('lr.status IN (:...statuses)', { statuses: ['PENDING', 'APPROVED'] })
      .andWhere('(lr.startDate <= :endDate AND lr.endDate >= :startDate)', { startDate, endDate });

    if (excludeRequestId) {
      overlappingRequests.andWhere('lr.id != :excludeId', { excludeId: excludeRequestId });
    }

    const count = await overlappingRequests.getCount();
    return count > 0;
  }

  /**
   * Validate leave request business rules
   */
  async validateLeaveRequest(
    employeeId: string,
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      errors.push('Start date cannot be in the past');
    }

    if (endDate < startDate) {
      errors.push('End date must be after start date');
    }

    // Check for overlapping leaves
    const hasOverlap = await this.checkLeaveOverlap(employeeId, startDate, endDate);
    if (hasOverlap) {
      errors.push('Leave request overlaps with existing approved or pending requests');
    }

    // Check leave type specific rules
    const leaveTypeRepository = getRepository(LeaveType);
    const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });

    if (leaveType) {
      // Check max consecutive days
      if (leaveType.maxConsecutiveDays) {
        const businessDays = this.leaveCalculator.calculateBusinessDays(startDate, endDate);
        if (businessDays > leaveType.maxConsecutiveDays) {
          errors.push(
            `Maximum consecutive days for ${leaveType.name} is ${leaveType.maxConsecutiveDays}`,
          );
        }
      }

      // Check max days per year
      if (leaveType.maxDays) {
        const currentYear = new Date().getFullYear();
        const leaveBalanceRepository = getRepository(LeaveBalance);
        const balance = await leaveBalanceRepository.findOne({
          where: {
            employeeId,
            leaveTypeId,
            year: currentYear,
          },
        });

        if (balance) {
          const usedDays = Number(balance.used);
          const requestedDays = this.leaveCalculator.calculateBusinessDays(startDate, endDate);

          if (usedDays + requestedDays > leaveType.maxDays) {
            errors.push(`Maximum days per year for ${leaveType.name} is ${leaveType.maxDays}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate and update leave balances for a specific year
   */
  async calculateLeaveBalances(year: number): Promise<void> {
    const leaveBalanceRepository = getRepository(LeaveBalance);
    const employeeRepository = getRepository(Employee);
    const leaveTypeRepository = getRepository(LeaveType);

    const employees = await employeeRepository.find();
    const leaveTypes = await leaveTypeRepository.find({ where: { active: true } });

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        let balance = await leaveBalanceRepository.findOne({
          where: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year,
          },
        });

        if (!balance) {
          // Create new balance
          balance = leaveBalanceRepository.create({
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year,
            allocated: 0,
            used: 0,
            pending: 0,
            carryOver: 0,
            adjustment: 0,
          });
        }

        // Calculate monthly accrual
        const hireDate = new Date(employee.hireDate);
        const startMonth = hireDate.getFullYear() === year ? hireDate.getMonth() : 0;
        const monthsWorked = 12 - startMonth;

        const monthlyAccrual = Number(leaveType.accrualRate);
        const totalAccrual = monthlyAccrual * monthsWorked;

        // Add carry-over from previous year if applicable
        if (year > hireDate.getFullYear()) {
          const previousBalance = await leaveBalanceRepository.findOne({
            where: {
              employeeId: employee.id,
              leaveTypeId: leaveType.id,
              year: year - 1,
            },
          });

          if (previousBalance) {
            const unusedDays =
              Number(previousBalance.allocated) +
              Number(previousBalance.adjustment || 0) -
              Number(previousBalance.used);
            balance.carryOver = Math.max(0, unusedDays);
          }
        }

        balance.allocated = totalAccrual;
        await leaveBalanceRepository.save(balance);
      }
    }
  }

  /**
   * Get leave statistics for reporting
   */
  async getLeaveStatistics(departmentId?: string, year?: number, month?: number): Promise<any> {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || null;

    let dateFilter: any = {
      startDate: new Date(`${currentYear}-01-01`),
      endDate: new Date(`${currentYear}-12-31`),
    };

    if (currentMonth) {
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      dateFilter = { startDate, endDate };
    }

    const queryBuilder = getRepository(LeaveRequest)
      .createQueryBuilder('lr')
      .select('COUNT(lr.id)', 'totalRequests')
      .addSelect('SUM(CASE WHEN lr.status = :pending THEN 1 ELSE 0 END)', 'pendingRequests')
      .addSelect('SUM(CASE WHEN lr.status = :approved THEN 1 ELSE 0 END)', 'approvedRequests')
      .addSelect('SUM(CASE WHEN lr.status = :rejected THEN 1 ELSE 0 END)', 'rejectedRequests')
      .addSelect('SUM(CASE WHEN lr.status = :cancelled THEN 1 ELSE 0 END)', 'cancelledRequests')
      .addSelect('SUM(lr.days)', 'totalDays')
      .setParameters({
        pending: 'PENDING',
        approved: 'APPROVED',
        rejected: 'REJECTED',
        cancelled: 'CANCELLED',
      })
      .where('lr.startDate >= :startDate', { startDate: dateFilter.startDate })
      .andWhere('lr.endDate <= :endDate', { endDate: dateFilter.endDate });

    if (departmentId) {
      queryBuilder
        .innerJoin('lr.employee', 'e')
        .leftJoinAndSelect('e.user', 'user')
        .leftJoinAndSelect('e.department', 'dept')
        .andWhere('e.departmentId = :departmentId', { departmentId });
    }

    const stats = await queryBuilder.getRawOne();

    return {
      year: currentYear,
      month: currentMonth,
      departmentId,
      statistics: {
        totalRequests: parseInt(stats.totalRequests) || 0,
        pendingRequests: parseInt(stats.pendingRequests) || 0,
        approvedRequests: parseInt(stats.approvedRequests) || 0,
        rejectedRequests: parseInt(stats.rejectedRequests) || 0,
        cancelledRequests: parseInt(stats.cancelledRequests) || 0,
        totalDays: parseFloat(stats.totalDays) || 0,
      },
    };
  }

  /**
   * Process year-end leave balance carry-over
   */
  async processYearEndCarryOver(fromYear: number, toYear: number): Promise<void> {
    const leaveBalanceRepository = getRepository(LeaveBalance);

    const balances = await leaveBalanceRepository.find({
      where: { year: fromYear },
    });

    for (const balance of balances) {
      const unusedDays =
        Number(balance.allocated) + Number(balance.adjustment || 0) - Number(balance.used);
      const carryOverDays = Math.max(0, unusedDays);

      if (carryOverDays > 0) {
        // Create or update next year's balance
        let nextYearBalance = await leaveBalanceRepository.findOne({
          where: {
            employeeId: balance.employeeId,
            leaveTypeId: balance.leaveTypeId,
            year: toYear,
          },
        });

        if (!nextYearBalance) {
          nextYearBalance = leaveBalanceRepository.create({
            employeeId: balance.employeeId,
            leaveTypeId: balance.leaveTypeId,
            year: toYear,
            allocated: 0,
            used: 0,
            pending: 0,
            carryOver: carryOverDays,
            adjustment: 0,
          });
        } else {
          nextYearBalance.carryOver = carryOverDays;
        }

        await leaveBalanceRepository.save(nextYearBalance);
      }
    }
  }
}
