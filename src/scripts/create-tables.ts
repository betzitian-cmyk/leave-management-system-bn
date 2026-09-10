import { initializeDatabase } from '../config/database';

async function createDatabaseTables() {
  try {
    console.log('Starting database initialization...');
    const connection = await initializeDatabase();

    // Use synchronize with false to prevent dropping tables
    // This will create missing tables but won't delete or alter existing ones
    await connection.synchronize(false);

    console.log('Database tables created successfully');

    // Close the connection when done
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

createDatabaseTables();
