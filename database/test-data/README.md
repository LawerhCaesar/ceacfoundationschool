# Test Data Scripts

This directory contains SQL scripts for adding test data to the database.

## Available Scripts

### `add-test-students-with-fellowships.sql`

Creates test students for fellowship/cell group testing.

**What it does:**
- Automatically detects all churches in your database
- Adds 6 students per church
- Creates 2 fellowships per church:
  - `[Church Name] - Youth Fellowship` (3 students)
  - `[Church Name] - Adult Cell Group` (3 students)

**Usage:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the script
3. Run it
4. View the results in the output

**Test student format:**
- Email: `student1.[churchname]@test.com`
- Name: `Test Student 1 ([Church Name])`
- Fellowship: Auto-assigned based on student number

**Verification queries included:**
- Summary by church and fellowship
- Detailed list of all test students

**Cleanup:**
```sql
-- Remove all test students
DELETE FROM users WHERE email LIKE '%@test.com' AND role = 'student';
```

## Notes

- Test students use `@test.com` email domain for easy identification
- Script uses `ON CONFLICT` to update existing test students
- Safe to run multiple times
- Fellowship names follow pattern: `[Church Name] - [Fellowship Type]`



