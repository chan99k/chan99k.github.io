import type { Context } from '@netlify/functions';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];
const ALLOWED_ACTIONS = ['submit', 'my-submissions', 'review-list', 'approve', 'reject'] as const;
const ALLOWED_DIFFICULTIES = ['junior', 'mid', 'senior'] as const;
const ALLOWED_CATEGORIES = ['frontend', 'backend', 'dba', 'devops', 'general'] as const;
const MAX_QUESTION_LENGTH = 5000;

function getAdminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
}

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

function jsonResponse(body: unknown, status: number, headers: Headers): Response {
    return new Response(JSON.stringify(body), { status, headers });
}

// --- Action handlers ---

async function handleSubmit(
    supabase: SupabaseClient, user: User,
    data: Record<string, unknown> | undefined, headers: Headers,
): Promise<Response> {
    const question = String(data?.question ?? '').trim();
    if (!question) {
        return jsonResponse({ error: 'Question text is required' }, 400, headers);
    }

    const difficulty = String(data?.difficulty ?? 'junior');
    if (!ALLOWED_DIFFICULTIES.includes(difficulty as typeof ALLOWED_DIFFICULTIES[number])) {
        return jsonResponse({ error: `Invalid difficulty. Allowed: ${ALLOWED_DIFFICULTIES.join(', ')}` }, 400, headers);
    }

    const { data: submission, error } = await supabase
        .from('submitted_questions')
        .insert({
            submitter_id: user.id,
            question: question.slice(0, MAX_QUESTION_LENGTH),
            difficulty,
            company_name: data?.company_name ? String(data.company_name).slice(0, 100) : null,
            is_anonymous: data?.is_anonymous !== false,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('[submit-question] submit error:', error);
        return jsonResponse({ error: 'Failed to submit question' }, 500, headers);
    }

    return jsonResponse({ id: submission.id, status: submission.status }, 200, headers);
}

async function handleMySubmissions(
    supabase: SupabaseClient, user: User,
    data: Record<string, unknown> | undefined, headers: Headers,
): Promise<Response> {
    const limit = Math.min(Number(data?.limit ?? 20), 50);
    const offset = Number(data?.offset ?? 0);

    const { data: submissions, count, error } = await supabase
        .from('submitted_questions')
        .select('id, question, difficulty, company_name, status, created_at', { count: 'exact' })
        .eq('submitter_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[submit-question] my-submissions error:', error);
        return jsonResponse({ error: 'Failed to list submissions' }, 500, headers);
    }

    return jsonResponse({ submissions: submissions ?? [], total: count ?? 0 }, 200, headers);
}

async function handleReviewList(
    supabase: SupabaseClient, user: User, headers: Headers,
): Promise<Response> {
    if (!getAdminEmails().includes(user.email ?? '')) {
        return jsonResponse({ error: 'Admin only' }, 403, headers);
    }

    const { data: submissions, count, error } = await supabase
        .from('submitted_questions')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        return jsonResponse({ error: 'Failed to list' }, 500, headers);
    }

    return jsonResponse({ submissions: submissions ?? [], total: count ?? 0 }, 200, headers);
}

async function handleApprove(
    supabase: SupabaseClient, user: User,
    data: Record<string, unknown> | undefined, headers: Headers,
): Promise<Response> {
    if (!getAdminEmails().includes(user.email ?? '')) {
        return jsonResponse({ error: 'Admin only' }, 403, headers);
    }

    const submissionId = String(data?.submission_id ?? '');
    if (!submissionId) {
        return jsonResponse({ error: 'Missing submission_id' }, 400, headers);
    }

    const category = data?.category ? String(data.category) : null;
    if (category && !ALLOWED_CATEGORIES.includes(category as typeof ALLOWED_CATEGORIES[number])) {
        return jsonResponse({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` }, 400, headers);
    }

    // Update submission status
    const { data: submission, error: updateError } = await supabase
        .from('submitted_questions')
        .update({
            status: 'approved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            auto_category: category,
            updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

    if (updateError || !submission) {
        return jsonResponse({ error: 'Failed to approve' }, 500, headers);
    }

    // Copy to interview_questions
    const { data: newQuestion, error: insertError } = await supabase
        .from('interview_questions')
        .insert({
            title: data?.title ? String(data.title) : submission.question.slice(0, 100),
            question: submission.question,
            category: category ?? submission.auto_category ?? 'general',
            difficulty: submission.difficulty,
            source: 'community',
            created_by: submission.submitter_id,
            is_active: true,
        })
        .select()
        .single();

    if (insertError || !newQuestion) {
        console.error('[submit-question] copy to interview_questions error:', insertError);
        // Rollback: revert submission to pending
        await supabase
            .from('submitted_questions')
            .update({ status: 'pending', reviewed_by: null, reviewed_at: null, updated_at: new Date().toISOString() })
            .eq('id', submissionId);
        return jsonResponse({ error: 'Failed to copy question to question bank. Approval reverted.' }, 500, headers);
    }

    // Link approved_question_id
    await supabase
        .from('submitted_questions')
        .update({ approved_question_id: newQuestion.id })
        .eq('id', submissionId);

    // Grant 100P to submitter (only after successful copy)
    await supabase.rpc('earn_points', {
        p_user_id: submission.submitter_id,
        p_amount: 100,
        p_type: 'question_submit',
        p_reference_id: submissionId,
        p_description: '기출 문제 기부 보상',
    });

    return jsonResponse({ ok: true, question_id: newQuestion.id }, 200, headers);
}

async function handleReject(
    supabase: SupabaseClient, user: User,
    data: Record<string, unknown> | undefined, headers: Headers,
): Promise<Response> {
    if (!getAdminEmails().includes(user.email ?? '')) {
        return jsonResponse({ error: 'Admin only' }, 403, headers);
    }

    const submissionId = String(data?.submission_id ?? '');
    if (!submissionId) {
        return jsonResponse({ error: 'Missing submission_id' }, 400, headers);
    }

    const { error } = await supabase
        .from('submitted_questions')
        .update({
            status: 'rejected',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            reject_reason: data?.reason ? String(data.reason).slice(0, 500) : null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

    if (error) {
        return jsonResponse({ error: 'Failed to reject' }, 500, headers);
    }

    return jsonResponse({ ok: true }, 200, headers);
}

// --- Main handler ---

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

    switch (body.action) {
        case 'submit':
            return handleSubmit(supabase, user, body.data, responseHeaders);
        case 'my-submissions':
            return handleMySubmissions(supabase, user, body.data, responseHeaders);
        case 'review-list':
            return handleReviewList(supabase, user, responseHeaders);
        case 'approve':
            return handleApprove(supabase, user, body.data, responseHeaders);
        case 'reject':
            return handleReject(supabase, user, body.data, responseHeaders);
        default:
            return jsonResponse({ error: 'Unknown action' }, 400, responseHeaders);
    }
};
