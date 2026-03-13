import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { POINT_TYPE_LABELS } from '../../schemas/points';
import type { PointBalance, PointTransaction } from '../../schemas/points';
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

type Tab = 'points' | 'history' | 'submissions';

export default function MyPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('points');
    const [balance, setBalance] = useState<PointBalance>({ balance: 0, total_earned: 0, total_spent: 0 });
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [sessionsTotal, setSessionsTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            if (u) {
                fetchBalance();
                fetchTransactions();
                fetchSessions(u);
            }
            setLoading(false);
        });
    }, []);

    async function getToken() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    }

    async function fetchBalance() {
        const token = await getToken();
        if (!token) return;
        try {
            const res = await fetch('/.netlify/functions/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'balance' }),
            });
            if (res.ok) {
                setBalance(await res.json());
            } else {
                setError(prev => prev ?? '포인트 정보를 불러오지 못했습니다.');
            }
        } catch {
            setError(prev => prev ?? '네트워크 오류가 발생했습니다.');
        }
    }

    async function fetchTransactions() {
        const token = await getToken();
        if (!token) return;
        try {
            const res = await fetch('/.netlify/functions/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'history', limit: 50 }),
            });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
            } else {
                setError(prev => prev ?? '포인트 이력을 불러오지 못했습니다.');
            }
        } catch {
            setError(prev => prev ?? '네트워크 오류가 발생했습니다.');
        }
    }

    async function fetchSessions(u: User) {
        const token = await getToken();
        if (!token) return;
        try {
            const res = await fetch('/.netlify/functions/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'list', data: { limit: 50 } }),
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions);
                setSessionsTotal(data.total);
            } else {
                setError(prev => prev ?? '면접 히스토리를 불러오지 못했습니다.');
            }
        } catch {
            setError(prev => prev ?? '네트워크 오류가 발생했습니다.');
        }
    }

    function handleLogin(provider: 'google' | 'github') {
        supabase.auth.signInWithOAuth({ provider });
    }

    if (loading) {
        return <p className="py-8 text-center text-neutral-500">불러오는 중...</p>;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-6 text-center dark:border-neutral-700">
                <h2 className="mb-4 text-xl font-bold">마이페이지</h2>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">로그인이 필요합니다.</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => handleLogin('google')} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Google 로그인</button>
                    <button onClick={() => handleLogin('github')} className="rounded bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-900">GitHub 로그인</button>
                </div>
            </div>
        );
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'points', label: '포인트' },
        { key: 'history', label: '면접 히스토리' },
        { key: 'submissions', label: '내 기출 제출' },
    ];

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">마이페이지</h2>
                <span className="text-sm text-neutral-500">{user.email}</span>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400" data-testid="error-banner">
                    {error}
                </div>
            )}

            {/* Point summary card */}
            <div className="mb-6 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-800" data-testid="points-card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">보유 포인트</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="balance">{balance.balance}P</p>
                    </div>
                    <div className="text-right text-sm text-neutral-500 dark:text-neutral-400">
                        <p>총 적립 <span className="font-medium text-green-600">{balance.total_earned}P</span></p>
                        <p>총 사용 <span className="font-medium text-red-600">{balance.total_spent}P</span></p>
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <a href="/interview/chat" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">면접 시작 (50P)</a>
                    <a href="/interview/submit" className="rounded border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-700">기출 제출 (+100P)</a>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex border-b dark:border-neutral-700">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'points' && (
                <div className="space-y-2" data-testid="points-history">
                    {transactions.length === 0 ? (
                        <p className="py-8 text-center text-neutral-500">포인트 이력이 없습니다.</p>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between rounded-lg border px-4 py-3 dark:border-neutral-700">
                                <div>
                                    <p className="text-sm font-medium">{POINT_TYPE_LABELS[tx.type] ?? tx.type}</p>
                                    {tx.description && <p className="text-xs text-neutral-500">{tx.description}</p>}
                                    <p className="text-xs text-neutral-400">{new Date(tx.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}P
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'history' && (
                <div className="space-y-3">
                    <p className="text-xs text-neutral-500">총 {sessionsTotal}건</p>
                    {sessions.length === 0 ? (
                        <div className="rounded-xl border p-8 text-center dark:border-neutral-700">
                            <p className="text-neutral-500">아직 면접 기록이 없습니다.</p>
                            <a href="/interview/chat" className="mt-4 inline-block text-sm text-blue-600 underline">첫 면접 시작하기</a>
                        </div>
                    ) : (
                        sessions.map((s) => {
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
                                                <span>{new Date(s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
                        })
                    )}
                </div>
            )}

            {tab === 'submissions' && (
                <div className="text-center py-8 text-neutral-500">
                    <p>기출 제출 내역은 준비 중입니다.</p>
                    <a href="/interview/submit" className="mt-2 inline-block text-sm text-blue-600 underline">기출 문제 제출하기</a>
                </div>
            )}
        </div>
    );
}
