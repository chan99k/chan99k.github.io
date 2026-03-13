import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];
const ADMIN_EMAILS = ['kjkj5868@gmail.com'];
const ALLOWED_ACTIONS = ['submit', 'my-submissions', 'review-list', 'approve', 'reject'] as const;
const MAX_QUESTION_LENGTH = 5000;

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

    let body: { action: string; data?: Record<string, unknown> };
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

    // --- submit: 사용자 기출문제 제출 ---
    if (body.action === 'submit') {
        const question = String(body.data?.question ?? '').trim();
        if (!question) {
            return new Response(JSON.stringify({ error: 'Question text is required' }), {
                status: 400,
                headers: responseHeaders,
            });
        }

        const { data: submission, error } = await supabase
            .from('submitted_questions')
            .insert({
                submitter_id: user.id,
                question: question.slice(0, MAX_QUESTION_LENGTH),
                difficulty: String(body.data?.difficulty ?? 'junior'),
                company_name: body.data?.company_name ? String(body.data.company_name).slice(0, 100) : null,
                is_anonymous: body.data?.is_anonymous !== false,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('[submit-question] submit error:', error);
            return new Response(JSON.stringify({ error: 'Failed to submit question' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        return new Response(JSON.stringify({ id: submission.id, status: submission.status }), {
            headers: responseHeaders,
        });
    }

    // --- my-submissions: 내 제출 목록 ---
    if (body.action === 'my-submissions') {
        const limit = Math.min(Number(body.data?.limit ?? 20), 50);
        const offset = Number(body.data?.offset ?? 0);

        const { data: submissions, count, error } = await supabase
            .from('submitted_questions')
            .select('id, question, difficulty, company_name, status, created_at', { count: 'exact' })
            .eq('submitter_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[submit-question] my-submissions error:', error);
            return new Response(JSON.stringify({ error: 'Failed to list submissions' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        return new Response(JSON.stringify({ submissions: submissions ?? [], total: count ?? 0 }), {
            headers: responseHeaders,
        });
    }

    // --- Admin-only actions ---
    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

    // --- review-list: 관리자 pending 목록 ---
    if (body.action === 'review-list') {
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: 'Admin only' }), {
                status: 403,
                headers: responseHeaders,
            });
        }

        const { data: submissions, count, error } = await supabase
            .from('submitted_questions')
            .select('*', { count: 'exact' })
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            return new Response(JSON.stringify({ error: 'Failed to list' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        return new Response(JSON.stringify({ submissions: submissions ?? [], total: count ?? 0 }), {
            headers: responseHeaders,
        });
    }

    // --- approve: 승인 → interview_questions 복사 + 포인트 적립 ---
    if (body.action === 'approve') {
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: 'Admin only' }), {
                status: 403,
                headers: responseHeaders,
            });
        }

        const submissionId = String(body.data?.submission_id ?? '');
        if (!submissionId) {
            return new Response(JSON.stringify({ error: 'Missing submission_id' }), {
                status: 400,
                headers: responseHeaders,
            });
        }

        // Update submission status
        const { data: submission, error: updateError } = await supabase
            .from('submitted_questions')
            .update({
                status: 'approved',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                auto_category: body.data?.category ? String(body.data.category) : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', submissionId)
            .select()
            .single();

        if (updateError || !submission) {
            return new Response(JSON.stringify({ error: 'Failed to approve' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        // Copy to interview_questions
        const { data: newQuestion, error: insertError } = await supabase
            .from('interview_questions')
            .insert({
                title: body.data?.title ? String(body.data.title) : submission.question.slice(0, 100),
                question: submission.question,
                category: body.data?.category ? String(body.data.category) : submission.auto_category ?? 'general',
                difficulty: submission.difficulty,
                source: 'community',
                created_by: submission.submitter_id,
                is_active: true,
            })
            .select()
            .single();

        if (insertError) {
            console.error('[submit-question] copy to interview_questions error:', insertError);
        }

        // Update submission with approved_question_id
        if (newQuestion) {
            await supabase
                .from('submitted_questions')
                .update({ approved_question_id: newQuestion.id })
                .eq('id', submissionId);
        }

        // Grant 100P to submitter
        await supabase.rpc('earn_points', {
            p_user_id: submission.submitter_id,
            p_amount: 100,
            p_type: 'question_submit',
            p_reference_id: submissionId,
            p_description: '기출 문제 기부 보상',
        });

        return new Response(JSON.stringify({ ok: true, question_id: newQuestion?.id }), {
            headers: responseHeaders,
        });
    }

    // --- reject: 반려 ---
    if (body.action === 'reject') {
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: 'Admin only' }), {
                status: 403,
                headers: responseHeaders,
            });
        }

        const submissionId = String(body.data?.submission_id ?? '');
        if (!submissionId) {
            return new Response(JSON.stringify({ error: 'Missing submission_id' }), {
                status: 400,
                headers: responseHeaders,
            });
        }

        const { error } = await supabase
            .from('submitted_questions')
            .update({
                status: 'rejected',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                reject_reason: body.data?.reason ? String(body.data.reason).slice(0, 500) : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', submissionId);

        if (error) {
            return new Response(JSON.stringify({ error: 'Failed to reject' }), {
                status: 500,
                headers: responseHeaders,
            });
        }

        return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400,
        headers: responseHeaders,
    });
};
