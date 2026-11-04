-- Check current database constraint for user roles
-- Run this in Supabase SQL Editor to see the current constraint

SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check';

-- Also check the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'role';






























