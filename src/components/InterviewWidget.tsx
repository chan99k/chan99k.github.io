import { useState, useCallback, useEffect, useRef } from 'react';
import { QuestionCard } from './interview/QuestionCard';
import { AnswerInput } from './interview/AnswerInput';
import { AiFeedback } from './interview/AiFeedback';
import type { FeedbackData } from './interview/AiFeedback';
import { ChatMessage } from './interview/ChatMessage';
import { RelatedPosts } from './interview/RelatedPosts';
import { getRandomQuestion, matchRelatedPosts } from '../utils/questions';
import { buildInterviewSystemPrompt } from '../utils/prompts';
import type { Provider } from '../utils/claude';
import type { QuestionEntry, PostEntry } from '../utils/questions';
import AuthGate from './interview/AuthGate';
import type { User } from '@supabase/supabase-js';
import ServerKeyBanner from './interview/ServerKeyBanner';
import InterviewerPicker from './interview/InterviewerPicker';
import SessionControls from './interview/SessionControls';
import { SESSION_CONFIG } from '../config/interview-session';
import type { InterviewerId } from '../config/interviewers';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useInterviewChat } from '../hooks/useInterviewChat';
import { useRAGSearch } from '../hooks/useRAGSearch';
import { usePoints } from '../hooks/usePoints';

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

    // Interviewers
    const [interviewers, setInterviewers] = useState<InterviewerId[]>(['frontend', 'backend', 'dba']);

    // Custom hooks
    const session = useInterviewSession({ token });
    const chat = useInterviewChat({ token, apiKey, provider });
    const rag = useRAGSearch({ token });
    const points = usePoints({ token, isLoggedIn: !!user });

    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const phase = session.sessionId || messages.length > 0 ? 'chat' : 'initial';

    // Auto-scroll on new messages or streaming
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chat.displayText]);

    const handleRefresh = useCallback(() => {
        setCurrent(getRandomQuestion(questions, current.slug));
        setInputValue('');
        setMessages([]);
        session.reset();
        rag.reset();
        chat.clearError();
    }, [questions, current.slug, session, rag, chat]);

    const handleSubmit = useCallback(async () => {
        if (!inputValue.trim() || chat.isLoading) return;

        const answer = inputValue.trim();
        setInputValue('');

        // Add user message
        setMessages((prev) => [...prev, { role: 'user', content: answer }]);

        try {
            // Step 1: Create session if first answer and logged in
            let currentSessionId = session.sessionId;
            if (user && token && session.depth === 0 && !currentSessionId) {
                currentSessionId = await session.createSession(current.data.title);
            }

            // Step 2: RAG search (if logged in)
            let ragChunks = rag.chunks;
            if (user && token) {
                ragChunks = await rag.search(answer);
            }

            // Step 3: Build prompt and stream
            const historyMessages = messages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            }));

            const systemPrompt = buildInterviewSystemPrompt({
                question: current.data.title,
                userAnswer: answer,
                chunks: ragChunks,
                history: historyMessages.map((m) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content,
                    timestamp: Date.now(),
                })),
                depth: session.depth,
                interviewers,
                referenceAnswer: current.data.answer,
                referenceExplanation: current.body,
            });

            const { rawText, parsed } = await chat.sendAnswer(systemPrompt, historyMessages, answer);

            // Step 4: Process parsed response
            if (parsed) {
                const { followUp, shouldContinue, overallScore } = parsed;

                if (shouldContinue && followUp) {
                    setMessages((prev) => [...prev, {
                        role: 'interviewer',
                        content: `${followUp.reaction ? followUp.reaction + '\n\n' : ''}${followUp.question}`,
                        isFollowUp: true,
                        reaction: followUp.reaction,
                    }]);
                    setCurrent((prev) => ({
                        ...prev,
                        data: { ...prev.data, title: followUp.question },
                    }));
                    session.advanceDepth();
                    session.addScore(overallScore ?? 0);
                } else {
                    setMessages((prev) => [...prev, {
                        role: 'interviewer',
                        content: parsed.summary || '면접이 종료되었습니다.',
                    }]);
                    session.addScore(overallScore ?? 0);

                    if (currentSessionId) {
                        const avgScore = session.scores.length > 0
                            ? session.getAverageScore()
                            : overallScore ?? 0;
                        await session.completeSession(currentSessionId, avgScore);
                    } else {
                        session.setIsComplete(true);
                    }
                }
            } else {
                setMessages((prev) => [...prev, { role: 'interviewer', content: rawText }]);
            }

            // Step 5: Save messages to session
            if (currentSessionId) {
                await session.saveMessage(currentSessionId, 'user', answer);
                await session.saveMessage(currentSessionId, 'assistant', rawText);
            }

            // Refresh point balance after interview turn
            points.refetch();
        } catch (err) {
            setMessages((prev) => [...prev, {
                role: 'interviewer',
                content: `오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
            }]);
        }
    }, [inputValue, chat, user, token, session, rag, current, messages, interviewers, points]);

    const handleEndInterview = useCallback(async () => {
        const avgScore = session.getAverageScore();
        if (session.sessionId) {
            await session.completeSession(session.sessionId, avgScore);
        } else {
            session.setIsComplete(true);
        }
    }, [session]);

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
                            depth={session.depth}
                            maxDepth={SESSION_CONFIG.maxDepth}
                            sessionId={session.sessionId}
                            isComplete={session.isComplete}
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
                    {chat.isLoading && chat.displayText && (
                        <ChatMessage role="interviewer">
                            <p className="whitespace-pre-wrap text-sm text-neutral-500">{chat.displayText}</p>
                        </ChatMessage>
                    )}
                    {chat.isLoading && !chat.displayText && (
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
                    isLoading={chat.isLoading}
                    hasApiKey={!!apiKey}
                    placeholder={phase === 'initial' ? '답변을 입력하세요...' : '추가 답변을 입력하세요...'}
                />
            </div>

            {/* Status bar - below input, aligned with input padding */}
            <div className="w-full px-4 pt-1.5">
                {chat.error && (
                    <p className="mb-1 text-xs text-red-500 dark:text-red-400">{chat.error}</p>
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
                        pointBalance={points.balance}
                    />
                </div>
            </div>

            {/* Bottom spacer - balances top spacer so input bar sits at ~center */}
            {phase === 'initial' && <div className="flex-[1.3]" />}
        </div>
    );
}
