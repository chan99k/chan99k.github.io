import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Question {
    id: string;
    title: string;
    question: string;
    answer: string;
    explanation: string;
    category: string;
    difficulty: string;
    tags: string[];
    hints: string[];
    related_posts: string[];
}

export default function QuestionDetail({ questionId }: { questionId: string }) {
    const [question, setQuestion] = useState<Question | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        (async () => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) return;
            const res = await fetch('/.netlify/functions/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'get', id: questionId }),
            });
            if (res.ok) {
                const data = await res.json();
                setQuestion(data.question);
            }
        })();
    }, [questionId]);

    if (!question) return <p className="text-neutral-500">로딩 중...</p>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{question.title}</h1>
                <div className="mt-2 flex gap-2 text-sm">
                    <span className="rounded bg-blue-100 px-2 py-0.5 dark:bg-blue-900/30">{question.category}</span>
                    <span className="rounded bg-green-100 px-2 py-0.5 dark:bg-green-900/30">{question.difficulty}</span>
                </div>
            </div>

            {question.hints.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-neutral-500">힌트</h3>
                    <div className="mt-1 flex flex-wrap gap-1">{question.hints.map(h => <span key={h} className="rounded bg-yellow-100 px-2 py-0.5 text-xs dark:bg-yellow-900/30">{h}</span>)}</div>
                </div>
            )}

            <div>
                <button onClick={() => setShowAnswer(!showAnswer)} className="text-sm text-blue-600 hover:underline">
                    {showAnswer ? '답변 숨기기' : '모범 답안 보기'}
                </button>
                {showAnswer && (
                    <div className="mt-2 rounded bg-neutral-50 p-4 dark:bg-neutral-800">
                        <p className="whitespace-pre-wrap text-sm">{question.answer}</p>
                        {question.explanation && <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">{question.explanation}</p>}
                    </div>
                )}
            </div>

            <a href={`/interview/chat?q=${encodeURIComponent(question.title)}`}
                className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                이 질문으로 면접 시작
            </a>
        </div>
    );
}
