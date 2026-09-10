-- SQL script to drop attendance enum types and table
-- Run this script in your PostgreSQL database to clean up before TypeORM sync

-- Drop the attendances table if it exists (this will also drop any dependencies)
DROP TABLE IF EXISTS attendances CASCADE;

-- Drop the enum types if they exist
DROP TYPE IF EXISTS attendances_status_enum CASCADE;
DROP TYPE IF EXISTS attendances_verification_method_enum CASCADE;

-- Verify they're dropped
SELECT typname FROM pg_type WHERE typname IN ('attendances_status_enum', 'attendances_verification_method_enum');

