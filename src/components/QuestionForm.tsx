import { useState } from 'react';
import { supabase } from '../utils/supabase';

const CATEGORIES = ['general', 'java', 'spring', 'database', 'network', 'os', 'design-pattern', 'architecture'];

interface Props {
    editId?: string;
    initialData?: Record<string, unknown>;
}

export default function QuestionForm({ editId, initialData }: Props) {
    const [title, setTitle] = useState((initialData?.title as string) ?? '');
    const [answer, setAnswer] = useState((initialData?.answer as string) ?? '');
    const [explanation, setExplanation] = useState((initialData?.explanation as string) ?? '');
    const [category, setCategory] = useState((initialData?.category as string) ?? 'general');
    const [difficulty, setDifficulty] = useState((initialData?.difficulty as number) ?? 3);
    const [tags, setTags] = useState((initialData?.tags as string[])?.join(', ') ?? '');
    const [hints, setHints] = useState((initialData?.hints as string[])?.join(', ') ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) { setMessage('로그인 필요'); setIsSaving(false); return; }

        const data = {
            title, question: title, answer, explanation, category, difficulty,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            hints: hints.split(',').map(h => h.trim()).filter(Boolean),
        };

        const res = await fetch('/.netlify/functions/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(editId ? { action: 'update', id: editId, data } : { action: 'create', data }),
        });

        if (res.ok) {
            setMessage(editId ? '수정 완료' : '생성 완료');
            if (!editId) window.location.href = '/interview/questions';
        } else {
            const err = await res.json();
            setMessage(`오류: ${err.error}`);
        }
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">질문 *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">카테고리</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">난이도</label>
                    <div className="mt-1 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setDifficulty(star)}
                                className={`text-xl transition-colors ${star <= difficulty ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'} hover:text-amber-300`}
                                aria-label={`난이도 ${star}점`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">모범 답안</label>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <div>
                <label className="block text-sm font-medium">해설</label>
                <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={4}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <div>
                <label className="block text-sm font-medium">태그 (쉼표 구분)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Collections, 동기화, Thread-safe"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <div>
                <label className="block text-sm font-medium">힌트 (쉼표 구분)</label>
                <input type="text" value={hints} onChange={e => setHints(e.target.value)} placeholder="동기화, null 허용"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            {message && <p className="text-sm text-blue-600">{message}</p>}
            <button type="submit" disabled={isSaving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {isSaving ? '저장 중...' : editId ? '수정' : '생성'}
            </button>
        </form>
    );
}
