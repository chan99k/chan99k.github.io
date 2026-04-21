import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { validateOrigin, addCorsHeaders } from './utils/cors.js';

const MAX_BODY_SIZE = 50 * 1024;
const MAX_CONTENT_LENGTH = 10000;
const ALLOWED_ACTIONS = ['create', 'message', 'complete', 'get', 'list'] as const;
const ALLOWED_ROLES = ['user', 'assistant'] as const;

async function authenticateUser(authHeader: string | null, supabaseUrl: string, serviceRoleKey: string) {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7));
    return user;
}

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

    if (req.method !== 'POST' && req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

    const user = await authenticateUser(req.headers.get('Authorization'), supabaseUrl, serviceRoleKey);
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Read and validate body
    let bodyText: string;
    try {
        bodyText = await req.text();
    } catch {
        return new Response('Failed to read request body', { status: 400 });
    }

    if (bodyText.length > MAX_BODY_SIZE) {
        return new Response('Request body too large', { status: 413 });
    }

    let body: { action: string; session_id?: string; data?: Record<string, unknown> };
    try {
        body = JSON.parse(bodyText);
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    if (!ALLOWED_ACTIONS.includes(body.action as typeof ALLOWED_ACTIONS[number])) {
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    addCorsHeaders(responseHeaders, origin!);

    // --- Actions ---

    if (body.action === 'create') {
        const initialQuestion = String(body.data?.initial_question ?? '').slice(0, MAX_CONTENT_LENGTH);

        const { data: session, error } = await supabase.from('sessions').insert({
            user_id: user.id,
            status: 'active',
            initial_question: initialQuestion,
        }).select().single();

        if (error) {
            console.error(JSON.stringify({ ts: new Date().toISOString(), fn: 'session', action: 'create', error: error.message }));
            return new Response(JSON.stringify({ error: 'Failed to create session' }), { status: 500, headers: responseHeaders });
        }

        // Upsert user profile
        await supabase.from('user_profiles').upsert({
            user_id: user.id,
            display_name: user.user_metadata?.name ?? user.email ?? '',
        }, { onConflict: 'user_id' });

        // Grant welcome points if first time (user_points row doesn't exist)
        const { data: existingPoints } = await supabase
            .from('user_points')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (!existingPoints) {
            await supabase.rpc('earn_points', {
                p_user_id: user.id,
                p_amount: 100,
                p_type: 'welcome',
                p_reference_id: null,
                p_description: '웰컴 포인트',
            });
        }

        console.log(JSON.stringify({ ts: new Date().toISOString(), fn: 'session', action: 'create', user: user.id, session: session.id }));
        return new Response(JSON.stringify({ session_id: session.id, status: 'active' }), { headers: responseHeaders });
    }

    if (body.action === 'message') {
        if (!body.session_id || !body.data?.content) {
            return new Response('Missing session_id or content', { status: 400, headers: responseHeaders });
        }

        const content = String(body.data.content).slice(0, MAX_CONTENT_LENGTH);
        const role = ALLOWED_ROLES.includes(body.data.role as typeof ALLOWED_ROLES[number])
            ? body.data.role as string
            : 'user';

        const { error } = await supabase.from('session_messages').insert({
            session_id: body.session_id,
            depth: Number(body.data.depth ?? 0),
            role,
            content,
            message_type: String(body.data.message_type ?? 'answer'),
            interviewer: body.data.interviewer ? String(body.data.interviewer) : null,
            related_chunks: body.data.related_chunks ?? null,
            score: body.data.score ?? null,
            ordering: Number(body.data.ordering ?? 0),
        });

        if (error) {
            console.error(JSON.stringify({ ts: new Date().toISOString(), fn: 'session', action: 'message', error: error.message }));
            return new Response(JSON.stringify({ error: 'Failed to save message' }), { status: 500, headers: responseHeaders });
        }

        return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
    }

    if (body.action === 'complete') {
        if (!body.session_id) {
            return new Response('Missing session_id', { status: 400, headers: responseHeaders });
        }

        await supabase.from('sessions').update({
            status: 'completed',
            total_score: body.data?.total_score != null ? Number(body.data.total_score) : null,
            feedback: body.data?.feedback ?? null,
            completed_at: new Date().toISOString(),
        }).eq('id', body.session_id);

        // Update user profile stats
        const { data: sessions } = await supabase
            .from('sessions')
            .select('total_score')
            .eq('user_id', user.id)
            .eq('status', 'completed');

        if (sessions && sessions.length > 0) {
            const totalSessions = sessions.length;
            const avgScore = sessions.reduce((s, r) => s + (r.total_score ?? 0), 0) / totalSessions;
            await supabase.from('user_profiles').update({
                total_sessions: totalSessions,
                avg_score: avgScore,
                updated_at: new Date().toISOString(),
            }).eq('user_id', user.id);
        }

        console.log(JSON.stringify({ ts: new Date().toISOString(), fn: 'session', action: 'complete', session: body.session_id }));
        return new Response(JSON.stringify({ ok: true, status: 'completed' }), { headers: responseHeaders });
    }

    // --- GET actions: get single session / list sessions ---

    if (body.action === 'get') {
        if (!body.session_id) {
            return new Response('Missing session_id', { status: 400, headers: responseHeaders });
        }

        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', body.session_id)
            .eq('user_id', user.id)
            .single();

        if (sessionError || !session) {
            return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: responseHeaders });
        }

        const { data: messages } = await supabase
            .from('session_messages')
            .select('*')
            .eq('session_id', body.session_id)
            .order('ordering', { ascending: true });

        return new Response(JSON.stringify({ session, messages: messages ?? [] }), { headers: responseHeaders });
    }

    if (body.action === 'list') {
        const limit = Math.min(Number(body.data?.limit ?? 20), 50);
        const offset = Number(body.data?.offset ?? 0);

        let query = supabase
            .from('sessions')
            .select('id, status, initial_question, total_score, feedback, created_at, completed_at', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (body.data?.status) {
            query = query.eq('status', String(body.data.status));
        }

        const { data: sessions, count, error: listError } = await query;

        if (listError) {
            console.error(JSON.stringify({ ts: new Date().toISOString(), fn: 'session', action: 'list', error: listError.message }));
            return new Response(JSON.stringify({ error: 'Failed to list sessions' }), { status: 500, headers: responseHeaders });
        }

        return new Response(JSON.stringify({ sessions: sessions ?? [], total: count ?? 0 }), { headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: responseHeaders });
};
