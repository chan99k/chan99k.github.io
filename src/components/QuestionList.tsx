import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

interface Question {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    tags: string[];
    source: string;
    created_at: string;
}

const CATEGORIES = ['general', 'java', 'spring', 'database', 'network', 'os', 'design-pattern', 'architecture'];
const DIFFICULTIES = ['junior', 'mid', 'senior'];

export default function QuestionList() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) { setIsLoading(false); return; }

        const res = await fetch('/.netlify/functions/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: 'list', page, category: category || undefined, difficulty: difficulty || undefined, search: search || undefined }),
        });
        if (res.ok) {
            const data = await res.json();
            setQuestions(data.questions);
            setTotal(data.total);
        }
        setIsLoading(false);
    }, [page, category, difficulty, search]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const totalPages = Math.ceil(total / 20);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">면접 질문 은행</h1>
                <a href="/interview/questions/new" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">질문 추가</a>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-2">
                <input
                    type="text" placeholder="검색..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="rounded border px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                />
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="rounded border px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <option value="">전체 카테고리</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
                    className="rounded border px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <option value="">전체 난이도</option>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Question list */}
            {isLoading ? <p className="text-neutral-500">로딩 중...</p> : (
                <div className="space-y-3">
                    {questions.map(q => (
                        <div key={q.id} className="flex items-center gap-2">
                            <a href={`/interview/questions/${q.id}`}
                                className="block flex-1 rounded-lg border p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50">
                                <h3 className="font-medium">{q.title}</h3>
                                <div className="mt-1 flex gap-2 text-xs text-neutral-500">
                                    <span className="rounded bg-blue-100 px-1.5 py-0.5 dark:bg-blue-900/30">{q.category}</span>
                                    <span className="rounded bg-green-100 px-1.5 py-0.5 dark:bg-green-900/30">{q.difficulty}</span>
                                    {q.tags.slice(0, 3).map(t => <span key={t} className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-700">{t}</span>)}
                                </div>
                            </a>
                            <a href={`/interview/chat?q=${encodeURIComponent(q.title)}`}
                                className="shrink-0 rounded-lg border border-blue-600 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="이 질문으로 면접 시작">
                                면접
                            </a>
                        </div>
                    ))}
                    {questions.length === 0 && <p className="text-neutral-500">질문이 없습니다.</p>}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                        className="rounded border px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700">이전</button>
                    <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                        className="rounded border px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700">다음</button>
                </div>
            )}
        </div>
    );
}
