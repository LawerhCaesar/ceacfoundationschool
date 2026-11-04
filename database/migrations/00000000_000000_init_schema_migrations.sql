-- =====================================================
-- Migration: Initialize Schema Migrations Table
-- Version: 00000000_000000
-- Description: Creates the schema_migrations table for tracking applied migrations
-- Author: System
-- Date: 2025-10-21
-- =====================================================

-- UP Migration
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied_by VARCHAR(255) DEFAULT 'system',
  checksum VARCHAR(64),
  execution_time_ms INTEGER,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT
);

-- Create index for faster version lookups
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at DESC);

-- Insert this migration's record
INSERT INTO schema_migrations (version, description, applied_by, status)
VALUES ('00000000_000000', 'Initialize schema migrations table', 'system', 'success')
ON CONFLICT (version) DO NOTHING;

-- Create function to get current schema version
CREATE OR REPLACE FUNCTION get_current_schema_version()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN (
    SELECT version 
    FROM schema_migrations 
    WHERE status = 'success'
    ORDER BY applied_at DESC 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to check if migration has been applied
CREATE OR REPLACE FUNCTION is_migration_applied(migration_version VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM schema_migrations 
    WHERE version = migration_version 
    AND status = 'success'
  );
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Schema migrations table initialized successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Usage:';
  RAISE NOTICE '  • Check current version: SELECT get_current_schema_version();';
  RAISE NOTICE '  • List all migrations: SELECT * FROM schema_migrations ORDER BY applied_at;';
  RAISE NOTICE '  • Check specific migration: SELECT is_migration_applied(''version'');';
END $$;

-- =====================================================
-- DOWN Migration (for rollback)
-- =====================================================
-- DROP FUNCTION IF EXISTS is_migration_applied(VARCHAR);
-- DROP FUNCTION IF EXISTS get_current_schema_version();
-- DROP TABLE IF EXISTS schema_migrations;



