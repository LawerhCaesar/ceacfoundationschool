-- Test Pastor Role Assignment
-- Run this in Supabase SQL Editor to test if pastor role works

-- First, check current constraint (updated for newer PostgreSQL)
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check';

-- Alternative way to check constraint
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'users' 
    AND tc.constraint_type = 'CHECK'
    AND tc.constraint_name = 'users_role_check';

-- Try to update a user to pastor role (replace 'USER_ID_HERE' with actual user ID)
-- UPDATE users SET role = 'pastor' WHERE id = 'USER_ID_HERE';

-- Check if the update worked
-- SELECT id, name, role FROM users WHERE role = 'pastor';
