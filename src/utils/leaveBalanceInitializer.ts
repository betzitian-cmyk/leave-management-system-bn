import { getRepository } from 'typeorm';
import { LeaveBalance, Employee, LeaveType } from '../models';

export class LeaveBalanceInitializer {
  /**
   * Ensures that a leave balance exists for an employee for a specific leave type
   * If it doesn't exist, creates it with default values
   */
  public static async ensureLeaveBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveBalance> {
    const leaveBalanceRepository = getRepository(LeaveBalance);

    // Check if balance exists
    let balance = await leaveBalanceRepository.findOne({
      where: {
        employeeId,
        leaveTypeId,
        year,
      },
    });

    // If no balance exists, create one
    if (!balance) {
      const leaveTypeRepository = getRepository(LeaveType);
      const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });

      if (!leaveType) {
        throw new Error('Leave type not found');
      }

      // Calculate allocation based on leave type accrual rate
      const defaultAllocation = Number(leaveType.accrualRate) * 12; // Monthly accrual * 12 months

      balance = leaveBalanceRepository.create({
        employeeId,
        leaveTypeId,
        year,
        allocated: defaultAllocation,
        used: 0,
        pending: 0,
        carryOver: 0,
        adjustment: 0, // Add this field from your model
        adjustmentReason: 'Initial allocation', // Use this instead of notes
      });

      await leaveBalanceRepository.save(balance);
    }

    return balance;
  }
}
