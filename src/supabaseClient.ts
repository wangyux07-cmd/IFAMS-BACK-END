import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your .env file and ensure variables are prefixed with VITE_');
  // Optionally, you might want to throw an error or handle this more gracefully
  // throw new Error('Supabase environment variables are not set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Explicitly enable session persistence
    storage: localStorage, // Explicitly use localStorage
    autoRefreshToken: true, // Automatically refresh the session
    detectSessionInUrl: true // Detect session in URL, useful for email redirects
  }
});
