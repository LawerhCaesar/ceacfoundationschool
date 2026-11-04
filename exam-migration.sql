-- =====================================================
-- EXAM SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- Adds Section A/B scoring and status tracking to the exams table
-- =====================================================

-- Add new columns to exams table
ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS section_a_answers JSONB,
  ADD COLUMN IF NOT EXISTS section_a_score DECIMAL(5,2) DEFAULT 0 CHECK (section_a_score >= 0 AND section_a_score <= 50),
  ADD COLUMN IF NOT EXISTS section_b_answers JSONB,
  ADD COLUMN IF NOT EXISTS section_b_score DECIMAL(5,2) DEFAULT NULL CHECK (section_b_score >= 0 AND section_b_score <= 30),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'section_a_complete', 'section_b_submitted', 'fully_graded')),
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- The existing `score` column will now represent the TOTAL (section_a_score + section_b_score)
-- Max score is 80 — update the constraint
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_score_check;
ALTER TABLE public.exams ADD CONSTRAINT exams_score_check CHECK (score >= 0 AND score <= 80);

-- Add RLS update policy for students to submit their own exam answers
-- (IF NOT EXISTS is not supported by PostgreSQL for CREATE POLICY,
--  so we use a conditional DO block instead)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'exams'
      AND policyname = 'Students can submit section A answers'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Students can submit section A answers"
        ON public.exams FOR UPDATE
        USING (auth.uid()::text = student_id::text)
        WITH CHECK (auth.uid()::text = student_id::text)
    $policy$;
  END IF;
END $$;

-- =====================================================
-- APP SETTINGS TABLE (for admin-controlled toggles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for students to check exam lock)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'app_settings'
      AND policyname = 'Anyone can read app_settings'
  ) THEN
    EXECUTE $p$ CREATE POLICY "Anyone can read app_settings"
      ON public.app_settings FOR SELECT USING (true) $p$;
  END IF;
END $$;

-- Only admins can write settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'app_settings'
      AND policyname = 'Admins can manage app_settings'
  ) THEN
    EXECUTE $p$ CREATE POLICY "Admins can manage app_settings"
      ON public.app_settings FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
      ) $p$;
  END IF;
END $$;

-- Seed: exam is LOCKED by default
INSERT INTO public.app_settings (key, value)
  VALUES ('exam_locked', 'true')
  ON CONFLICT (key) DO NOTHING;

-- Done
DO $$
BEGIN
  RAISE NOTICE '✅ Exam migration applied successfully!';
  RAISE NOTICE '   - section_a_answers (JSONB) — student MCQ selections';
  RAISE NOTICE '   - section_a_score (DECIMAL 0-50) — auto-calculated';
  RAISE NOTICE '   - section_b_answers (JSONB) — student text answers';
  RAISE NOTICE '   - section_b_score (DECIMAL 0-30) — teacher-assigned';
  RAISE NOTICE '   - status (TEXT) — not_started | section_a_complete | section_b_submitted | fully_graded';
  RAISE NOTICE '   - started_at (TIMESTAMPTZ) — when exam was started';
  RAISE NOTICE '   Existing score column now holds total (max 80)';
END $$;
