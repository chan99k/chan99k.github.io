import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { INTERVIEWER_ROLES } from '../config/interviewers';
import type { User } from '@supabase/supabase-js';

interface SessionData {
    id: string;
    status: string;
    initial_question: string;
    total_score: number | null;
    feedback: FeedbackData | null;
    created_at: string;
    completed_at: string | null;
}

interface FeedbackData {
    totalScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    studyGuide?: { topic: string; reason: string; resources: string[] }[];
    overallFeedback?: string;
    interviewerComments?: Record<string, { critique: string; studyKeywords: string[] }>;
    // Inline feedback fields (from turn-by-turn evaluation)
    overallScore?: number;
    evaluations?: { interviewer: string; comment: string; score: Record<string, number> }[];
    summary?: string;
}

interface MessageData {
    id: string;
    depth: number;
    role: string;
    content: string;
    message_type: string;
    interviewer: string | null;
    score: unknown;
    created_at: string;
    ordering: number;
}

interface Props {
    sessionId: string;
}

function ScoreBar({ score, max, label }: { score: number; max: number; label: string }) {
    const pct = Math.round((score / max) * 100);
    const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-24 shrink-0 text-neutral-600 dark:text-neutral-400">{label}</span>
            <div className="h-2 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-12 text-right font-mono text-xs">{score}/{max}</span>
        </div>
    );
}

export default function InterviewResult({ sessionId }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<SessionData | null>(null);
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            if (u) fetchSession(u);
            else setLoading(false);
        });
    }, []);

    async function fetchSession(u: User) {
        try {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            const token = authSession?.access_token;
            if (!token) { setError('인증 토큰을 가져올 수 없습니다.'); return; }

            const res = await fetch('/.netlify/functions/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'get', session_id: sessionId }),
            });

            if (!res.ok) {
                setError(res.status === 404 ? '면접 기록을 찾을 수 없습니다.' : '데이터를 불러오지 못했습니다.');
                return;
            }

            const data = await res.json();
            setSession(data.session);
            setMessages(data.messages);
        } catch {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="mx-auto max-w-2xl p-4 text-center text-sm text-neutral-500 sm:p-6" role="status" aria-live="polite">불러오는 중...</div>;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-4 sm:p-6 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">로그인이 필요합니다.</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        aria-label="Google 계정으로 로그인"
                    >
                        Google 로그인
                    </button>
                    <button
                        onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
                        className="rounded bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-900"
                        aria-label="GitHub 계정으로 로그인"
                    >
                        GitHub 로그인
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-4 sm:p-6 dark:border-neutral-700" role="alert">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <a href="/interview/history" className="mt-4 inline-block text-sm text-blue-600 underline hover:text-blue-800">면접 히스토리로 돌아가기</a>
            </div>
        );
    }

    if (!session) return null;

    const feedback = session.feedback;
    const totalScore = feedback?.totalScore ?? session.total_score ?? 0;
    const isCompleted = session.status === 'completed';

    // Conversation messages (user answers + assistant questions)
    const conversationMessages = messages.filter(
        (m) => m.message_type === 'answer' || m.message_type === 'question' || m.message_type === 'evaluation' || m.message_type === 'feedback'
    );

    return (
        <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="rounded-xl border p-4 sm:p-6 dark:border-neutral-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                        <h2 className="text-lg font-bold sm:text-xl">면접 결과</h2>
                        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                            {new Date(session.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className={`text-2xl font-bold sm:text-3xl ${totalScore >= 70 ? 'text-green-600' : totalScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`} aria-label={`총점 ${totalScore}점`}>
                            {totalScore}
                        </div>
                        <div className="text-xs text-neutral-500">/ 100점</div>
                    </div>
                </div>
                <div className="mt-3 rounded-lg bg-blue-50 p-2 sm:p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-blue-800 sm:text-sm dark:text-blue-200">{session.initial_question}</p>
                </div>
                {!isCompleted && (
                    <p className="mt-2 text-xs text-yellow-600 sm:text-sm dark:text-yellow-400" role="status">이 면접은 아직 완료되지 않았습니다.</p>
                )}
            </div>

            {/* Overall Feedback */}
            {feedback?.overallFeedback && (
                <section className="rounded-xl border p-4 sm:p-6 dark:border-neutral-700" aria-labelledby="overall-feedback-heading">
                    <h3 id="overall-feedback-heading" className="mb-3 text-base font-bold sm:text-lg">종합 피드백</h3>
                    <p className="text-xs leading-relaxed text-neutral-700 sm:text-sm dark:text-neutral-300">{feedback.overallFeedback}</p>
                </section>
            )}

            {/* Strengths & Weaknesses */}
            {(feedback?.strengths || feedback?.weaknesses) && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {feedback.strengths && feedback.strengths.length > 0 && (
                        <section className="rounded-xl border p-3 sm:p-4 dark:border-neutral-700" aria-labelledby="strengths-heading">
                            <h3 id="strengths-heading" className="mb-2 text-xs font-bold text-green-700 sm:text-sm dark:text-green-400">강점</h3>
                            <ul className="space-y-1 text-xs text-neutral-700 sm:text-sm dark:text-neutral-300">
                                {feedback.strengths.map((s, i) => <li key={i}>- {s}</li>)}
                            </ul>
                        </section>
                    )}
                    {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                        <section className="rounded-xl border p-3 sm:p-4 dark:border-neutral-700" aria-labelledby="weaknesses-heading">
                            <h3 id="weaknesses-heading" className="mb-2 text-xs font-bold text-red-700 sm:text-sm dark:text-red-400">약점</h3>
                            <ul className="space-y-1 text-xs text-neutral-700 sm:text-sm dark:text-neutral-300">
                                {feedback.weaknesses.map((w, i) => <li key={i}>- {w}</li>)}
                            </ul>
                        </section>
                    )}
                </div>
            )}

            {/* Interviewer Comments */}
            {feedback?.interviewerComments && (
                <section className="rounded-xl border p-4 sm:p-6 dark:border-neutral-700" aria-labelledby="interviewer-feedback-heading">
                    <h3 id="interviewer-feedback-heading" className="mb-4 text-base font-bold sm:text-lg">면접관별 피드백</h3>
                    <div className="space-y-3 sm:space-y-4">
                        {Object.entries(feedback.interviewerComments).map(([id, comment]) => {
                            const role = INTERVIEWER_ROLES[id];
                            return (
                                <article key={id} className="rounded-lg border p-3 sm:p-4 dark:border-neutral-600">
                                    <div className="mb-2 text-xs font-medium sm:text-sm">{role?.name ?? id}</div>
                                    <p className="text-xs text-neutral-700 sm:text-sm dark:text-neutral-300">{comment.critique}</p>
                                    {comment.studyKeywords?.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1" role="list" aria-label="학습 키워드">
                                            {comment.studyKeywords.map((kw, i) => (
                                                <span key={i} className="rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-700" role="listitem">{kw}</span>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Study Guide */}
            {feedback?.studyGuide && feedback.studyGuide.length > 0 && (
                <section className="rounded-xl border p-4 sm:p-6 dark:border-neutral-700" aria-labelledby="study-guide-heading">
                    <h3 id="study-guide-heading" className="mb-4 text-base font-bold sm:text-lg">학습 가이드</h3>
                    <div className="space-y-2 sm:space-y-3">
                        {feedback.studyGuide.map((item, i) => (
                            <article key={i} className="rounded-lg bg-neutral-50 p-2 sm:p-3 dark:bg-neutral-800">
                                <div className="text-xs font-medium sm:text-sm">{item.topic}</div>
                                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{item.reason}</p>
                                {item.resources?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1" role="list" aria-label="학습 리소스">
                                        {item.resources.map((r, j) => (
                                            <span key={j} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" role="listitem">{r}</span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Conversation History */}
            <section className="rounded-xl border p-4 sm:p-6 dark:border-neutral-700" aria-labelledby="conversation-history-heading">
                <h3 id="conversation-history-heading" className="mb-4 text-base font-bold sm:text-lg">대화 히스토리</h3>
                <div className="space-y-2 sm:space-y-3" role="log" aria-label="면접 대화 기록">
                    {conversationMessages.map((msg, i) => (
                        <article
                            key={msg.id}
                            className={`rounded-lg p-2 text-xs sm:p-3 sm:text-sm ${msg.role === 'user' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-green-50 dark:bg-green-900/20'}`}
                            aria-label={msg.role === 'user' ? '내 답변' : '면접관 질문 또는 피드백'}
                        >
                            <span className="text-xs font-medium text-neutral-500">
                                {msg.role === 'user' ? '나' : msg.interviewer ? `${INTERVIEWER_ROLES[msg.interviewer]?.name ?? msg.interviewer}` : 'AI'}
                            </span>
                            <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 sm:flex-row sm:gap-3" aria-label="면접 결과 네비게이션">
                <a
                    href="/interview/history"
                    className="rounded border px-4 py-2 text-center text-xs hover:bg-neutral-50 sm:text-sm dark:border-neutral-700 dark:hover:bg-neutral-800"
                    aria-label="면접 히스토리 목록으로 이동"
                >
                    히스토리 목록
                </a>
                <a
                    href="/interview/chat"
                    className="rounded bg-blue-600 px-4 py-2 text-center text-xs text-white hover:bg-blue-700 sm:text-sm"
                    aria-label="새로운 면접 시작하기"
                >
                    새 면접 시작
                </a>
            </nav>
        </div>
    );
}
