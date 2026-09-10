import { getRepository } from 'typeorm';
import { Department } from '../models/Department';
import { initializeDatabase } from '../config/database';

async function seedDepartments() {
  try {
    //await initializeDatabase();
    const departmentRepository = getRepository(Department);

    // Check if departments already exist
    const count = await departmentRepository.count();
    if (count > 0) {
      console.log('Departments already exist. Skipping seed.');
      return;
    }

    // Create default departments
    const defaultDepartments = [
      {
        name: 'Human Resources',
        description: 'Manages employee relations, recruitment, and policies',
      },
      {
        name: 'Finance',
        description: 'Handles financial operations, budgeting, and accounting',
      },
      {
        name: 'Information Technology',
        description: 'Manages IT infrastructure, software development, and technical support',
      },
      {
        name: 'Operations',
        description: 'Oversees day-to-day business operations',
      },
      {
        name: 'Marketing',
        description: 'Handles promotion, advertising, and brand management',
      },
    ];

    for (const dept of defaultDepartments) {
      const department = departmentRepository.create(dept);
      await departmentRepository.save(department);
    }

    console.log('✅ Departments seeded successfully');
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
}

// Export the function for use in seed-all.ts
export { seedDepartments };
