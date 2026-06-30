import { createClient } from '@supabase/supabase-js';

// Fallback values so the public site never white-screens when the Supabase env
// vars are missing (e.g. not yet configured on the hosting provider). The
// marketing site still renders; only the contact form needs real credentials.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — ' +
      'le formulaire de contact ne fonctionnera pas tant que ces variables ne sont pas définies.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
