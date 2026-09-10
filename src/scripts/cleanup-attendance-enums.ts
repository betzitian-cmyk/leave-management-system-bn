// src/scripts/cleanup-attendance-enums.ts
// Script to clean up existing attendance enum types from database

import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

async function cleanupAttendanceEnums() {
  try {
    logger.info('🔄 Connecting to database...');

    const connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false, // Don't sync, we just need the connection
    });

    logger.info('✅ Connected to database');

    // Drop ALL enum types that might conflict (comprehensive cleanup)
    try {
      logger.info('🗑️  Dropping all attendance-related enum types...');

      // Get all enum types that might be related
      const enumTypesResult = await connection.query(`
        SELECT typname 
        FROM pg_type 
        WHERE typtype = 'e' 
        AND (typname LIKE '%attendance%' OR typname LIKE '%status%' OR typname LIKE '%verification%')
      `);

      logger.info(`Found ${enumTypesResult.length} potential enum types to clean up`);

      for (const row of enumTypesResult) {
        const enumType = row.typname;
        try {
          logger.info(`🗑️  Dropping enum type: ${enumType}`);
          await connection.query(`DROP TYPE IF EXISTS ${enumType} CASCADE`);
          logger.info(`✅ Dropped enum type: ${enumType}`);
        } catch (error: any) {
          logger.warn(`⚠️  Could not drop enum ${enumType}: ${error.message}`);
        }
      }
    } catch (error: any) {
      logger.warn(`⚠️  Error checking for enum types: ${error.message}`);
    }

    // Also try to drop specific enum types by name
    const enumTypes = ['attendances_status_enum', 'attendances_verification_method_enum'];

    for (const enumType of enumTypes) {
      try {
        await connection.query(`DROP TYPE IF EXISTS ${enumType} CASCADE`);
        logger.info(`✅ Dropped enum type: ${enumType}`);
      } catch (error: any) {
        logger.warn(`⚠️  Could not drop enum ${enumType}: ${error.message}`);
      }
    }

    // Drop the attendances table if it exists
    try {
      await connection.query('DROP TABLE IF EXISTS attendances CASCADE');
      logger.info('✅ Dropped attendances table if it existed');
    } catch (error: any) {
      logger.warn(`⚠️  Could not drop attendances table: ${error.message}`);
    }

    await connection.close();
    logger.info('✅ Cleanup completed successfully');
    logger.info('💡 You can now start the server and the tables will be created fresh');
  } catch (error: any) {
    logger.error('❌ Cleanup failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

cleanupAttendanceEnums();
