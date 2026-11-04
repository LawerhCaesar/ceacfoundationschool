-- =====================================================
-- Migration: Add User Preferences Table
-- Version: 20251021_143000
-- Description: Adds a table for storing user-specific preferences (theme, notifications, etc.)
-- Author: System
-- Date: 2025-10-21
-- =====================================================

-- Check if migration already applied
DO $$
BEGIN
  IF is_migration_applied('20251021_143000') THEN
    RAISE NOTICE '⚠️  Migration 20251021_143000 already applied. Skipping...';
    RETURN;
  END IF;
END $$;

-- UP Migration
BEGIN;

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- UI Preferences
  theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  sidebar_collapsed BOOLEAN DEFAULT false,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  class_reminders BOOLEAN DEFAULT true,
  graduation_alerts BOOLEAN DEFAULT true,
  
  -- Display Preferences
  items_per_page INTEGER DEFAULT 10 CHECK (items_per_page >= 5 AND items_per_page <= 100),
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  
  -- Video Preferences
  default_video_quality VARCHAR(10) DEFAULT 'auto',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own preferences
CREATE POLICY user_preferences_select_own 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert_own 
  ON user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update_own 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY user_preferences_delete_own 
  ON user_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY user_preferences_admin_all 
  ON user_preferences FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Record migration
INSERT INTO schema_migrations (version, description, applied_by, status)
VALUES ('20251021_143000', 'Add user preferences table', 'system', 'success');

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User preferences table created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Table structure:';
  RAISE NOTICE '  • theme (light/dark/system)';
  RAISE NOTICE '  • notification preferences';
  RAISE NOTICE '  • display preferences';
  RAISE NOTICE '  • video preferences';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS policies enabled for data security';
END $$;

-- =====================================================
-- DOWN Migration (for rollback)
-- =====================================================
-- BEGIN;
-- DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;
-- DROP FUNCTION IF EXISTS update_user_preferences_updated_at();
-- DROP TABLE IF EXISTS user_preferences;
-- DELETE FROM schema_migrations WHERE version = '20251021_143000';
-- COMMIT;



