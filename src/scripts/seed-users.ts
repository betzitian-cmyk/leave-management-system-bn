// src/scripts/seed-users.ts

import { getRepository } from 'typeorm';
import { User, UserStatus, AuthProvider } from '../models/User';
import { Role } from '../models/Role';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  try {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    // Check if users already exist
    const count = await userRepository.count();
    if (count > 0) {
      console.log('Users already exist. Skipping seed.');
      return;
    }

    // Get roles for user creation
    const roles = await roleRepository.find();
    if (roles.length === 0) {
      console.log('No roles found. Please run role seed first.');
      return;
    }

    const adminRole = roles.find((r) => r.name === 'ADMIN');
    const hrManagerRole = roles.find((r) => r.name === 'HR_MANAGER');
    const managerRole = roles.find((r) => r.name === 'MANAGER');
    const employeeRole = roles.find((r) => r.name === 'EMPLOYEE');

    if (!adminRole || !hrManagerRole || !managerRole || !employeeRole) {
      console.log('Required roles not found. Please run role seed first.');
      return;
    }

    // Hash password for default users
    const defaultPassword = await bcrypt.hash('password123', 12);

    // Create default users
    const defaultUsers = [
      {
        email: 'admin@company.com',
        password: defaultPassword,
        firstName: 'John',
        lastName: 'Admin',
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        role: adminRole,
        roleId: adminRole.id,
      },
      {
        email: 'hr.manager@company.com',
        password: defaultPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        role: hrManagerRole,
        roleId: hrManagerRole.id,
      },
      {
        email: 'manager@company.com',
        password: defaultPassword,
        firstName: 'David',
        lastName: 'Wilson',
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        role: managerRole,
        roleId: managerRole.id,
      },
      {
        email: 'employee@company.com',
        password: defaultPassword,
        firstName: 'Michael',
        lastName: 'Chen',
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        role: employeeRole,
        roleId: employeeRole.id,
      },
      {
        email: 'guest@company.com',
        password: defaultPassword,
        firstName: 'Guest',
        lastName: 'User',
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        role: roles.find((r) => r.name === 'GUEST')!,
        roleId: roles.find((r) => r.name === 'GUEST')!.id,
      },
    ];

    for (const userData of defaultUsers) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
    }

    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// Export the function for use in seed-all.ts
export { seedUsers };
