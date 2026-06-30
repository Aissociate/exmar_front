import { createClient } from '@supabase/supabase-js';

// Fallback values so the /admin app renders its login screen instead of
// white-screening when the Supabase env vars are missing. Auth calls will fail
// gracefully until real credentials are provided.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[supabase] Variables d\'environnement manquantes — connexion à l\'espace admin indisponible tant que VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ne sont pas définis.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'maritime-expertise-app',
    },
  },
});
