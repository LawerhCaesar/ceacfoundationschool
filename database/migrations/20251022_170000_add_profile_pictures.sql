-- =====================================================
-- Migration: Add Profile Pictures
-- Version: 20251022_170000
-- Description: Adds profile picture URL field for all users
-- Author: System
-- Date: 2025-10-22
-- =====================================================

-- Check if migration already applied
DO $$
BEGIN
  IF is_migration_applied('20251022_170000') THEN
    RAISE NOTICE '⚠️  Migration 20251022_170000 already applied. Skipping...';
    RETURN;
  END IF;
END $$;

-- UP Migration
BEGIN;

-- Add profile_picture_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_profile_picture 
ON users(profile_picture_url) WHERE profile_picture_url IS NOT NULL;

-- Record migration
INSERT INTO schema_migrations (version, description, applied_by, status)
VALUES ('20251022_170000', 'Add profile picture support to users table', 'system', 'success');

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile picture field added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 New field:';
  RAISE NOTICE '  • profile_picture_url - URL to user profile picture';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Usage:';
  RAISE NOTICE '  UPDATE users SET profile_picture_url = ''https://...'' WHERE id = ''user-id'';';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '  • Store in Supabase Storage or external CDN';
  RAISE NOTICE '  • Use public bucket for profile pictures';
  RAISE NOTICE '  • Validate file types (jpg, png, webp)';
  RAISE NOTICE '  • Limit file size (2MB recommended)';
END $$;

-- =====================================================
-- DOWN Migration (for rollback)
-- =====================================================
-- BEGIN;
-- DROP INDEX IF EXISTS idx_users_profile_picture;
-- ALTER TABLE users DROP COLUMN IF EXISTS profile_picture_url;
-- DELETE FROM schema_migrations WHERE version = '20251022_170000';
-- COMMIT;




































