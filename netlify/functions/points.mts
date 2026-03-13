import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { validateOrigin, addCorsHeaders } from './utils/cors.js';

const ALLOWED_ACTIONS = ['balance', 'history'] as const;

export default async (req: Request, _context: Context) => {
    const origin = req.headers.get('origin');

    if (!validateOrigin(origin)) {
        return new Response('Forbidden', { status: 403 });
    }

    if (req.method === 'OPTIONS') {
        const h = new Headers();
        addCorsHeaders(h, origin!);
        return new Response(null, { status: 204, headers: h });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return new Response('Unauthorized', { status: 401 });
    }

    let body: { action: string; limit?: number; offset?: number };
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    if (!ALLOWED_ACTIONS.includes(body.action as typeof ALLOWED_ACTIONS[number])) {
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    addCorsHeaders(responseHeaders, origin!);

    if (body.action === 'balance') {
        const { data, error } = await supabase.rpc('get_point_balance', {
            p_user_id: user.id,
        });

        if (error) {
            console.error('[points] balance error:', error);
            return new Response(JSON.stringify({ error: 'Failed to get balance' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        const row = Array.isArray(data) ? data[0] : data;
        return new Response(JSON.stringify({
            balance: row?.balance ?? 0,
            total_earned: row?.total_earned ?? 0,
            total_spent: row?.total_spent ?? 0,
        }), { headers: responseHeaders });
    }

    if (body.action === 'history') {
        const limit = Math.min(Number(body.limit ?? 20), 50);
        const offset = Number(body.offset ?? 0);

        const { data: transactions, count, error } = await supabase
            .from('point_transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[points] history error:', error);
            return new Response(JSON.stringify({ error: 'Failed to get history' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        return new Response(JSON.stringify({
            transactions: transactions ?? [],
            total: count ?? 0,
        }), { headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400,
        headers: responseHeaders,
    });
};
