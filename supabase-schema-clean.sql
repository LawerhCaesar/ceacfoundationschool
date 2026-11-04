-- =====================================================
-- CEAC Foundation School Portal - Database Schema
-- =====================================================
-- Clean version - Run this in Supabase SQL Editor
-- =====================================================

-- Drop views
DROP VIEW IF EXISTS student_progress CASCADE;
DROP VIEW IF EXISTS class_statistics CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS delete_user_completely(UUID) CASCADE;

-- Drop tables
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

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
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

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_church ON public.users(church);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile during registration" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "Admins and teachers can view all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('admin', 'teacher')));
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Create church_teachers table
CREATE TABLE public.church_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church, teacher_id)
);

CREATE INDEX idx_church_teachers_church ON public.church_teachers(church);
CREATE INDEX idx_church_teachers_teacher ON public.church_teachers(teacher_id);
CREATE INDEX idx_church_teachers_active ON public.church_teachers(is_active);

ALTER TABLE public.church_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active church teachers" ON public.church_teachers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage church teachers" ON public.church_teachers FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Create classes table
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

CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_classes_dates ON public.classes(start_date, end_date);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Teachers can view their classes" ON public.classes FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'teacher' AND id = teacher_id));

-- Create enrollments table
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

CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX idx_enrollments_teacher ON public.enrollments(assigned_teacher_id);
CREATE INDEX idx_enrollments_completed ON public.enrollments(completed);
CREATE INDEX idx_enrollments_graduated ON public.enrollments(graduated);
CREATE INDEX idx_enrollments_student_class ON public.enrollments(student_id, class_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid()::text = student_id::text);
CREATE POLICY "Students can create own enrollments with teacher selection" ON public.enrollments FOR INSERT WITH CHECK (auth.uid()::text = student_id::text AND assigned_teacher_id IS NOT NULL);
CREATE POLICY "Students can update own completion status only" ON public.enrollments FOR UPDATE USING (auth.uid()::text = student_id::text) WITH CHECK (auth.uid()::text = student_id::text AND graduated = (SELECT graduated FROM public.enrollments WHERE id = enrollments.id));
CREATE POLICY "Admins and teachers can view all enrollments" ON public.enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('admin', 'teacher')));
CREATE POLICY "Admins and teachers can enroll any user with teacher assignment" ON public.enrollments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('admin', 'teacher')) AND assigned_teacher_id IS NOT NULL);
CREATE POLICY "Only assigned teacher can mark graduation" ON public.enrollments FOR UPDATE USING (auth.uid()::text = assigned_teacher_id::text AND EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'teacher'));
CREATE POLICY "Admins can update any enrollment" ON public.enrollments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can delete enrollments" ON public.enrollments FOR DELETE USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Create exams table
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

CREATE INDEX idx_exams_class ON public.exams(class_id);
CREATE INDEX idx_exams_student ON public.exams(student_id);
CREATE INDEX idx_exams_class_student ON public.exams(class_id, student_id);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own exams" ON public.exams FOR SELECT USING (auth.uid()::text = student_id::text);
CREATE POLICY "Students can create own exams" ON public.exams FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);
CREATE POLICY "Students can update own exams" ON public.exams FOR UPDATE USING (auth.uid()::text = student_id::text);
CREATE POLICY "Admins and teachers can view all exams" ON public.exams FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('admin', 'teacher')));
CREATE POLICY "Admins and teachers can manage all exams" ON public.exams FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('admin', 'teacher')));

-- Create update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_church_teachers_updated_at BEFORE UPDATE ON public.church_teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample classes
INSERT INTO public.classes (name, description, schedule, start_date, end_date, capacity, video_file, video_title, video_description) VALUES
('Foundation Class 1: The New Creature', 'Understanding your new identity in Christ and what it means to be born again.', 'Self-paced', NOW(), NOW() + INTERVAL '365 days', 100, '/videos/Class 1.mp4', 'The New Creature in Christ', 'Discover what it means to be a new creation in Christ and how your life has been transformed through salvation.'),
('Foundation Class 2: The Holy Spirit', 'Learn about the person and work of the Holy Spirit in the life of a believer.', 'Self-paced', NOW(), NOW() + INTERVAL '365 days', 100, '/videos/Class 2.mp4', 'The Holy Spirit - Your Helper', 'Understanding who the Holy Spirit is and how He empowers and guides believers in their daily walk with God.'),
('Foundation Class 3: Doctrine', 'Understanding the fundamental doctrines of the Christian faith.', 'Self-paced', NOW(), NOW() + INTERVAL '365 days', 100, '/videos/Class 3.mp4', 'Christian Doctrine Essentials', 'Learn the essential doctrines of Christianity including the nature of God, salvation, the Church, and end times.'),
('Foundation Class 4A: Evangelism', 'Learn how to effectively share the Gospel and lead others to Christ.', 'Self-paced', NOW(), NOW() + INTERVAL '365 days', 100, '/videos/Class 4A.mp4', 'The Art of Soul Winning', 'Practical training on how to share your faith confidently and bring others to Christ.'),
('Foundation Class 4B: Prayer', 'Develop a powerful and effective prayer life.', 'Self-paced', NOW(), NOW() + INTERVAL '365 days', 100, '/videos/Class 4B.mp4', 'The Power of Prayer', 'Learn the principles and practice of effective prayer that moves the hand of God.');








