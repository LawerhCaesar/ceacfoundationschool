-- =====================================================
-- RESET DATABASE DATA (KEEP STRUCTURE)
-- =====================================================
-- This clears all data but keeps tables and policies
-- Run this in Supabase SQL Editor

-- Disable triggers temporarily to avoid issues
SET session_replication_role = 'replica';

-- Clear all data (order matters due to foreign keys)
TRUNCATE TABLE public.exams CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.church_teachers CASCADE;
TRUNCATE TABLE public.classes CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Re-insert sample classes
INSERT INTO public.classes (name, description, schedule, start_date, end_date, capacity, video_file, video_title, video_description) VALUES
  (
    'Foundation Class 1: The New Creature',
    'Understanding your new identity in Christ and what it means to be born again.',
    'Self-paced',
    NOW(),
    NOW() + INTERVAL '365 days',
    100,
    '/videos/Class 1.mp4',
    'The New Creature in Christ',
    'Discover what it means to be a new creation in Christ and how your life has been transformed through salvation.'
  ),
  (
    'Foundation Class 2: The Holy Spirit',
    'Learn about the person and work of the Holy Spirit in the life of a believer.',
    'Self-paced',
    NOW(),
    NOW() + INTERVAL '365 days',
    100,
    '/videos/Class 2.mp4',
    'The Holy Spirit - Your Helper',
    'Understanding who the Holy Spirit is and how He empowers and guides believers in their daily walk with God.'
  ),
  (
    'Foundation Class 3: Doctrine',
    'Understanding the fundamental doctrines of the Christian faith.',
    'Self-paced',
    NOW(),
    NOW() + INTERVAL '365 days',
    100,
    '/videos/Class 3.mp4',
    'Christian Doctrine Essentials',
    'Learn the essential doctrines of Christianity including the nature of God, salvation, the Church, and end times.'
  ),
  (
    'Foundation Class 4A: Evangelism',
    'Learn how to effectively share the Gospel and lead others to Christ.',
    'Self-paced',
    NOW(),
    NOW() + INTERVAL '365 days',
    100,
    '/videos/Class 4A.mp4',
    'The Art of Soul Winning',
    'Practical training on how to share your faith confidently and bring others to Christ.'
  ),
  (
    'Foundation Class 4B: Prayer',
    'Develop a powerful and effective prayer life.',
    'Self-paced',
    NOW(),
    NOW() + INTERVAL '365 days',
    100,
    '/videos/Class 4B.mp4',
    'The Power of Prayer',
    'Learn the principles and practice of effective prayer that moves the hand of God.'
  );

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '✅ Database data reset successfully!';
  RAISE NOTICE '📋 All user data cleared';
  RAISE NOTICE '📚 Sample classes re-inserted';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANT: You must also delete users from Supabase Auth!';
  RAISE NOTICE '   Go to Authentication > Users and delete all users';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Now you can create fresh users!';
END $$;












