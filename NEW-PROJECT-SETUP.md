# 🚀 New Supabase Project Setup Guide

## Complete checklist for setting up your Foundation Portal from scratch

---

## 📋 Step 1: Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: Foundation Portal (or your choice)
   - **Database Password**: Save this somewhere safe!
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. ⏳ Wait for project to initialize (~2 minutes)

---

## 📋 Step 2: Update Your App Configuration

### Update `.env.local`:

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy your credentials
3. Update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role Key (for admin operations - KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Update `src/lib/supabase.ts` (if needed):

Make sure it uses the env variables:
```typescript
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);
```

---

## 📋 Step 3: Run Database Schema

1. Go to **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **"+ New query"**
4. Open your `supabase-schema.sql` file
5. **Copy the entire file** (Ctrl+A, Ctrl+C)
6. **Paste** into SQL Editor
7. Click **"Run"** (or Ctrl+Enter)
8. ✅ Wait for success message

**What this creates:**
- ✅ `users` table
- ✅ `church_teachers` table
- ✅ `classes` table
- ✅ `enrollments` table
- ✅ `exams` table
- ✅ All RLS policies
- ✅ All indexes
- ✅ 5 sample classes

---

## 📋 Step 4: Create Your First Admin User

### A. Create in Supabase Auth

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: `admin@example.com` (or your email)
   - **Password**: Choose a secure password
   - ✅ **Check** "Auto Confirm User"
4. Click **"Create user"**
5. **Copy the User UID** (you'll need it next)

### B. Add to Database

1. Go to **SQL Editor**
2. Run this query (replace with your actual values):

```sql
INSERT INTO public.users (id, email, name, role)
VALUES (
  'PASTE_USER_UID_HERE',    -- UUID you copied from Auth
  'admin@example.com',       -- Same email from Auth
  'Admin User',              -- Your name
  'admin'                    -- Role
);
```

3. Click **"Run"**
4. ✅ Verify it worked:

```sql
SELECT id, email, name, role FROM public.users;
```

Should show your admin user!

---

## 📋 Step 5: Test Login

1. Go to your app: `http://localhost:8080`
2. Click **"Sign In"**
3. Enter:
   - Email: `admin@example.com`
   - Password: (the one you set in Auth)
4. ✅ Should redirect to `/admin` dashboard!

---

## 📋 Step 6: Create Teacher Users (Optional)

### A. Create in Auth

1. **Authentication** → **Users** → **"Add user"**
2. Fill in teacher details
3. ✅ Check "Auto Confirm User"
4. Copy the UUID

### B. Add to Database

```sql
-- Add teacher to users table
INSERT INTO public.users (id, email, name, role, church)
VALUES (
  'teacher-uuid-here',
  'teacher@pfcc1.com',
  'Teacher John',
  'teacher',
  'PFCC 1'
);

-- Map teacher to their church
INSERT INTO public.church_teachers (church, teacher_id)
VALUES ('PFCC 1', 'teacher-uuid-here');
```

### C. Repeat for each teacher

Each church should have at least one teacher!

---

## 📋 Step 7: Configure Email Settings (Optional)

For password reset and email confirmation:

1. Go to **Authentication** → **Email Templates**
2. Customize templates if desired
3. Configure SMTP (or use Supabase's built-in email)

---

## 📋 Step 8: Update App URLs (If deploying)

When deploying to production:

1. Update redirect URLs in **Authentication** → **URL Configuration**
2. Add your production domain

---

## ✅ Complete Checklist

- [ ] New Supabase project created
- [ ] Updated `.env.local` with new credentials
- [ ] Ran `supabase-schema.sql` successfully
- [ ] Created admin user in Auth
- [ ] Added admin user to database
- [ ] Tested login works
- [ ] Created teacher users (if needed)
- [ ] Mapped teachers to churches
- [ ] App connects successfully

---

## 🎯 Quick Reference

### Database Tables:
- `users` - User profiles (admin, teacher, student)
- `church_teachers` - Maps teachers to churches
- `classes` - Foundation school classes
- `enrollments` - Student enrollments (requires teacher assignment)
- `exams` - Exam scores

### Default Roles:
- **admin** - Full access, can manage everything
- **teacher** - Can enroll students, approve graduations
- **student** - Can enroll in classes, take exams

### Important Rules:
- Students MUST select a teacher when enrolling
- Only assigned teacher (or admin) can approve graduation
- Each church has its own list of available teachers

---

## 🐛 Troubleshooting

### "User already registered"
- User exists in Auth but trying to create again
- Solution: Delete from Authentication → Users first

### "User profile not found"
- User exists in Auth but not in database
- Solution: Add to database with matching UUID

### "No teachers available"
- Church has no teachers assigned
- Solution: Add teachers to `church_teachers` table

### Connection errors
- Check `.env.local` has correct URL and keys
- Restart dev server after changing `.env.local`

---

## 🔒 Security Reminders

### DO:
- ✅ Keep service_role key secret
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use auto-confirm for development only
- ✅ Enable email confirmation in production

### DON'T:
- ❌ Commit keys to git
- ❌ Share service_role key
- ❌ Use same credentials in production

---

## 📚 Helpful Commands

### Check users:
```sql
SELECT id, email, name, role, church FROM public.users;
```

### Check teachers:
```sql
SELECT ct.church, u.name, u.email
FROM public.church_teachers ct
JOIN public.users u ON ct.teacher_id = u.id
WHERE ct.is_active = true;
```

### Check enrollments:
```sql
SELECT 
  u.name as student,
  c.name as class,
  t.name as teacher,
  e.graduated
FROM public.enrollments e
JOIN public.users u ON e.student_id = u.id
JOIN public.classes c ON e.class_id = c.id
JOIN public.users t ON e.assigned_teacher_id = t.id;
```

---

## 🎉 You're Done!

Your Foundation Portal is now set up and ready to use!

### Next Steps:
1. Create teacher users for each church
2. Map teachers to their churches
3. Test student registration
4. Test enrollment with teacher selection
5. Test graduation approval

**Happy teaching! 🎓**











































