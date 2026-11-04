-- =====================================================
-- Test Registration Flow
-- =====================================================
-- Run these queries to diagnose the registration issue

-- Step 1: Check if INSERT policy exists
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname LIKE '%insert%';

-- Step 2: Check current policies on users table
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Step 3: Test if you can insert as an authenticated user
-- Replace 'test-uuid' with an actual UUID from a test auth user
-- This simulates what happens during registration
/*
SET LOCAL ROLE authenticated;
SET request.jwt.claims.sub = 'test-uuid-from-auth';

INSERT INTO public.users (id, email, name, role)
VALUES (
  'test-uuid-from-auth',
  'test@example.com',
  'Test User',
  'student'
);

RESET ROLE;
*/

-- Step 4: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Step 5: List all users (to see if any were created)
SELECT id, email, name, role, registered_at 
FROM public.users 
ORDER BY registered_at DESC;











































