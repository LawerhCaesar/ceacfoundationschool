-- Fix Pastor Role Constraint
-- Run this in Supabase SQL Editor to enable pastor role assignment

-- Drop the existing role constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint that includes 'pastor'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('student', 'teacher', 'admin', 'pastor'));

-- Verify the constraint was updated (updated for newer PostgreSQL)
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check';
