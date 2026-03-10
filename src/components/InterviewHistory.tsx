import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

interface SessionSummary {
    id: string;
    status: string;
    initial_question: string;
    total_score: number | null;
    feedback: { totalScore?: number } | null;
    created_at: string;
    completed_at: string | null;
}

type SortKey = 'date' | 'score';

export default function InterviewHistory() {
    const [user, setUser] = useState<User | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>('date');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            if (u) fetchSessions(u);
            else setLoading(false);
        });
    }, []);

    async function fetchSessions(u: User) {
        try {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            const token = authSession?.access_token;
            if (!token) return;

            const body: Record<string, unknown> = { action: 'list', data: { limit: 50 } };
            if (filterStatus !== 'all') body.data = { ...body.data as object, status: filterStatus };

            const res = await fetch('/.netlify/functions/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions);
                setTotal(data.total);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }

    function handleLogin(provider: 'google' | 'github') {
        supabase.auth.signInWithOAuth({ provider });
    }

    if (!user && !loading) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-6 dark:border-neutral-700">
                <h2 className="mb-4 text-xl font-bold">면접 히스토리</h2>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">로그인하여 면접 기록을 확인하세요.</p>
                <div className="flex gap-2">
                    <button onClick={() => handleLogin('google')} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Google 로그인</button>
                    <button onClick={() => handleLogin('github')} className="rounded bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-900">GitHub 로그인</button>
                </div>
            </div>
        );
    }

    const sorted = [...sessions].sort((a, b) => {
        if (sortBy === 'score') {
            const sa = a.feedback?.totalScore ?? a.total_score ?? 0;
            const sb = b.feedback?.totalScore ?? b.total_score ?? 0;
            return sb - sa;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">면접 히스토리</h2>
                <a href="/interview/chat" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">새 면접</a>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-2">
                <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); if (user) { setLoading(true); fetchSessions(user); } }}
                    className="rounded border px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                    <option value="all">전체</option>
                    <option value="completed">완료</option>
                    <option value="active">진행중</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="rounded border px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                    <option value="date">날짜순</option>
                    <option value="score">점수순</option>
                </select>
                <span className="ml-auto self-center text-xs text-neutral-500">총 {total}건</span>
            </div>

            {loading ? (
                <p className="py-8 text-center text-neutral-500">불러오는 중...</p>
            ) : sorted.length === 0 ? (
                <div className="rounded-xl border p-8 text-center dark:border-neutral-700">
                    <p className="text-neutral-500">아직 면접 기록이 없습니다.</p>
                    <a href="/interview/chat" className="mt-4 inline-block text-sm text-blue-600 underline">첫 면접 시작하기</a>
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map((s) => {
                        const score = s.feedback?.totalScore ?? s.total_score ?? null;
                        const isCompleted = s.status === 'completed';
                        return (
                            <a
                                key={s.id}
                                href={isCompleted ? `/interview/result/${s.id}` : undefined}
                                className={`block rounded-xl border p-4 transition-colors dark:border-neutral-700 ${isCompleted ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'opacity-60'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{s.initial_question}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                                            <span>
                                                {new Date(s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`rounded px-1.5 py-0.5 ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {isCompleted ? '완료' : '미완료'}
                                            </span>
                                        </div>
                                    </div>
                                    {score !== null && (
                                        <div className={`ml-4 text-2xl font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {score}
                                        </div>
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
