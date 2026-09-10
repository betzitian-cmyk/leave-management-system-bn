import { getRepository } from 'typeorm';
import { LeaveType } from '../models';
import { initializeDatabase } from '../config/database';

async function seedLeaveTypes() {
  try {
    // Database connection is already established by the calling script
    const leaveTypeRepository = getRepository(LeaveType);

    // Check if leave types already exist
    const count = await leaveTypeRepository.count();
    if (count > 0) {
      console.log('Leave types already exist. Skipping seed.');
      return;
    }

    // Create default leave types
    const defaultLeaveTypes = [
      {
        name: 'Annual Leave',
        description: 'Regular paid vacation time',
        maxDays: 20,
        active: true,
        requiresApproval: true,
        color: '#4CAF50',
      },
      {
        name: 'Sick Leave',
        description: 'Medical leave for illness or injury',
        maxDays: 10,
        active: true,
        requiresApproval: false,
        color: '#FF9800',
      },
      {
        name: 'Personal Leave',
        description: 'Personal time off for various reasons',
        maxDays: 5,
        active: true,
        requiresApproval: true,
        color: '#2196F3',
      },
      {
        name: 'Maternity Leave',
        description: 'Leave for expecting mothers',
        maxDays: 90,
        active: true,
        requiresApproval: true,
        color: '#E91E63',
      },
      {
        name: 'Paternity Leave',
        description: 'Leave for new fathers',
        maxDays: 14,
        active: true,
        requiresApproval: true,
        color: '#9C27B0',
      },
      {
        name: 'Bereavement Leave',
        description: 'Leave for family bereavement',
        maxDays: 3,
        active: true,
        requiresApproval: false,
        color: '#795548',
      },
      {
        name: 'Unpaid Leave',
        description: 'Unpaid time off',
        maxDays: 0,
        active: true,
        requiresApproval: true,
        color: '#607D8B',
      },
    ];

    for (const leaveType of defaultLeaveTypes) {
      const newLeaveType = leaveTypeRepository.create(leaveType);
      await leaveTypeRepository.save(newLeaveType);
    }

    console.log('✅ Leave types seeded successfully');
  } catch (error) {
    console.error('Error seeding leave types:', error);
    throw error;
  }
}

// Export the function for use in seed-all.ts
export { seedLeaveTypes };
