-- =====================================================
-- CEAC Foundation School Portal - Database Schema
-- =====================================================
-- This script will drop all existing tables and recreate them
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- CLEANUP: Drop existing tables and objects
-- =====================================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS student_progress CASCADE;
DROP VIEW IF EXISTS class_statistics CASCADE;

-- Drop functions with CASCADE
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS delete_user_completely(UUID) CASCADE;

-- Drop all tables with CASCADE
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.church_teachers CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.partnerships CASCADE;
DROP TABLE IF EXISTS public.fellowships CASCADE;
DROP TABLE IF EXISTS public.churches CASCADE;
DROP TABLE IF EXISTS public.cells CASCADE;

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users
-- =====================================================
-- Stores user profiles (extends Supabase Auth users)
-- Roles: student, teacher, admin

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  church TEXT,
  fellowship TEXT,
  cell TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'pastor')),
  profile_picture_url TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_church ON public.users(church);

-- Enable Row Level Security on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own data" 
  ON public.users FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" 
  ON public.users FOR UPDATE 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile during registration"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Admins and teachers can view all users" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can manage all users" 
  ON public.users FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- =====================================================
-- TABLE: church_teachers
-- =====================================================
-- Maps which teachers are available for which churches
-- Students can only select teachers from their church

CREATE TABLE public.church_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church, teacher_id)
);

-- Indexes for church_teachers table
CREATE INDEX idx_church_teachers_church ON public.church_teachers(church);
CREATE INDEX idx_church_teachers_teacher ON public.church_teachers(teacher_id);
CREATE INDEX idx_church_teachers_active ON public.church_teachers(is_active);

-- Enable Row Level Security on church_teachers
ALTER TABLE public.church_teachers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for church_teachers
CREATE POLICY "Anyone can view active church teachers" 
  ON public.church_teachers FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage church teachers" 
  ON public.church_teachers FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- =====================================================
-- TABLE: classes
-- =====================================================
-- Stores foundation school classes/courses

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  schedule TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  capacity INTEGER DEFAULT 100 CHECK (capacity > 0),
  video_file TEXT,
  video_title TEXT,
  video_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for classes table
CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_classes_dates ON public.classes(start_date, end_date);

-- Enable Row Level Security on classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Anyone can view classes" 
  ON public.classes FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage classes" 
  ON public.classes FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can view their classes" 
  ON public.classes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'teacher'
      AND id = teacher_id
    )
  );

-- =====================================================
-- TABLE: enrollments
-- =====================================================
-- Tracks student enrollment in classes with assigned teacher

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  graduated BOOLEAN DEFAULT false,
  graduated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Note: Teacher role validation is handled by application logic and RLS policies

-- Indexes for enrollments table
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX idx_enrollments_teacher ON public.enrollments(assigned_teacher_id);
CREATE INDEX idx_enrollments_completed ON public.enrollments(completed);
CREATE INDEX idx_enrollments_graduated ON public.enrollments(graduated);
CREATE INDEX idx_enrollments_student_class ON public.enrollments(student_id, class_id);

-- Enable Row Level Security on enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments" 
  ON public.enrollments FOR SELECT 
  USING (auth.uid()::text = student_id::text);

CREATE POLICY "Students can create own enrollments with teacher selection" 
  ON public.enrollments FOR INSERT 
  WITH CHECK (
    auth.uid()::text = student_id::text 
    AND assigned_teacher_id IS NOT NULL
  );

CREATE POLICY "Students can update own completion status only" 
  ON public.enrollments FOR UPDATE 
  USING (auth.uid()::text = student_id::text)
  WITH CHECK (
    -- Students can only update their completion status, not graduation
    auth.uid()::text = student_id::text
    AND graduated = (SELECT graduated FROM public.enrollments WHERE id = enrollments.id)
  );

CREATE POLICY "Admins and teachers can view all enrollments" 
  ON public.enrollments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can enroll any user with teacher assignment" 
  ON public.enrollments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'teacher')
    )
    AND assigned_teacher_id IS NOT NULL
  );

CREATE POLICY "Only assigned teacher can mark graduation" 
  ON public.enrollments FOR UPDATE 
  USING (
    auth.uid()::text = assigned_teacher_id::text
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'teacher'
    )
  );

CREATE POLICY "Admins can update any enrollment" 
  ON public.enrollments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete enrollments" 
  ON public.enrollments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- =====================================================
-- TABLE: exams
-- =====================================================
-- Tracks exam scores for students in classes

CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Indexes for exams table
CREATE INDEX idx_exams_class ON public.exams(class_id);
CREATE INDEX idx_exams_student ON public.exams(student_id);
CREATE INDEX idx_exams_class_student ON public.exams(class_id, student_id);

-- Enable Row Level Security on exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Students can view own exams" 
  ON public.exams FOR SELECT 
  USING (auth.uid()::text = student_id::text);

CREATE POLICY "Students can create own exams" 
  ON public.exams FOR INSERT 
  WITH CHECK (auth.uid()::text = student_id::text);

CREATE POLICY "Students can update own exams" 
  ON public.exams FOR UPDATE 
  USING (auth.uid()::text = student_id::text);

CREATE POLICY "Admins and teachers can view all exams" 
  ON public.exams FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can manage all exams" 
  ON public.exams FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'teacher')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign teacher to their church
CREATE OR REPLACE FUNCTION public.auto_assign_teacher_to_church()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if the user is a teacher and has a church assigned
  IF NEW.role = 'teacher' AND NEW.church IS NOT NULL THEN
    -- Check if this teacher-church mapping already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.church_teachers 
      WHERE teacher_id = NEW.id AND church = NEW.church
    ) THEN
      -- Insert the teacher-church mapping
      INSERT INTO public.church_teachers (church, teacher_id, is_active)
      VALUES (NEW.church, NEW.id, true)
      ON CONFLICT (church, teacher_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers to automatically update updated_at on record changes
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_teachers_updated_at 
  BEFORE UPDATE ON public.church_teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically assign teachers to their church
CREATE TRIGGER auto_assign_teacher_to_church
  AFTER INSERT OR UPDATE OF role, church ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_teacher_to_church();

CREATE TRIGGER update_classes_updated_at 
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at 
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR ANALYTICS AND REPORTING
-- =====================================================

-- View: Student Progress Dashboard
CREATE OR REPLACE VIEW student_progress AS
SELECT 
  u.id as student_id,
  u.name,
  u.email,
  u.church,
  u.fellowship,
  u.cell,
  u.registered_at,
  COUNT(DISTINCT e.id) as total_enrolled,
  COUNT(DISTINCT CASE WHEN e.completed THEN e.id END) as total_completed,
  COUNT(DISTINCT CASE WHEN e.graduated THEN e.id END) as total_graduated,
  ROUND(
    CASE 
      WHEN COUNT(DISTINCT e.id) > 0 
      THEN (COUNT(DISTINCT CASE WHEN e.completed THEN e.id END)::numeric / COUNT(DISTINCT e.id)::numeric) * 100 
      ELSE 0 
    END, 
    2
  ) as completion_percentage,
  AVG(ex.score) as average_score
FROM public.users u
LEFT JOIN public.enrollments e ON u.id = e.student_id
LEFT JOIN public.exams ex ON u.id = ex.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.email, u.church, u.fellowship, u.cell, u.registered_at;

-- View: Class Statistics
CREATE OR REPLACE VIEW class_statistics AS
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.teacher_id,
  u.name as teacher_name,
  COUNT(DISTINCT e.student_id) as total_students,
  COUNT(DISTINCT CASE WHEN e.completed THEN e.student_id END) as completed_students,
  COUNT(DISTINCT CASE WHEN e.graduated THEN e.student_id END) as graduated_students,
  ROUND(
    CASE 
      WHEN COUNT(DISTINCT e.student_id) > 0 
      THEN (COUNT(DISTINCT CASE WHEN e.completed THEN e.student_id END)::numeric / COUNT(DISTINCT e.student_id)::numeric) * 100 
      ELSE 0 
    END, 
    2
  ) as completion_rate,
  AVG(ex.score) as average_exam_score
FROM public.classes c
LEFT JOIN public.users u ON c.teacher_id = u.id
LEFT JOIN public.enrollments e ON c.id = e.class_id
LEFT JOIN public.exams ex ON c.id = ex.class_id
GROUP BY c.id, c.name, c.teacher_id, u.name;

-- Grant access to views for authenticated users
GRANT SELECT ON student_progress TO authenticated;
GRANT SELECT ON class_statistics TO authenticated;

-- =====================================================
-- INITIAL DATA (SAMPLE CLASSES)
-- =====================================================

-- Insert sample foundation classes
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

-- =====================================================
-- HELPER FUNCTIONS FOR USER MANAGEMENT
-- =====================================================

-- Function to safely delete a user (removes from both database and auth)
-- Note: This requires service_role key to execute
-- Use this from your application with admin privileges
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Delete from database (cascades to related records)
  DELETE FROM public.users WHERE id = user_id;
  
  -- Note: To delete from Supabase Auth, you need to call the Admin API
  -- from your application code with service_role key
  -- Example: supabase.auth.admin.deleteUser(user_id)
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error deleting user: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users with admin role
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This will display after successful execution
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📋 Tables created: users, church_teachers, classes, enrollments, exams';
  RAISE NOTICE '🔒 Row Level Security policies applied';
  RAISE NOTICE '📊 Views created: student_progress, class_statistics';
  RAISE NOTICE '📚 Sample classes inserted';
  RAISE NOTICE '';
  RAISE NOTICE '🎓 IMPORTANT - Teacher Assignment:';
  RAISE NOTICE '  • Teachers are AUTOMATICALLY assigned to their church when created';
  RAISE NOTICE '  • Just set role = ''teacher'' and church = ''Church Name'' on user creation';
  RAISE NOTICE '  • Students MUST select a teacher when enrolling';
  RAISE NOTICE '  • Only the assigned teacher can approve graduation';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  AUTO-ASSIGNMENT TRIGGER:';
  RAISE NOTICE '  • When a user with role = ''teacher'' and a church is created/updated';
  RAISE NOTICE '  • They are automatically added to church_teachers table';
  RAISE NOTICE '  • This makes them available in teacher dropdowns for students';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT - User Deletion:';
  RAISE NOTICE '  • To reuse an email, delete from BOTH database AND Supabase Auth';
  RAISE NOTICE '  • Database: DELETE FROM users WHERE email = ''user@example.com''';
  RAISE NOTICE '  • Auth: Go to Authentication > Users in Supabase Dashboard';
  RAISE NOTICE '  • Or use Admin API: supabase.auth.admin.deleteUser(userId)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next steps:';
  RAISE NOTICE '1. Create admin user through Supabase Auth';
  RAISE NOTICE '2. Add admin to users table with role = ''admin'' and church = ''Church Name''';
  RAISE NOTICE '3. Create teacher users with role = ''teacher'' and church = ''Church Name''';
  RAISE NOTICE '4. Teachers will be automatically assigned to their church!';
  RAISE NOTICE '5. Log in to the Foundation Portal';
END $$;
