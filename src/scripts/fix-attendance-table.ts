// src/scripts/fix-attendance-table.ts
// Comprehensive script to fix attendance table issues

import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

async function fixAttendanceTable() {
  let connection;
  try {
    logger.info('🔄 Connecting to database...');

    connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
    });

    logger.info('✅ Connected to database');

    // Step 1: Drop the attendances table completely
    logger.info('🗑️  Step 1: Dropping attendances table...');
    try {
      await connection.query('DROP TABLE IF EXISTS attendances CASCADE');
      logger.info('✅ Dropped attendances table');
    } catch (error: any) {
      logger.warn(`⚠️  Error dropping table: ${error.message}`);
    }

    // Step 2: Drop ALL enum types that might conflict
    logger.info('🗑️  Step 2: Dropping all attendance-related enum types...');
    try {
      const enumTypes = await connection.query(`
        SELECT typname 
        FROM pg_type 
        WHERE typtype = 'e' 
        AND (typname LIKE '%attendance%' OR typname LIKE '%status%' OR typname LIKE '%verification%')
      `);

      for (const row of enumTypes) {
        try {
          await connection.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
          logger.info(`✅ Dropped enum type: ${row.typname}`);
        } catch (error: any) {
          logger.warn(`⚠️  Could not drop ${row.typname}: ${error.message}`);
        }
      }
    } catch (error: any) {
      logger.warn(`⚠️  Error dropping enum types: ${error.message}`);
    }

    // Step 3: Verify all enum types are gone
    logger.info('🔍 Step 3: Verifying cleanup...');
    const remainingEnums = await connection.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND (typname LIKE '%attendance%' OR typname LIKE '%status%' OR typname LIKE '%verification%')
    `);

    if (remainingEnums.length > 0) {
      logger.warn(`⚠️  Warning: ${remainingEnums.length} enum types still exist:`);
      remainingEnums.forEach((row: any) => {
        logger.warn(`   - ${row.typname}`);
      });
    } else {
      logger.info('✅ All attendance-related enum types have been removed');
    }

    // Step 4: Check for any constraints or indexes that might conflict
    logger.info('🔍 Step 4: Checking for conflicting constraints...');
    try {
      const constraints = await connection.query(`
        SELECT conname, contype
        FROM pg_constraint
        WHERE conrelid = 'attendances'::regclass
      `);
      if (constraints.length > 0) {
        logger.warn(`⚠️  Found ${constraints.length} constraints (table should not exist)`);
      }
    } catch (error: any) {
      // Expected if table doesn't exist
      logger.info('✅ No conflicting constraints found (table does not exist)');
    }

    logger.info('✅ Cleanup completed successfully');
    logger.info(
      '💡 You can now start the server and the table will be created with varchar columns',
    );

    await connection.close();
  } catch (error: any) {
    logger.error('❌ Fix failed', { error: error.message, stack: error.stack });
    if (connection) {
      await connection.close();
    }
    process.exit(1);
  }
}

fixAttendanceTable();
