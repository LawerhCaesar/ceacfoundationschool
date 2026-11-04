-- =====================================================
-- Migration: Add Fellowship/Cell Field to Users
-- Version: 20251021_150000
-- Description: Adds fellowship/cell field to users table for better student organization
-- Author: System
-- Date: 2025-10-21
-- =====================================================

-- Check if migration already applied
DO $$
BEGIN
  IF is_migration_applied('20251021_150000') THEN
    RAISE NOTICE '⚠️  Migration 20251021_150000 already applied. Skipping...';
    RETURN;
  END IF;
END $$;

-- UP Migration
BEGIN;

-- Add fellowship column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fellowship VARCHAR(100);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_fellowship ON users(fellowship);

-- Add comment to column
COMMENT ON COLUMN users.fellowship IS 'Fellowship, cell group, or small group assignment for the user';

-- Record migration
INSERT INTO schema_migrations (version, description, applied_by, status)
VALUES ('20251021_150000', 'Add fellowship/cell field to users table', 'system', 'success');

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fellowship field added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Changes made:';
  RAISE NOTICE '  • Added fellowship column to users table';
  RAISE NOTICE '  • Created index for faster filtering';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Usage:';
  RAISE NOTICE '  UPDATE users SET fellowship = ''Youth Fellowship'' WHERE id = ''user-id'';';
  RAISE NOTICE '  SELECT * FROM users WHERE fellowship = ''Adult Cell'';';
END $$;

-- =====================================================
-- DOWN Migration (for rollback)
-- =====================================================
-- BEGIN;
-- DROP INDEX IF EXISTS idx_users_fellowship;
-- ALTER TABLE users DROP COLUMN IF EXISTS fellowship;
-- DELETE FROM schema_migrations WHERE version = '20251021_150000';
-- COMMIT;



