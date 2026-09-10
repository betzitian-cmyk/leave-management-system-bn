import { initializeDatabase } from '../config/database';

async function dropDatabaseTables() {
  try {
    console.log('Starting database cleanup...');
    const connection = await initializeDatabase();

    // Drop all tables
    await connection.dropDatabase();

    console.log('All database tables dropped successfully');

    // Close the connection when done
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error dropping database tables:', error);
    process.exit(1);
  }
}

dropDatabaseTables();
