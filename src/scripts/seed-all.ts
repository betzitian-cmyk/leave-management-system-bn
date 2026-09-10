import { initializeDatabase } from '../config/database';
import { seedRoles } from './seed-roles';
import { seedUsers } from './seed-users';
import { seedDepartments } from './seed-departments';
import { seedEmployees } from './seed-employees';
import { seedLeaveTypes } from './seed-leave-types';
import { seedLeaveBalances } from './seed-leave-balances';
import { seedLeaveRequests } from './seed-leave-requests';
import { seedHRData } from './seed-hr-data';

async function seedAll() {
  try {
    console.log('🚀 Starting comprehensive seeding process...');

    // Initialize database connection once
    await initializeDatabase();

    // Run seeds in order
    await seedRoles();
    await seedUsers();
    await seedDepartments();
    await seedEmployees();
    await seedLeaveTypes();
    await seedLeaveBalances();
    await seedLeaveRequests();
    await seedHRData();

    console.log('✅ All seeding completed successfully!');
    console.log('\n🔑 Test credentials:');
    console.log('   • Admin: admin@company.com / password123');
    console.log('   • HR Manager: hr.manager@company.com / password123');
    console.log('   • Manager: manager@company.com / password123');
    console.log('   • Employee: employee@company.com / password123');
    console.log('   • Guest: guest@company.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedAll();
