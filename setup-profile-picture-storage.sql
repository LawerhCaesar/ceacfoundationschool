-- =====================================================
-- Supabase Storage Setup for Profile Pictures
-- =====================================================
-- Purpose: Create storage bucket for user profile pictures
-- Date: 2025-10-23
-- =====================================================

-- Step 1: Create the storage bucket
-- Note: This needs to be done in Supabase Dashboard or via SQL
-- Go to: Storage → Create new bucket

-- Bucket configuration:
-- Name: avatars
-- Public: Yes (so profile pictures can be displayed publicly)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Step 2: Set up storage policies for the bucket
-- These policies control who can upload, read, and delete files

-- Policy 1: Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[2]::text
);

-- Policy 2: Allow public read access to all profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 3: Allow authenticated users to update their own profile pictures
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[2]::text
);

-- Policy 4: Allow authenticated users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[2]::text
);

-- Verification queries
-- Check if bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'avatars';

-- Check RLS policies on storage.objects table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Success message
SELECT '✅ Storage setup complete!' AS status,
       '🎯 Users can now upload profile pictures directly' AS message,
       'Run the verification queries above to confirm' AS next_step;

-- =====================================================
-- MANUAL SETUP INSTRUCTIONS (if SQL doesn't work)
-- =====================================================
-- 
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create new bucket"
-- 3. Enter name: "avatars"
-- 4. Set as PUBLIC bucket
-- 5. Click "Create bucket"
-- 
-- 6. Click on the "avatars" bucket → Policies
-- 7. Create the following policies manually:
--    
--    Policy: "Users can upload"
--    - Operation: INSERT
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'avatars'
--
--    Policy: "Public can view"
--    - Operation: SELECT
--    - Target roles: public
--    - Policy definition:
--      bucket_id = 'avatars'
--
--    Policy: "Users can update"
--    - Operation: UPDATE
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'avatars'
--
--    Policy: "Users can delete"
--    - Operation: DELETE
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'avatars'
--
-- =====================================================

