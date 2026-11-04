/**
 * Delete All Supabase Auth Users (TypeScript version)
 * 
 * This script deletes ALL users from Supabase Auth
 * 
 * SETUP:
 * 1. Add to your .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=your_url
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * 
 * 2. Run: npx tsx scripts/delete-all-auth-users.ts
 *    (or: ts-node scripts/delete-all-auth-users.ts)
 */

import { createClient } from '@supabase/supabase-js';

// Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing environment variables!');
  console.error('');
  console.error('Please add to your .env.local:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('');
  console.error('Get service_role key from:');
  console.error('  Supabase Dashboard > Settings > API > service_role');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAllAuthUsers() {
  console.log('🔍 Fetching all auth users...\n');

  try {
    // List all users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const users = data.users || [];
    console.log(`📊 Found ${users.length} auth users\n`);

    if (users.length === 0) {
      console.log('✅ No users to delete!');
      return;
    }

    // Delete each user
    let deletedCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        console.log(`🗑️  Deleting: ${user.email || user.id}`);
        
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
          user.id
        );

        if (!deleteError) {
          deletedCount++;
          console.log(`   ✅ Deleted successfully`);
        } else {
          failedCount++;
          console.log(`   ❌ Failed: ${deleteError.message}`);
        }
      } catch (error: any) {
        failedCount++;
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Deleted: ${deletedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📝 Total: ${users.length}`);
    
    if (deletedCount === users.length) {
      console.log('\n🎉 All auth users deleted successfully!');
      console.log('✨ You can now register with any email!');
    } else {
      console.log('\n⚠️  Some users failed to delete. Check errors above.');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

console.log('🚀 Starting auth user deletion...\n');
deleteAllAuthUsers();











































