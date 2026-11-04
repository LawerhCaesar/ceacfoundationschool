-- =====================================================
-- Debug Registration Issue
-- =====================================================

-- Step 1: Check current policies
SELECT policyname, cmd, roles, with_check, qual
FROM pg_policies 
WHERE tablename = 'users';

-- Step 2: Temporarily DISABLE RLS to test
-- WARNING: This removes security temporarily for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Try registering now in your app
-- If it works, the issue is definitely the RLS policy

-- Step 4: After testing, RE-ENABLE RLS
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Check if any users were created
SELECT id, email, name, role, created_at 
FROM public.users 
ORDER BY created_at DESC;











































