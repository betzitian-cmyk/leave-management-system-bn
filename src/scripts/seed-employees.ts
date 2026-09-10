import { getRepository } from 'typeorm';
import { Employee, Department, User } from '../models';
import { initializeDatabase } from '../config/database';

async function seedEmployees() {
  try {
    const employeeRepository = getRepository(Employee);
    const departmentRepository = getRepository(Department);
    const userRepository = getRepository(User);

    const count = await employeeRepository.count();
    if (count > 0) {
      console.log('Employees already exist. Skipping seed.');
      return;
    }

    const departments = await departmentRepository.find();
    if (departments.length === 0) {
      console.log('No departments found. Please run department seed first.');
      return;
    }

    const users = await userRepository.find();
    if (users.length === 0) {
      console.log('No users found. Please run user seed first.');
      return;
    }

    // Validate that we have the required departments
    if (departments.length < 3) {
      console.log('Insufficient departments. Need at least 3 departments for employee seeding.');
      return;
    }

    // Find specific users
    const adminUser = users.find((u) => u.email === 'admin@company.com');
    const hrManagerUser = users.find((u) => u.email === 'hr.manager@company.com');
    const managerUser = users.find((u) => u.email === 'manager@company.com');
    const employeeUser = users.find((u) => u.email === 'employee@company.com');

    if (!adminUser || !hrManagerUser || !managerUser || !employeeUser) {
      console.log('Required users not found. Please run user seed first.');
      return;
    }

    // Create default employees linked to users
    const defaultEmployees = [
      {
        user: adminUser,
        position: 'ADMIN',
        hireDate: new Date('2020-01-15'),
        departmentId: departments[0].id, // HR
        status: 'ACTIVE',
      },
      {
        user: hrManagerUser,
        position: 'HR_MANAGER',
        hireDate: new Date('2021-03-20'),
        departmentId: departments[0].id, // HR
        status: 'ACTIVE',
      },
      {
        user: managerUser,
        position: 'MANAGER',
        hireDate: new Date('2021-11-05'),
        departmentId: departments[2].id, // IT
        status: 'ACTIVE',
      },
      {
        user: employeeUser,
        position: 'EMPLOYEE',
        hireDate: new Date('2022-06-10'),
        departmentId: departments[2].id, // IT
        status: 'ACTIVE',
      },
    ];

    for (const emp of defaultEmployees) {
      if (emp.user) {
        const employee = employeeRepository.create(emp);
        await employeeRepository.save(employee);
      }
    }

    // Set up manager relationships
    const michael = await employeeRepository.findOne({
      where: { user: { id: employeeUser.id } },
      relations: ['user'],
    });
    const david = await employeeRepository.findOne({
      where: { user: { id: managerUser.id } },
      relations: ['user'],
    });

    if (michael && david) {
      michael.managerId = david.id;
      await employeeRepository.save(michael);
    }

    console.log('✅ Employees seeded successfully and linked to users');
  } catch (error) {
    console.error('Error seeding employees:', error);
    throw error;
  }
}

export { seedEmployees };
