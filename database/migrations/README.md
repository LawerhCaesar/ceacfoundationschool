# Database Migration System

This directory contains SQL migration files for the CEAC Foundation School Portal database.

## Migration Naming Convention

Migrations follow the format: `YYYYMMDD_HHMMSS_description.sql`

Example: `20251021_143000_add_user_preferences_table.sql`

## How to Apply Migrations

### Manual Application (Recommended for Supabase)

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Open the migration file you want to apply
4. Copy the contents
5. Execute in the SQL Editor
6. Record the migration in the `schema_migrations` table

### Automatic Tracking

The system tracks applied migrations in the `schema_migrations` table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied_by VARCHAR(255),
  checksum VARCHAR(64),
  execution_time_ms INTEGER
);
```

## Migration Structure

Each migration file should contain:

1. **Header Comment**: Description and metadata
2. **Up Migration**: Changes to apply
3. **Down Migration**: Changes to rollback (commented)

Example:

```sql
-- =====================================================
-- Migration: Add User Preferences Table
-- Version: 20251021_143000
-- Description: Adds a table for storing user preferences
-- Author: System
-- Date: 2025-10-21
-- =====================================================

-- UP Migration
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Record migration
INSERT INTO schema_migrations (version, description, applied_by)
VALUES ('20251021_143000', 'Add user preferences table', 'system')
ON CONFLICT (version) DO NOTHING;

-- =====================================================
-- DOWN Migration (for rollback)
-- =====================================================
-- DROP TABLE IF EXISTS user_preferences;
-- DELETE FROM schema_migrations WHERE version = '20251021_143000';
```

## Migration History

Check applied migrations:

```sql
SELECT * FROM schema_migrations ORDER BY applied_at DESC;
```

## Rollback Procedure

To rollback a migration:

1. Find the DOWN migration section in the file
2. Uncomment the rollback SQL
3. Execute in SQL Editor
4. Remove the migration record from `schema_migrations`

## Best Practices

1. **Always test migrations in development first**
2. **Keep migrations small and focused** - One logical change per migration
3. **Make migrations reversible** - Always include DOWN migration
4. **Never modify applied migrations** - Create a new migration instead
5. **Include indexes and constraints** - Don't forget performance optimizations
6. **Use transactions** - Wrap migrations in BEGIN/COMMIT when possible
7. **Document breaking changes** - Add warnings for data-destructive operations

## Migration Checklist

Before applying a migration:

- [ ] Tested in development environment
- [ ] DOWN migration tested for rollback
- [ ] Backup created (if production)
- [ ] Team notified of schema changes
- [ ] Application code updated to match schema
- [ ] RLS policies updated if needed
- [ ] Indexes added for new columns
- [ ] Documentation updated

## Common Migration Templates

### Add Column

```sql
ALTER TABLE table_name ADD COLUMN column_name data_type DEFAULT value;
-- Rollback: ALTER TABLE table_name DROP COLUMN column_name;
```

### Modify Column

```sql
ALTER TABLE table_name ALTER COLUMN column_name TYPE new_data_type;
-- Rollback: ALTER TABLE table_name ALTER COLUMN column_name TYPE old_data_type;
```

### Add Index

```sql
CREATE INDEX idx_name ON table_name(column_name);
-- Rollback: DROP INDEX idx_name;
```

### Add RLS Policy

```sql
CREATE POLICY policy_name ON table_name FOR SELECT USING (condition);
-- Rollback: DROP POLICY policy_name ON table_name;
```

## Version Control

All migration files should be committed to version control:

```bash
git add database/migrations/
git commit -m "Add migration: description"
```

## Troubleshooting

### Migration Failed to Apply

1. Check error message in Supabase logs
2. Verify syntax is correct
3. Ensure dependencies exist (referenced tables, etc.)
4. Check for conflicts with existing schema

### Rollback Failed

1. Check if DOWN migration is correct
2. Verify no data constraints preventing rollback
3. Manually clean up if needed
4. Document any manual steps taken

## Migration Tools

For future enhancement, consider:

- Automated migration runner
- Schema diff generator
- Migration status dashboard
- Automated testing for migrations



