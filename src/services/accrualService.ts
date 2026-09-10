// filepath: src/services/accrualService.ts
import { LeaveService } from './leaveService';
import { getRepository } from 'typeorm';
import { LeaveBalance, Employee, LeaveType } from '../models';
import { LessThanOrEqual } from 'typeorm';

export class AccrualService {
  private leaveService = new LeaveService();

  /**
   * Process monthly leave accrual for all employees
   */
  async processMonthlyAccrual(year: number, month: number): Promise<void> {
    try {
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
            // Create new balance if it doesn't exist
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

          // Only accrue if the month is after or equal to hire month
          if (month >= startMonth) {
            const monthlyAccrual = Number(leaveType.accrualRate);

            // Add monthly accrual to allocated balance
            balance.allocated = Number(balance.allocated) + monthlyAccrual;

            await leaveBalanceRepository.save(balance);
          }
        }
      }
    } catch (error) {
      console.error('Error processing monthly accrual:', error);
      throw error;
    }
  }

  /**
   * Process year-end leave balance carry-over
   */
  async processYearEndCarryOver(fromYear: number, toYear: number): Promise<void> {
    try {
      await this.leaveService.processYearEndCarryOver(fromYear, toYear);
    } catch (error) {
      console.error('Error processing year-end carry-over:', error);
      throw error;
    }
  }

  /**
   * Initialize leave balances for a new year
   */
  async initializeYearBalances(year: number): Promise<void> {
    try {
      await this.leaveService.calculateLeaveBalances(year);
    } catch (error) {
      console.error('Error initializing year balances:', error);
      throw error;
    }
  }

  /**
   * Process probation period completion for employees
   */
  async processProbationCompletion(): Promise<void> {
    try {
      const employeeRepository = getRepository(Employee);
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const leaveTypeRepository = getRepository(LeaveType);

      // Get employees who completed probation in the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const employees = await employeeRepository.find({
        where: {
          status: 'ACTIVE',
          hireDate: LessThanOrEqual(lastMonth),
        },
      });

      for (const employee of employees) {
        // Check if probation period is completed (typically 3-6 months)
        const hireDate = new Date(employee.hireDate);
        const monthsSinceHire =
          (new Date().getFullYear() - hireDate.getFullYear()) * 12 +
          (new Date().getMonth() - hireDate.getMonth());

        // Assuming 6-month probation period
        if (monthsSinceHire >= 6) {
          // Get active leave types
          const leaveTypes = await leaveTypeRepository.find({ where: { active: true } });

          for (const leaveType of leaveTypes) {
            // Check if leave balance exists for current year
            let balance = await leaveBalanceRepository.findOne({
              where: {
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                year: new Date().getFullYear(),
              },
            });

            if (!balance) {
              // Create new balance with full annual allocation
              const annualAllocation = Number(leaveType.accrualRate) * 12;

              balance = leaveBalanceRepository.create({
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                year: new Date().getFullYear(),
                allocated: annualAllocation,
                used: 0,
                pending: 0,
                carryOver: 0,
                adjustment: 0,
              });

              await leaveBalanceRepository.save(balance);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing probation completion:', error);
      throw error;
    }
  }

  /**
   * Get accrual summary for reporting
   */
  async getAccrualSummary(year: number, month?: number): Promise<any> {
    try {
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const employeeRepository = getRepository(Employee);
      const leaveTypeRepository = getRepository(LeaveType);

      const queryBuilder = leaveBalanceRepository
        .createQueryBuilder('lb')
        .select('e.firstName', 'firstName')
        .addSelect('e.lastName', 'lastName')
        .addSelect('lt.name', 'leaveType')
        .addSelect('lb.allocated', 'allocated')
        .addSelect('lb.used', 'used')
        .addSelect('lb.pending', 'pending')
        .addSelect('lb.carryOver', 'carryOver')
        .addSelect('lb.adjustment', 'adjustment')
        .innerJoin('lb.employee', 'e')
        .innerJoin('lb.leaveType', 'lt')
        .where('lb.year = :year', { year });

      if (month !== undefined) {
        // Filter by month if specified
        // This would require additional logic to track monthly accrual
      }

      const balances = await queryBuilder.getRawMany();

      return {
        year,
        month,
        summary: balances.map((balance) => ({
          ...balance,
          available:
            Number(balance.allocated) +
            Number(balance.carryOver) +
            Number(balance.adjustment) -
            Number(balance.used) -
            Number(balance.pending),
        })),
      };
    } catch (error) {
      console.error('Error getting accrual summary:', error);
      throw error;
    }
  }
}
