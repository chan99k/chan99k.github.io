import { createClient } from '@supabase/supabase-js';

// Astro uses import.meta.env, Netlify Functions use process.env
const supabaseUrl =
    (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SUPABASE_URL : undefined)
    ?? process.env.SUPABASE_URL
    ?? process.env.PUBLIC_SUPABASE_URL
    ?? '';

const supabaseAnonKey =
    (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SUPABASE_ANON_KEY : undefined)
    ?? process.env.SUPABASE_ANON_KEY
    ?? process.env.PUBLIC_SUPABASE_ANON_KEY
    ?? '';

/** Browser client (uses anon key, respects RLS) */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Server client factory (uses service role key, bypasses RLS) */
export function createServerClient() {
    const url = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    return createClient(url, serviceRoleKey);
}
