import { useState, useCallback, useEffect, useRef } from 'react';
import { QuestionCard } from './interview/QuestionCard';
import { AnswerInput } from './interview/AnswerInput';
import { AiFeedback } from './interview/AiFeedback';
import type { FeedbackData } from './interview/AiFeedback';
import { ChatMessage } from './interview/ChatMessage';
import { RelatedPosts } from './interview/RelatedPosts';
import { getRandomQuestion, matchRelatedPosts } from '../utils/questions';
import { buildEvaluationPrompt, streamEvaluation, streamFromServer, buildInterviewSystemPrompt } from '../utils/prompts';
import type { Provider } from '../utils/claude';
import type { EmbeddingsData } from '../utils/embeddings';
import type { QuestionEntry, PostEntry } from '../utils/questions';
import AuthGate from './interview/AuthGate';
import type { User } from '@supabase/supabase-js';
import ServerKeyBanner from './interview/ServerKeyBanner';
import InterviewerPicker from './interview/InterviewerPicker';
import SessionControls from './interview/SessionControls';
import { INITIAL_SESSION_STATE, SESSION_CONFIG } from '../config/interview-session';
import type { InterviewerId } from '../config/interviewers';

interface QuestionData extends QuestionEntry {
    data: QuestionEntry['data'] & {
        answer: string;
        hints: string[];
    };
    body: string;
}

interface Props {
    questions: QuestionData[];
    posts: PostEntry[];
    supabaseUrl?: string;
    supabaseAnonKey?: string;
}

interface Message {
    role: 'user' | 'interviewer';
    content: string;
    feedback?: FeedbackData;
    isFollowUp?: boolean;
    reaction?: string;
}

export default function InterviewWidget({ questions, posts, supabaseUrl, supabaseAnonKey }: Props) {
    if (!supabaseUrl || !supabaseAnonKey) {
        return <InterviewWidgetInner questions={questions} posts={posts} user={null} token={null} />;
    }
    return (
        <AuthGate supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey}>
            {(user, token) => (
                <InterviewWidgetInner questions={questions} posts={posts} user={user} token={token} />
            )}
        </AuthGate>
    );
}

interface InnerProps extends Props {
    user: User | null;
    token: string | null;
}

function InterviewWidgetInner({ questions, posts, user, token }: InnerProps) {
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState<Provider>('claude');
    const [current, setCurrent] = useState<QuestionData>(() => getRandomQuestion(questions));
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [streamText, setStreamText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [embeddings, setEmbeddings] = useState<EmbeddingsData | null>(null);

    // Multi-turn session state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [depth, setDepth] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [scores, setScores] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Interviewers
    const [interviewers, setInterviewers] = useState<InterviewerId[]>(['frontend', 'backend', 'dba']);

    // Points
    const [pointBalance, setPointBalance] = useState<number | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const phase = sessionId || messages.length > 0 ? 'chat' : 'initial';

    useEffect(() => {
        fetch('/blog-embeddings.json')
            .then((r) => r.json())
            .then(setEmbeddings)
            .catch(() => {});
    }, []);

    // Auto-scroll on new messages or streaming
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamText]);

    const handleRefresh = useCallback(() => {
        setCurrent(getRandomQuestion(questions, current.slug));
        setInputValue('');
        setMessages([]);
        setStreamText('');
        setSessionId(null);
        setDepth(0);
        setIsComplete(false);
        setScores([]);
        setError(null);
    }, [questions, current.slug]);

    const handleSubmit = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        // Check if user has API key or is logged in
        if (!apiKey && !user) {
            setError('로그인이 필요합니다.');
            return;
        }

        const answer = inputValue.trim();
        setInputValue('');
        setIsLoading(true);
        setError(null);

        // Add user message
        const userMsg: Message = { role: 'user', content: answer };
        setMessages((prev) => [...prev, userMsg]);
        setStreamText('');

        try {
            // Step 1: Create session if first answer and logged in
            if (user && token && depth === 0 && !sessionId) {
                const createRes = await fetch('/.netlify/functions/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: 'create',
                        data: { initial_question: current.data.title },
                    }),
                });
                if (createRes.ok) {
                    const createData = await createRes.json();
                    setSessionId(createData.session_id);
                }
            }

            // Step 2: RAG search (if logged in)
            let ragChunks: { slug: string; title: string; chunk_text: string; source: string }[] = [];
            if (user && token) {
                try {
                    const ragRes = await fetch('/.netlify/functions/rag-search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ text: answer, top_k: 5 }),
                    });
                    if (ragRes.ok) {
                        const ragData = await ragRes.json();
                        ragChunks = ragData.chunks ?? [];
                    }
                } catch {
                    // Graceful degradation: continue without RAG
                }
            }

            // Step 3: Build prompt
            let fullText = '';
            if (depth === 0 && !user) {
                // Single-turn BYOK mode (backwards compatible)
                const related = matchRelatedPosts(current, posts);
                let blogContext: { title: string; chunk: string }[] = [];

                if (embeddings) {
                    for (const post of related) {
                        const postChunks = embeddings.chunks.filter((c) => c.slug === post.slug);
                        for (const chunk of postChunks) {
                            blogContext.push({ title: chunk.title, chunk: chunk.chunk });
                        }
                    }
                } else {
                    blogContext = related.map((p) => ({
                        title: p.data.title,
                        chunk: `블로그 포스트: ${p.data.title}`,
                    }));
                }

                const prompt = buildEvaluationPrompt({
                    question: current.data.title,
                    modelAnswer: current.data.answer,
                    userAnswer: answer,
                    difficulty: current.data.difficulty,
                    blogContext,
                });

                for await (const chunk of streamEvaluation(apiKey, prompt, provider)) {
                    fullText += chunk;
                    setStreamText(fullText);
                }

                // Parse single-turn feedback
                const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) ?? fullText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed: FeedbackData = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
                    const interviewerMsg: Message = {
                        role: 'interviewer',
                        content: parsed.summary || '평가가 완료되었습니다.',
                        feedback: parsed,
                    };
                    setMessages((prev) => [...prev, interviewerMsg]);
                } else {
                    const interviewerMsg: Message = {
                        role: 'interviewer',
                        content: fullText,
                    };
                    setMessages((prev) => [...prev, interviewerMsg]);
                }
            } else {
                // Multi-turn mode
                const historyMessages = messages.map((m) => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content,
                }));

                const systemPrompt = buildInterviewSystemPrompt({
                    question: current.data.title,
                    userAnswer: answer,
                    chunks: ragChunks,
                    history: historyMessages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content, timestamp: Date.now() })),
                    depth,
                    interviewers,
                });

                if (apiKey) {
                    for await (const chunk of streamEvaluation(apiKey, systemPrompt, provider)) {
                        fullText += chunk;
                        setStreamText(fullText);
                    }
                } else if (token) {
                    for await (const chunk of streamFromServer(token, systemPrompt, [...historyMessages, { role: 'user', content: answer }])) {
                        fullText += chunk;
                        setStreamText(fullText);
                    }
                }

                // Parse multi-turn response
                const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) ?? fullText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
                    const { evaluations, followUp, shouldContinue, overallScore } = parsed;

                    if (shouldContinue && followUp) {
                        // Continue interview with follow-up question
                        const interviewerMsg: Message = {
                            role: 'interviewer',
                            content: `${followUp.reaction ? followUp.reaction + '\n\n' : ''}${followUp.question}`,
                            isFollowUp: true,
                            reaction: followUp.reaction,
                        };
                        setMessages((prev) => [...prev, interviewerMsg]);
                        setCurrent((prev) => ({
                            ...prev,
                            data: {
                                ...prev.data,
                                title: followUp.question,
                            },
                        }));
                        setDepth((d) => d + 1);
                        setScores((prev) => [...prev, overallScore ?? 0]);
                    } else {
                        // End interview
                        const interviewerMsg: Message = {
                            role: 'interviewer',
                            content: parsed.summary || '면접이 종료되었습니다.',
                        };
                        setMessages((prev) => [...prev, interviewerMsg]);
                        setIsComplete(true);
                        setScores((prev) => [...prev, overallScore ?? 0]);

                        // Save completion
                        if (sessionId && token) {
                            await fetch('/.netlify/functions/session', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    action: 'complete',
                                    session_id: sessionId,
                                    data: {
                                        total_score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : overallScore ?? 0,
                                    },
                                }),
                            });
                        }
                    }
                } else {
                    const interviewerMsg: Message = {
                        role: 'interviewer',
                        content: fullText,
                    };
                    setMessages((prev) => [...prev, interviewerMsg]);
                }
            }

            // Step 4: Save messages to session (if session exists)
            if (sessionId && token) {
                await fetch('/.netlify/functions/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: 'message',
                        session_id: sessionId,
                        data: { role: 'user', content: answer },
                    }),
                });
                await fetch('/.netlify/functions/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: 'message',
                        session_id: sessionId,
                        data: { role: 'assistant', content: fullText },
                    }),
                });
            }
        } catch (err) {
            const errorMsg: Message = {
                role: 'interviewer',
                content: `오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
            };
            setMessages((prev) => [...prev, errorMsg]);
            setError(err instanceof Error ? err.message : '알 수 없는 오류');
        } finally {
            setStreamText('');
            setIsLoading(false);
        }
    }, [apiKey, provider, inputValue, isLoading, current, posts, embeddings, user, token, sessionId, depth, messages, interviewers, scores]);

    const handleEndInterview = useCallback(async () => {
        if (sessionId && token) {
            await fetch('/.netlify/functions/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'complete',
                    session_id: sessionId,
                    data: { total_score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0 },
                }),
            });
        }
        setIsComplete(true);
    }, [sessionId, token, scores]);

    const relatedPosts = messages.some((m) => m.feedback) ? matchRelatedPosts(current, posts) : [];

    return (
        <div className="flex w-full flex-1 flex-col items-center">
            {/* Top spacer - pushes content so input bar sits at vertical center */}
            {phase === 'initial' && <div className="flex-1" />}

            {/* Question header */}
            <div
                className={`w-full transition-all duration-500 ease-out ${
                    phase === 'initial' ? 'mb-8' : 'pb-4'
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <QuestionCard
                            title={current.data.title}
                            hints={current.data.hints ?? []}
                            onRefresh={handleRefresh}
                            compact={phase === 'chat'}
                        />
                    </div>
                    {phase === 'chat' && (
                        <SessionControls
                            depth={depth}
                            maxDepth={SESSION_CONFIG.maxDepth}
                            sessionId={sessionId}
                            isComplete={isComplete}
                            onEndInterview={handleEndInterview}
                        />
                    )}
                </div>
            </div>

            {/* Chat area - expands when messages exist */}
            <div
                className={`w-full overflow-hidden transition-all duration-500 ease-out ${
                    phase === 'chat' ? 'max-h-[60dvh] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="mb-1 border-t border-neutral-200 dark:border-neutral-700" />
                <div
                    ref={chatContainerRef}
                    className="max-h-[55dvh] space-y-1 overflow-y-auto py-4"
                    role="log"
                    aria-label="면접 대화"
                >
                    {messages.map((msg, i) => (
                        <ChatMessage key={i} role={msg.role}>
                            {msg.role === 'user' ? (
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            ) : msg.feedback ? (
                                <AiFeedback feedback={msg.feedback} isLoading={false} />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            )}
                        </ChatMessage>
                    ))}
                    {isLoading && streamText && (
                        <ChatMessage role="interviewer">
                            <p className="whitespace-pre-wrap text-sm text-neutral-500">{streamText}</p>
                        </ChatMessage>
                    )}
                    {isLoading && !streamText && (
                        <ChatMessage role="interviewer">
                            <AiFeedback feedback={null} isLoading={true} />
                        </ChatMessage>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Related posts - shown after feedback */}
            {relatedPosts.length > 0 && (
                <div className="w-full pb-2">
                    <RelatedPosts
                        posts={relatedPosts.map((p) => ({ slug: p.slug, title: p.data.title }))}
                    />
                </div>
            )}

            {/* Input bar - always visible */}
            <div className="w-full">
                <AnswerInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    hasApiKey={!!apiKey}
                    placeholder={phase === 'initial' ? '답변을 입력하세요...' : '추가 답변을 입력하세요...'}
                />
            </div>

            {/* Status bar - below input, aligned with input padding */}
            <div className="w-full px-4 pt-1.5">
                {error && (
                    <p className="mb-1 text-xs text-red-500 dark:text-red-400">{error}</p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {phase === 'initial' && (
                            <InterviewerPicker selected={interviewers} onChange={setInterviewers} compact />
                        )}
                    </div>
                    <ServerKeyBanner
                        apiKey={apiKey}
                        onApiKeyChange={setApiKey}
                        isLoggedIn={!!user}
                        onLoginClick={() => {}}
                        pointBalance={pointBalance}
                    />
                </div>
            </div>

            {/* Bottom spacer - balances top spacer so input bar sits at ~center */}
            {phase === 'initial' && <div className="flex-[1.3]" />}
        </div>
    );
}
