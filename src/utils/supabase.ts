import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
    return (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SUPABASE_URL : undefined)
        ?? process.env.SUPABASE_URL
        ?? process.env.PUBLIC_SUPABASE_URL
        ?? '';
}

function getSupabaseAnonKey(): string {
    return (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SUPABASE_ANON_KEY : undefined)
        ?? process.env.SUPABASE_ANON_KEY
        ?? process.env.PUBLIC_SUPABASE_ANON_KEY
        ?? '';
}

// Lazy-initialized to avoid build-time errors when env vars are not set
let _supabase: SupabaseClient | null = null;

/** Browser client (uses anon key, respects RLS). Lazy-initialized. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabase) {
            const url = getSupabaseUrl();
            const key = getSupabaseAnonKey();
            if (!url || !key) {
                throw new Error('Supabase URL and anon key must be set in environment variables');
            }
            _supabase = createClient(url, key);
        }
        return (_supabase as unknown as Record<string, unknown>)[prop as string];
    },
});

/** Server client factory (uses service role key, bypasses RLS) */
export function createServerClient(): SupabaseClient {
    const url = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    return createClient(url, serviceRoleKey);
}
