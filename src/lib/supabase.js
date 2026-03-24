import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Beyond] Missing Supabase env vars.\n' +
    'Copy .env.example → .env and fill in your project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist session in localStorage — survives page refresh
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
