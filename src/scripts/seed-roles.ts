// src/scripts/seed-roles.ts

import { getRepository } from 'typeorm';
import { Role } from '../models/Role';

async function seedRoles() {
  try {
    const roleRepository = getRepository(Role);

    // Check if roles already exist
    const count = await roleRepository.count();
    if (count > 0) {
      console.log('Roles already exist. Skipping seed.');
      return;
    }

    // Create default roles - simplified
    const defaultRoles = [
      {
        name: 'ADMIN',
        description: 'System administrator with full access',
      },
      {
        name: 'HR_MANAGER',
        description: 'HR manager with HR-related access',
      },
      {
        name: 'MANAGER',
        description: 'Department manager with team management access',
      },
      {
        name: 'EMPLOYEE',
        description: 'Regular employee with basic access',
      },
      {
        name: 'GUEST',
        description: 'Guest user with minimal access',
      },
    ];

    for (const roleData of defaultRoles) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
    }

    console.log('✅ Roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
}

// Export the function for use in seed-all.ts
export { seedRoles };
