import { createClient } from '@supabase/supabase-js';

// WARNING: These keys are hardcoded for debugging purposes to bypass persistent environment variable loading issues.
// For production, always use environment variables!
const supabaseUrl = "https://ouafxlipzcjpaqgzuagd.supabase.co";
const supabaseAnonKey = "sb_publishable_BCEL46qKxLkC4BPWaNV5dw_VMhXci5u";

// No longer needed since keys are hardcoded
// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('Supabase URL or Anon Key is missing. Please check your .env.local file.');
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
