import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import type { User } from '@supabase/supabase-js';

const DIFFICULTIES = [
    { value: 'junior', label: '주니어' },
    { value: 'mid', label: '미드' },
    { value: 'senior', label: '시니어' },
];

export default function SubmitQuestionForm() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [question, setQuestion] = useState('');
    const [difficulty, setDifficulty] = useState('junior');
    const [companyName, setCompanyName] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    function handleLogin(provider: 'google' | 'github') {
        supabase.auth.signInWithOAuth({ provider });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) return;

        setSubmitting(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            const res = await fetch('/.netlify/functions/submit-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'submit',
                    data: {
                        question: question.trim(),
                        difficulty,
                        company_name: companyName.trim() || null,
                        is_anonymous: isAnonymous,
                    },
                }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? '제출에 실패했습니다. 다시 시도해주세요.');
            }
        } catch {
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <p className="py-8 text-center text-neutral-500">불러오는 중...</p>;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-6 text-center dark:border-neutral-700">
                <h2 className="mb-4 text-xl font-bold">기출 문제 제출</h2>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">로그인 후 기출 문제를 제출할 수 있습니다.</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => handleLogin('google')} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Google 로그인</button>
                    <button onClick={() => handleLogin('github')} className="rounded bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-900">GitHub 로그인</button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-8 text-center dark:border-neutral-700" data-testid="submit-success">
                <div className="mb-4 text-4xl">✅</div>
                <h2 className="mb-2 text-xl font-bold">제출 완료!</h2>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                    관리자 검수 후 승인되면 <span className="font-bold text-blue-600">100P</span>가 적립됩니다.
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => { setSubmitted(false); setQuestion(''); setCompanyName(''); }}
                        className="rounded border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-700"
                    >
                        한 문제 더 제출
                    </button>
                    <a href="/interview/mypage" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">마이페이지</a>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold">기출 문제 제출</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    실제 면접에서 받은 질문을 공유하고 <span className="font-bold text-blue-600">100P</span>를 받으세요!
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="question" className="mb-1 block text-sm font-medium">
                        면접 질문 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="실제 면접에서 받은 질문을 입력하세요..."
                        rows={4}
                        required
                        className="w-full rounded-lg border px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="difficulty" className="mb-1 block text-sm font-medium">난이도</label>
                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {DIFFICULTIES.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="company" className="mb-1 block text-sm font-medium">기업명 (선택)</label>
                        <input
                            id="company"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="예: 네이버, 카카오"
                            className="w-full rounded-lg border px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="anonymous"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                    />
                    <label htmlFor="anonymous" className="text-sm text-neutral-600 dark:text-neutral-400">
                        익명으로 제출 (체크 해제 시 닉네임 공개)
                    </label>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400" data-testid="submit-error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || !question.trim()}
                    className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? '제출 중...' : '기출 문제 제출하기'}
                </button>
            </form>
        </div>
    );
}
