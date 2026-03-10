import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];
const PAGE_SIZE = 20;

function getAllowedOrigins(): string[] {
    const origins = [...ALLOWED_ORIGINS];
    const deployUrl = process.env.DEPLOY_PRIME_URL;
    if (deployUrl) origins.push(deployUrl);
    return origins;
}

function validateOrigin(origin: string | null): boolean {
    if (!origin) return false;
    return getAllowedOrigins().includes(origin);
}

function addCorsHeaders(headers: Headers, origin: string): void {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async (req: Request, _context: Context) => {
    const origin = req.headers.get('origin');
    if (!validateOrigin(origin)) return new Response('Forbidden', { status: 403 });

    if (req.method === 'OPTIONS') {
        const h = new Headers();
        addCorsHeaders(h, origin!);
        return new Response(null, { status: 204, headers: h });
    }

    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response('Invalid token', { status: 401 });

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }

    const action = body.action as string;
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    addCorsHeaders(responseHeaders, origin!);

    // LIST: 질문 목록 (필터링 + 페이지네이션)
    if (action === 'list') {
        let query = supabase.from('interview_questions').select('*', { count: 'exact' })
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (body.category) query = query.eq('category', body.category);
        if (body.difficulty) query = query.eq('difficulty', body.difficulty);
        if (body.search && typeof body.search === 'string') {
            // Sanitize PostgREST filter special chars to prevent filter injection
            const sanitized = body.search.replace(/[%_\\(),."']/g, '');
            if (sanitized.length > 0) {
                query = query.or(`title.ilike.%${sanitized}%,question.ilike.%${sanitized}%`);
            }
        }

        const page = Math.max(1, Number(body.page) || 1);
        const from = (page - 1) * PAGE_SIZE;
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data, error, count } = await query;
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: responseHeaders });
        return new Response(JSON.stringify({ questions: data, total: count, page, pageSize: PAGE_SIZE }), { headers: responseHeaders });
    }

    // GET: 질문 상세
    if (action === 'get') {
        const { data, error } = await supabase.from('interview_questions').select('*').eq('id', body.id).single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: responseHeaders });
        return new Response(JSON.stringify({ question: data }), { headers: responseHeaders });
    }

    // CREATE: 질문 생성
    if (action === 'create') {
        const q = body.data as Record<string, unknown>;
        const { data, error } = await supabase.from('interview_questions').insert({
            ...q, created_by: user.id,
        }).select().single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: responseHeaders });
        return new Response(JSON.stringify({ question: data }), { status: 201, headers: responseHeaders });
    }

    // UPDATE: 질문 수정
    if (action === 'update') {
        const q = body.data as Record<string, unknown>;
        const { data, error } = await supabase.from('interview_questions')
            .update({ ...q, updated_at: new Date().toISOString() })
            .eq('id', body.id).eq('created_by', user.id)
            .select().single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: responseHeaders });
        return new Response(JSON.stringify({ question: data }), { headers: responseHeaders });
    }

    // DELETE: 질문 비활성화 (soft delete)
    if (action === 'delete') {
        const { error } = await supabase.from('interview_questions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', body.id).eq('created_by', user.id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: responseHeaders });
        return new Response(JSON.stringify({ success: true }), { headers: responseHeaders });
    }

    return new Response('Unknown action', { status: 400, headers: responseHeaders });
};
