-- Additive repair for the deployed portal; safe to rerun.
-- Existing profiles, enrollment assignments and exam records are preserved.
BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS primary_teacher_id UUID
  REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_primary_teacher_id
  ON public.users(primary_teacher_id);

COMMENT ON COLUMN public.users.primary_teacher_id IS
  'Optional default teacher. Existing enrollment teacher assignments are unchanged.';

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only the exam-lock setting is exposed. Admin writes still require RLS.
REVOKE ALL ON public.app_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
    AND tablename = 'app_settings' AND policyname = 'portal_exam_lock_read') THEN
    CREATE POLICY portal_exam_lock_read ON public.app_settings
      FOR SELECT TO authenticated USING (key = 'exam_locked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
    AND tablename = 'app_settings' AND policyname = 'portal_exam_lock_insert') THEN
    CREATE POLICY portal_exam_lock_insert ON public.app_settings
      FOR INSERT TO authenticated
      WITH CHECK (key = 'exam_locked' AND value IN ('true', 'false') AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
    AND tablename = 'app_settings' AND policyname = 'portal_exam_lock_update') THEN
    CREATE POLICY portal_exam_lock_update ON public.app_settings
      FOR UPDATE TO authenticated
      USING (key = 'exam_locked' AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
      ))
      WITH CHECK (key = 'exam_locked' AND value IN ('true', 'false') AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
      ));
  END IF;
END;
$$;

-- Preserve an existing admin choice; new installations start locked.
INSERT INTO public.app_settings (key, value)
VALUES ('exam_locked', 'true')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
COMMIT;
