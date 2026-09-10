import { getRepository } from 'typeorm';
import { LeaveRequest, Employee, LeaveType } from '../models';
import { initializeDatabase } from '../config/database';

async function seedLeaveRequests() {
  try {
    // Database connection is already established by the calling script
    const leaveRequestRepository = getRepository(LeaveRequest);
    const employeeRepository = getRepository(Employee);
    const leaveTypeRepository = getRepository(LeaveType);

    // Check if leave requests already exist
    const count = await leaveRequestRepository.count();
    if (count > 0) {
      console.log('Leave requests already exist. Skipping seed.');
      return;
    }

    // Get employees and leave types
    const employees = await employeeRepository.find({ where: { position: 'EMPLOYEE' } });
    const leaveTypes = await leaveTypeRepository.find({ where: { name: 'Annual Leave' } });

    if (employees.length === 0) {
      console.log('No employees found. Please run employee seed first.');
      return;
    }

    if (leaveTypes.length === 0) {
      console.log('No leave types found. Please run leave type seed first.');
      return;
    }

    const annualLeaveType = leaveTypes[0];

    // Create sample leave requests - only create as many as we have employees
    const sampleLeaveRequests = [];

    // First leave request
    if (employees[0]) {
      sampleLeaveRequests.push({
        employeeId: employees[0].id,
        leaveTypeId: annualLeaveType.id,
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-19'),
        days: 5, // 5 days (including start and end dates)
        reason: 'Family vacation',
        status: 'APPROVED' as any,
        submittedAt: new Date('2025-01-20'),
      });
    }

    // Second leave request (only if we have a second employee)
    if (employees[1]) {
      sampleLeaveRequests.push({
        employeeId: employees[1].id,
        leaveTypeId: annualLeaveType.id,
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-12'),
        days: 3, // 3 days (including start and end dates)
        reason: 'Personal time off',
        status: 'PENDING' as any,
        submittedAt: new Date('2025-02-25'),
      });
    }

    // Create additional leave requests if we have more employees
    for (let i = 2; i < employees.length; i++) {
      sampleLeaveRequests.push({
        employeeId: employees[i].id,
        leaveTypeId: annualLeaveType.id,
        startDate: new Date(
          `2025-0${Math.floor(Math.random() * 6) + 4}-${Math.floor(Math.random() * 28) + 1}`,
        ),
        endDate: new Date(
          `2025-0${Math.floor(Math.random() * 6) + 4}-${Math.floor(Math.random() * 28) + 1}`,
        ),
        days: Math.floor(Math.random() * 5) + 1,
        reason: 'Personal time off',
        status: 'PENDING' as any,
        submittedAt: new Date('2025-02-25'),
      });
    }

    if (sampleLeaveRequests.length === 0) {
      console.log('No leave requests created - insufficient employee data.');
      return;
    }

    for (const leaveRequest of sampleLeaveRequests) {
      const newLeaveRequest = leaveRequestRepository.create(leaveRequest);
      await leaveRequestRepository.save(newLeaveRequest);
    }

    console.log(`✅ ${sampleLeaveRequests.length} leave requests seeded successfully`);
  } catch (error) {
    console.error('Error seeding leave requests:', error);
    throw error;
  }
}

// Export the function for use in seed-all.ts
export { seedLeaveRequests };
