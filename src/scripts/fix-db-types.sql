-- Run this SQL script directly in your PostgreSQL database to fix the type conflict
-- Connect to your database and run: psql -d your_database_name -f src/scripts/fix-db-types.sql

-- Drop the attendances table if it exists
DROP TABLE IF EXISTS attendances CASCADE;

-- Drop any attendance-related enum types
DROP TYPE IF EXISTS attendances_status_enum CASCADE;
DROP TYPE IF EXISTS attendances_verification_method_enum CASCADE;

-- Verify cleanup
SELECT typname FROM pg_type WHERE typname LIKE '%attendance%';

-- The table will be recreated by TypeORM with varchar columns

