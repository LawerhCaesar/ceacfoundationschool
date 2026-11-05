-- Read-only checks after applying 20261105072325_restore_portal_schema_gaps.sql.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
  AND column_name = 'primary_teacher_id';

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname = 'users_primary_teacher_id_fkey';

SELECT key, value FROM public.app_settings WHERE key = 'exam_locked';

SELECT relrowsecurity AS settings_rls_enabled
FROM pg_class WHERE oid = 'public.app_settings'::regclass;

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'app_settings'
ORDER BY policyname;
