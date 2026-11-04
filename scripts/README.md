# Delete All Supabase Auth Users

These scripts completely clear all users from Supabase Auth to fix "user already registered" errors.

---

## 🎯 Quick Start

### Option 1: JavaScript (No dependencies!)

1. **Get your credentials** from Supabase Dashboard:
   - Go to **Settings** → **API**
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy **service_role** key (⚠️ NOT the anon key!)

2. **Export credentials in your shell** (never paste keys into source files):
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   read -rs "SUPABASE_SERVICE_ROLE_KEY?Supabase service role key: "
   export SUPABASE_SERVICE_ROLE_KEY
   ```

3. **Run only when you intend to delete Auth users**:
   ```bash
   node scripts/delete-all-auth-users.js
   ```

---

### Option 2: TypeScript (Cleaner)

1. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Run**:
   ```bash
   npx tsx scripts/delete-all-auth-users.ts
   ```
   
   Or if you have ts-node:
   ```bash
   ts-node scripts/delete-all-auth-users.ts
   ```

---

## 🔑 Finding Your Service Role Key

1. Go to **Supabase Dashboard**
2. Open your project
3. Click **Settings** (gear icon) in left sidebar
4. Click **API**
5. Scroll to **Project API keys**
6. Copy the **`service_role`** key
   - ⚠️ **NOT the `anon` key!**
   - ⚠️ **KEEP THIS SECRET!**

---

## 📋 What This Does

1. ✅ Connects to Supabase Auth using Admin API
2. ✅ Lists all users in auth system
3. ✅ Deletes each user one by one
4. ✅ Shows progress and results
5. ✅ Allows you to register with any email after

---

## ⚠️ Security Notes

### DO:
- ✅ Use service_role key server-side only
- ✅ Keep service_role key in `.env.local`
- ✅ Add `.env.local` to `.gitignore`
- ✅ Delete script after using (or remove keys from it)

### DON'T:
- ❌ Commit service_role key to git
- ❌ Share service_role key publicly
- ❌ Use service_role key in client-side code
- ❌ Use anon key (won't work for admin operations)

---

## 🐛 Troubleshooting

### "Failed to list users"
- Check your SUPABASE_URL is correct
- Check your SERVICE_ROLE_KEY is correct
- Make sure you're using service_role key, not anon key

### "No users found" but still get error
- Try clearing browser cache
- Check your app is using correct Supabase project
- Verify you deleted users from correct project

### "Cannot find module '@supabase/supabase-js'"
For TypeScript version, install dependencies:
```bash
npm install @supabase/supabase-js
npm install -D tsx
```

---

## 🔄 Complete Reset Workflow

To fully reset your system:

1. **Delete Auth Users** (this script):
   ```bash
   node scripts/delete-all-auth-users.js
   ```

2. **Reset Database**:
   - Go to Supabase Dashboard
   - SQL Editor → New Query
   - Paste entire `supabase-schema.sql`
   - Run

3. **Verify**:
   ```bash
   # Auth should show 0 users
   # Database should show 0 users
   ```

4. **Test**:
   - Try registering with any email
   - Should work now! ✅

---

## 💡 Alternative Methods

### Method 1: Dashboard (Manual)
- Go to Authentication → Users
- Delete each user manually
- Good for: Few users, one-time cleanup

### Method 2: This Script (Automated)
- Run script to delete all at once
- Good for: Many users, frequent resets

### Method 3: Soft Delete (Production)
- Don't delete, mark as deleted
- Good for: Production apps, audit trails

---

## 📝 Example Output

```
🚀 Starting auth user deletion...

🔍 Fetching all auth users...

📊 Found 3 auth users

🗑️  Deleting: admin@example.com
   ✅ Deleted successfully
🗑️  Deleting: teacher@example.com
   ✅ Deleted successfully
🗑️  Deleting: student@example.com
   ✅ Deleted successfully

📊 Summary:
   ✅ Deleted: 3
   ❌ Failed: 0
   📝 Total: 3

🎉 All auth users deleted successfully!
✨ You can now register with any email!
```

---

## 🎯 Next Steps After Running

1. ✅ Auth users cleared
2. Go to your app
3. Try registering with the same email
4. Should work now!

If still having issues:
- Clear browser cache/cookies
- Try incognito/private window
- Check you're using correct Supabase project











































