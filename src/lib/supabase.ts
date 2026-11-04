/**
 * Supabase Client Configuration
 * 
 * Initializes and exports the Supabase client for:
 * - Authentication
 * - Database operations
 * - Storage operations
 * 
 * @module supabase
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

// Supabase configuration
// These will be set from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Export types for use throughout the app
export type { Database } from './supabase-types';

