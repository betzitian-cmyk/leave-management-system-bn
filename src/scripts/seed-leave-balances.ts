import { getRepository } from 'typeorm';
import { LeaveBalance, Employee, LeaveType } from '../models';
import { initializeDatabase } from '../config/database';

async function seedLeaveBalances() {
  try {
    // Database connection is already established by the calling script
    const leaveBalanceRepository = getRepository(LeaveBalance);
    const employeeRepository = getRepository(Employee);
    const leaveTypeRepository = getRepository(LeaveType);

    // Check if leave balances already exist
    const count = await leaveBalanceRepository.count();
    if (count > 0) {
      console.log('Leave balances already exist. Skipping seed.');
      return;
    }

    // Get employees and leave types
    const employees = await employeeRepository.find();
    const leaveTypes = await leaveTypeRepository.find();

    if (employees.length === 0) {
      console.log('No employees found. Please run employee seed first.');
      return;
    }

    if (leaveTypes.length === 0) {
      console.log('No leave types found. Please run leave type seed first.');
      return;
    }

    // Create leave balances for each employee
    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        // Skip unpaid leave for initial balance
        if (leaveType.name === 'Unpaid Leave') continue;

        const leaveBalance = leaveBalanceRepository.create({
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: new Date().getFullYear(),
          allocated: leaveType.maxDays || 0,
          used: 0,
          pending: 0,
          carryOver: 0,
          adjustment: 0,
        });

        await leaveBalanceRepository.save(leaveBalance);
      }
    }

    console.log('✅ Leave balances seeded successfully');
  } catch (error) {
    console.error('Error seeding leave balances:', error);
    throw error;
  }
}

// Export the function for use in seed-all.ts
export { seedLeaveBalances };
