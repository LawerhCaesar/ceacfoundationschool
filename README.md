# CEAC Foundation School Portal

A church foundation school learning portal built with React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui and Supabase.

## Local development

```bash
git clone https://github.com/LawerhCaesar/ceacfoundationschool.git
cd ceacfoundationschool
npm ci
cp .env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
npm run dev
```

The development server runs on port 8080. Use a current Node.js LTS release.

```bash
npm run build       # Production output in dist/
npm run preview     # Serve the production build locally
npm run lint        # Existing ESLint checks
npm run test:run    # Existing Vitest suite; test dependencies need repair (see below)
```

## Architecture and workflows

`src/main.tsx` mounts theme support and the app, and registers the production service worker. `src/App.tsx` defines React Router routes, error boundaries, toast providers and the React Query provider. Most feature data is fetched directly with component effects and local state.

| Area | Entry point | Responsibilities |
| --- | --- | --- |
| Public | `src/pages/Landing.tsx`, `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` | Landing, registration, login and password recovery |
| Students | `src/pages/Dashboard.tsx`, `src/components/student/` | Profile, teacher selection, lessons, progress, quizzes and exams |
| Teachers | `src/pages/Teacher.tsx`, `src/components/teacher/` | Assigned students, enrollment requests, class completion and exam grading |
| Pastors | `src/pages/Pastor.tsx` | Oversight dashboard using shared management components |
| Administrators | `src/pages/Admin.tsx`, `src/components/admin/` | Users, teachers, classes, enrollments, graduation, exports, exam settings and batch reset |
| Shared UI | `src/components/ui/`, `src/components/shared/` | UI primitives, avatars, uploads, video viewing and notifications |

`src/lib/supabase.ts` creates the browser client. `supabase-auth.ts` handles Auth sessions and profiles; `supabase-db.ts` wraps database operations and maps database snake_case fields to application camelCase fields. `supabase-types.ts` contains database types. Browser route checks support navigation; database permissions must enforce authorization.

Core tables include `users`, `classes`, `church_teachers`, `enrollments` and `exams`. Later code also uses `notifications`, `enrollment_requests`, `user_preferences`, `app_settings` and `church_oversight`. Avatars use Supabase Storage. CSV/Excel exports are implemented in `src/lib/exports.ts`. Contact and enrollment email integrations use Web3Forms; account confirmation and password recovery use Supabase Auth email settings.

The exam has 50 automatically graded questions (50 marks), ten written questions graded by teachers (30 marks), a one-hour Section A timer and a pass mark of 64/80. Administrators control the exam lock. Batch reset clears enrollments and student teacher selections while retaining accounts and exam records.

## Vercel deployment

Import this repository into Vercel with:

- Framework preset: **Vite**
- Root directory: repository root
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

Set these environment variables in the Vercel project before building:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser anon key; never use a service role key |
| `VITE_MEDIA_BASE_URL` | If overriding the media host | Host for relative video paths; defaults to `https://ceacfoundationschool.com` |

Vite embeds `VITE_` variables in the browser bundle at build time. Rebuild after changing them. Privileged Supabase keys belong only in a trusted server or local maintenance environment.

`vercel.json` provides the SPA fallback and response headers. The Vite build copies the selected favicon, logo, font, robots and service worker assets. The service worker bypasses external, API and authenticated requests to keep those responses out of its shared cache. Lesson videos are excluded from Git and production assets, so an external media host must serve them. If moving the existing custom domain to Vercel, configure a separate media host first to preserve video URLs.

Configure Supabase Auth's Site URL and allowed confirmation/password-reset redirect URLs for the deployed origin, including `/reset-password`. Verify registration, confirmation, login, password reset, role access, video playback, avatar upload and exam submission on the deployed app.

Official deployment reference: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Database setup and launch review

This repository contains historical SQL snapshots, dated migrations and standalone repair/reset scripts. They are not a verified, ordered bootstrap for a fresh database. Compare them with the existing Supabase schema before applying anything. The base schema scripts contain destructive operations. `database/migrations/20261105072325_restore_portal_schema_gaps.sql` adds the optional `users.primary_teacher_id` reference and the exam-lock settings table without resetting existing records. `church_oversight` is present in the live database but its creation is not included in the historical SQL; newer exam fields are described in `exam-migration.sql`.

Source review identified the following launch priorities. These describe checked-in code and SQL; the live database has not been audited:

- **Credentials:** a hard-coded Supabase service role key was removed from the JavaScript maintenance script before the initial commit. Rotate the old key in Supabase and review where else it may have been copied.
- **Role protection:** the historical `users` self-insert/update policies restrict row identity but do not protect the `role` column. Restrict privileged fields at the database layer and review policies that query `users` from policies on that same table.
- **Exam integrity:** the answer key, timing, scoring and lock checks are in the browser. Historical student exam update policies allow changes to the student's exam row without protecting grading fields. Move trusted grading, timing and submission validation to a server/database boundary.
- **Privileged SQL:** `delete_user_completely` is a `SECURITY DEFINER` function without a caller role check. Review its execution grants and authorization before using this schema.
- **Route authorization:** the `/admin` component redirects students and teachers but also admits pastors. Confirm the intended role boundary and enforce it consistently in the database.
- **Incomplete integrations:** notification code calls `supabaseDb.getUsersByRole`, which is not implemented. Existing Vitest files import packages absent from `package.json`, so the test command is not currently reproducible.
- **Performance:** management dashboards repeatedly fetch broad tables every five seconds, and routes are eagerly imported. Scoped queries, shared query caching and route splitting are opportunities after correctness issues are resolved.

See [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) for database authorization guidance.

### Verification of the initial GitHub snapshot

- `npm ci`: passed from the committed lockfile.
- `npm run build`: passed. Vite reports a large JavaScript bundle; route splitting remains a performance task.
- Production artifacts: required static files and root-relative asset URLs verified; lesson videos excluded.
- Service worker: verified that external, API and authenticated requests bypass caching.
- `npm run lint`: 43 existing errors and 25 warnings.
- `tsc --noEmit -p tsconfig.app.json`: 155 errors, including missing test packages, stale application interfaces and database typing mismatches.
- `npm run test:run`: cannot run because `vitest` is not installed or declared.
- Staged source: no credential-pattern findings; local environment and excluded files verified absent.

Vite's build command transpiles TypeScript without type-checking, so a successful production build does not resolve the type errors above. Live Supabase configuration and end-to-end authenticated workflows have not been verified.

## Repository hygiene

Local environment files, dependencies, build outputs, videos, generated Vite configuration, hosting metadata, source examination PDFs and the favicon archive are excluded from Git. `.env.example` contains placeholders only. Maintenance scripts under `scripts/` are separate from the application and must never run as part of deployment.

## License

Proprietary. See [LICENSE](LICENSE).
