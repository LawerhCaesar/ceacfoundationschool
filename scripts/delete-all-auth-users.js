/**
 * Delete All Supabase Auth Users
 * 
 * This script deletes ALL users from Supabase Auth
 * Use this to clear auth when you get "user already registered" errors
 * 
 * REQUIREMENTS:
 * - Node.js installed
 * - Supabase service_role key
 * 
 * USAGE:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your shell environment
 * 2. Run: node scripts/delete-all-auth-users.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simple fetch-based implementation (no dependencies needed)
async function deleteAllAuthUsers() {
  console.log('🔍 Fetching all auth users...');
  
  try {
    // List all users
    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to list users: ${listResponse.statusText}`);
    }

    const data = await listResponse.json();
    const users = data.users || [];

    console.log(`📊 Found ${users.length} auth users`);

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
        
        const deleteResponse = await fetch(
          `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            }
          }
        );

        if (deleteResponse.ok) {
          deletedCount++;
          console.log(`   ✅ Deleted: ${user.email || user.id}`);
        } else {
          failedCount++;
          console.log(`   ❌ Failed: ${user.email || user.id}`);
        }
      } catch (error) {
        failedCount++;
        console.log(`   ❌ Error: ${user.email || user.id} - ${error.message}`);
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
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure you:');
    console.error('   1. Set correct SUPABASE_URL');
    console.error('   2. Set correct SERVICE_ROLE_KEY (not anon key!)');
    console.error('   3. Have internet connection');
  }
}

// Validate configuration
if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
  console.error('❌ ERROR: Please set the SUPABASE_URL environment variable!');
  console.error('   Get it from: Supabase Dashboard > Settings > API > Project URL');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_')) {
  console.error('❌ ERROR: Please set the SUPABASE_SERVICE_ROLE_KEY environment variable!');
  console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key');
  console.error('   ⚠️  NOT the anon key - use the service_role key!');
  process.exit(1);
}

console.log('🚀 Starting auth user deletion...\n');
deleteAllAuthUsers();











































