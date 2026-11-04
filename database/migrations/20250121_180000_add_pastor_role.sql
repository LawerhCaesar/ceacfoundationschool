-- =====================================================
-- Add Pastor Role to Database
-- =====================================================
-- This migration adds the 'pastor' role to the users table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update the role constraint to include 'pastor'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('student', 'teacher', 'admin', 'pastor'));

-- Verify the constraint was updated
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'users_role_check';






























