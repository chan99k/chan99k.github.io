import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { INITIAL_SESSION_STATE, SESSION_CONFIG } from '../config/interview-session';
import type { SessionState, ChatMessage } from '../config/interview-session';
import { buildInterviewSystemPrompt } from '../utils/interview-prompt';
import type { User } from '@supabase/supabase-js';
import type { InterviewerId } from '../config/interviewers';

interface Props {
    initialQuestion: string;
    interviewers?: InterviewerId[];
}

// Reuse claude-proxy streaming pattern from src/utils/claude.ts
async function* streamFromProxy(
    apiKey: string,
    system: string,
    messages: { role: string; content: string }[],
): AsyncGenerator<string> {
    const response = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-claude-api-key': apiKey,
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            stream: true,
            system,
            messages,
        }),
    });

    if (!response.ok) {
        const msg = response.status === 401 ? 'API 키가 유효하지 않습니다'
            : response.status === 429 ? '요청 한도를 초과했습니다'
            : response.status === 403 ? '접근이 거부되었습니다'
            : 'API 요청에 실패했습니다';
        throw new Error(msg);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta') {
                    const text = parsed.delta?.text;
                    if (text) yield text;
                }
            } catch {
                // skip non-JSON lines
            }
        }
    }
}

async function* streamFromServer(
    token: string,
    system: string,
    messages: { role: string; content: string }[],
): AsyncGenerator<string> {
    const response = await fetch('/.netlify/functions/interview-server', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ system, messages }),
    });

    if (!response.ok) {
        if (response.status === 429) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || '일일 사용 한도를 초과했습니다');
        }
        throw new Error('서버 API 요청에 실패했습니다');
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta') {
                    const text = parsed.delta?.text;
                    if (text) yield text;
                }
            } catch { /* skip */ }
        }
    }
}

export default function InterviewChat({ initialQuestion, interviewers }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [session, setSession] = useState<SessionState>({ ...INITIAL_SESSION_STATE, currentQuestion: initialQuestion });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamText, setStreamText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true); // Start true to auto-scroll initially

    // JD context state
    const [showJdInput, setShowJdInput] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [jdText, setJdText] = useState('');

    const sessionRef = useRef(session);
    useEffect(() => { sessionRef.current = session; }, [session]);

    // Auth state
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setUser(s?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Check if user is near bottom of chat
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        isNearBottomRef.current = distanceFromBottom < 100;
    }, []);

    // Smart auto-scroll: only scroll if user is near bottom
    useEffect(() => {
        if (isNearBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [session.messages, streamText]);

    const handleLogin = async (provider: 'google' | 'github') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin + '/interview/chat' },
        });
    };

    const handleSubmitAnswer = useCallback(async () => {
        if (!input.trim() || isLoading || !user) return;

        setIsLoading(true);
        const answer = input.trim();
        setInput('');

        // Force scroll to bottom when user sends a message
        isNearBottomRef.current = true;
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);

        const userMsg: ChatMessage = {
            role: 'user',
            content: answer,
            messageType: 'answer',
            timestamp: Date.now(),
        };

        const updatedMessages = [...sessionRef.current.messages, userMsg];
        setSession((s) => ({ ...s, messages: updatedMessages, status: 'searching' }));

        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;

            // 1. Create session if first answer
            let sessionId = sessionRef.current.sessionId;
            if (!sessionId) {
                const res = await fetch('/.netlify/functions/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ action: 'create', data: { initial_question: session.currentQuestion } }),
                });
                const data = await res.json();
                sessionId = data.session_id;
                setSession((s) => ({ ...s, sessionId: sessionId! }));
            }

            // 2. Server-side embedding + RAG search (graceful degradation if server fails)
            let chunks: { slug: string; title: string; chunk_text: string; source: string }[] = [];
            try {
                const searchRes = await fetch('/.netlify/functions/rag-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ text: answer, top_k: SESSION_CONFIG.searchTopK }),
                });
                if (searchRes.ok) {
                    const data = await searchRes.json();
                    chunks = data.chunks ?? [];
                } else {
                    console.warn('RAG search failed:', searchRes.status, searchRes.statusText);
                }
            } catch (err) {
                // Network or server error — skip RAG, continue with LLM only
                console.warn('RAG search error:', err);
            }

            setSession((s) => ({ ...s, status: 'evaluating' }));

            // 3. Build prompt and stream LLM
            const newDepth = sessionRef.current.depth + 1;
            const jdContext = companyName.trim() || jdText.trim()
                ? { company: companyName.trim(), jd: jdText.trim() }
                : undefined;
            const systemPrompt = buildInterviewSystemPrompt({
                question: sessionRef.current.currentQuestion,
                userAnswer: answer,
                chunks,
                history: updatedMessages,
                depth: newDepth,
                interviewers,
                jdContext,
            });

            // Keep only recent messages to avoid exceeding input token limit
            const recentMessages = updatedMessages.slice(-8);
            const llmMessages = recentMessages.map((m) => ({ role: m.role, content: m.content }));

            let fullText = '';
            if (apiKey) {
                for await (const chunk of streamFromProxy(apiKey, systemPrompt, llmMessages)) {
                    fullText += chunk;
                    setStreamText(fullText);
                }
            } else {
                for await (const chunk of streamFromServer(token!, systemPrompt, llmMessages)) {
                    fullText += chunk;
                    setStreamText(fullText);
                }
            }

            // 4. Parse AI response
            // Parse JSON from LLM response — prefer ```json block, fallback to last { in text
            const codeBlockMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/);
            let jsonText: string | undefined = codeBlockMatch?.[1];

            if (!jsonText) {
                const lastBrace = fullText.lastIndexOf('{');
                if (lastBrace !== -1) {
                    jsonText = fullText.slice(lastBrace);
                }
            }

            let aiResponse: {
                evaluations: unknown[];
                followUp?: { interviewer: string; reaction?: string; question: string };
                shouldContinue: boolean;
                overallScore: number;
                summary: string;
            } | null = null;

            if (jsonText) {
                try {
                    aiResponse = JSON.parse(jsonText);
                } catch (e) {
                    console.warn('[Interview] JSON parse failed:', e, 'raw:', jsonText.slice(0, 200));
                }
            }

            // Build visible message: reaction + follow-up question (hide evaluation during interview)
            let visibleContent = fullText;
            if (aiResponse) {
                if (aiResponse.shouldContinue && aiResponse.followUp) {
                    const reaction = aiResponse.followUp.reaction ? `${aiResponse.followUp.reaction}\n\n` : '';
                    visibleContent = `${reaction}${aiResponse.followUp.question}`;
                } else {
                    visibleContent = aiResponse.summary;
                }
            }

            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: visibleContent,
                interviewer: aiResponse?.followUp?.interviewer,
                messageType: aiResponse?.shouldContinue ? 'evaluation' : 'feedback',
                timestamp: Date.now(),
            };

            const newMessages = [...updatedMessages, assistantMsg];
            const newScores = [...session.scores, aiResponse?.overallScore ?? 0];

            // 5. Save to session API
            await fetch('/.netlify/functions/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'message',
                    session_id: sessionId,
                    data: { depth: newDepth, role: 'user', content: answer, message_type: 'answer', ordering: updatedMessages.length },
                }),
            });
            await fetch('/.netlify/functions/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'message',
                    session_id: sessionId,
                    data: {
                        depth: newDepth,
                        role: 'assistant',
                        content: fullText,
                        message_type: aiResponse?.shouldContinue ? 'evaluation' : 'feedback',
                        interviewer: aiResponse?.followUp?.interviewer,
                        score: aiResponse?.evaluations,
                        ordering: newMessages.length,
                    },
                }),
            });

            // 6. Update state
            if (aiResponse?.shouldContinue && aiResponse.followUp?.question && newDepth < SESSION_CONFIG.maxDepth) {
                setSession((s) => ({
                    ...s,
                    messages: newMessages,
                    depth: newDepth,
                    status: 'question_displayed',
                    currentQuestion: aiResponse!.followUp!.question,
                    scores: newScores,
                }));
            } else {
                if (aiResponse?.shouldContinue && !aiResponse.followUp?.question) {
                    console.warn('[Interview] shouldContinue=true but followUp missing, ending session');
                }
                await fetch('/.netlify/functions/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        action: 'complete',
                        session_id: sessionId,
                        data: { total_score: Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length), feedback: aiResponse },
                    }),
                });
                setSession((s) => ({ ...s, messages: newMessages, depth: newDepth, status: 'completed', scores: newScores }));
            }

            setStreamText('');
        } catch (err) {
            setStreamText(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, user, apiKey, interviewers, companyName, jdText, session.currentQuestion, session.scores]);

    // --- Render ---

    if (!user) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-4 sm:p-6 dark:border-neutral-700">
                <h2 className="mb-4 text-lg font-bold sm:text-xl">AI 모의면접</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">현재 비공개로 운영 중입니다.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl rounded-xl border p-4 sm:p-6 dark:border-neutral-700">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold sm:text-xl">AI 모의면접</h2>
                <div className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
                    <span>진행도: {session.depth}/{SESSION_CONFIG.maxDepth}</span>
                </div>
            </div>

            {/* API Key input */}
            {!apiKey && !showApiKeyInput && (
                <div className="mb-4 rounded bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs text-blue-800 sm:text-sm dark:text-blue-200">서버 키 모드 (일일 3회 제한)</p>
                    <button
                        onClick={() => setShowApiKeyInput(true)}
                        className="mt-2 text-xs text-blue-600 underline hover:text-blue-800 sm:text-sm dark:text-blue-300 dark:hover:text-blue-100"
                        aria-label="자체 Claude API 키를 사용하려면 클릭하세요"
                    >
                        자체 API 키 사용하기
                    </button>
                </div>
            )}
            {!apiKey && showApiKeyInput && (
                <div className="mb-4 rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
                    <label htmlFor="api-key-input" className="block text-xs font-medium sm:text-sm">Claude API Key (BYOK)</label>
                    <input
                        id="api-key-input"
                        type="password"
                        placeholder="sk-ant-api..."
                        className="mt-1 w-full rounded border px-3 py-2 text-xs sm:text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        onBlur={(e) => setApiKey(e.target.value)}
                        aria-label="Claude API 키를 입력하세요"
                    />
                    <button
                        onClick={() => setShowApiKeyInput(false)}
                        className="mt-2 text-xs text-neutral-600 underline hover:text-neutral-800 sm:text-sm dark:text-neutral-400 dark:hover:text-neutral-200"
                        aria-label="서버 키 모드로 돌아가기"
                    >
                        서버 키 모드로 돌아가기
                    </button>
                </div>
            )}

            {/* JD 입력 (선택사항) - 면접 시작 전에만 표시 */}
            {session.messages.length === 0 && (
                <div className="mb-4 rounded-lg border border-dashed border-neutral-300 p-3 sm:p-4 dark:border-neutral-600">
                    <button
                        onClick={() => setShowJdInput(!showJdInput)}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-800 sm:text-sm dark:text-neutral-400 dark:hover:text-neutral-200"
                        aria-expanded={showJdInput}
                        aria-controls="jd-input-section"
                        aria-label={showJdInput ? '기업 맥락 섹션 접기' : '기업 맥락 섹션 펼치기'}
                    >
                        {showJdInput ? '▼ 기업 맥락 접기' : '▶ 기업/채용공고 설정 (선택사항)'}
                    </button>
                    {showJdInput && (
                        <div id="jd-input-section" className="mt-3 space-y-2">
                            <label htmlFor="company-name" className="sr-only">기업명</label>
                            <input
                                id="company-name"
                                type="text"
                                placeholder="기업명 (예: 네이버, 카카오)"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full rounded border px-3 py-2 text-xs sm:text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                aria-label="지원하는 기업명을 입력하세요"
                            />
                            <label htmlFor="jd-text" className="sr-only">채용공고 내용</label>
                            <textarea
                                id="jd-text"
                                placeholder="채용공고 또는 JD 텍스트 (붙여넣기)"
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                rows={4}
                                className="w-full rounded border px-3 py-2 text-xs sm:text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                aria-label="채용공고 또는 직무 설명을 입력하세요"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Current question */}
            <div className="mb-4 rounded-lg bg-blue-50 p-3 sm:p-4 dark:bg-blue-900/20" role="status" aria-live="polite">
                <p className="text-xs font-medium text-blue-800 sm:text-sm dark:text-blue-200">
                    {session.status === 'completed' ? '면접이 종료되었습니다.' : initialQuestion}
                </p>
            </div>

            {/* Chat messages */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="mb-4 max-h-64 space-y-2 overflow-y-auto sm:max-h-96 sm:space-y-3"
                role="log"
                aria-label="면접 대화 내역"
                aria-live="polite"
            >
                {session.messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`rounded p-2 text-xs sm:p-3 sm:text-sm ${msg.role === 'user' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-green-50 dark:bg-green-900/20'}`}
                        role={msg.role === 'user' ? 'article' : 'article'}
                        aria-label={msg.role === 'user' ? '내 답변' : '면접관 피드백'}
                    >
                        <span className="text-xs font-medium text-neutral-500">
                            {msg.role === 'user' ? '나' : msg.interviewer ? `${msg.interviewer} 면접관` : 'AI'}
                        </span>
                        <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                ))}
                {streamText && (
                    <div className="rounded bg-green-50 p-2 text-xs sm:p-3 sm:text-sm dark:bg-green-900/20" role="status" aria-live="polite">
                        <span className="text-xs font-medium text-neutral-500">AI (응답 중...)</span>
                        <p className="mt-1 whitespace-pre-wrap text-neutral-500">면접관이 답변을 검토하고 있습니다...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {session.status !== 'completed' && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <label htmlFor="answer-input" className="sr-only">면접 답변 입력</label>
                    <textarea
                        id="answer-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="답변을 입력하세요..."
                        rows={3}
                        className="flex-1 rounded border px-3 py-2 text-xs sm:text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        onKeyDown={(e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); handleSubmitAnswer(); } }}
                        aria-label="면접 질문에 대한 답변을 입력하세요. Shift+Enter로 제출할 수 있습니다"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={isLoading || !input.trim()}
                        className="rounded bg-blue-600 px-4 py-2 text-xs text-white hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
                        aria-label="답변 제출하기"
                    >
                        {isLoading ? '제출 중...' : '제출 (⇧Enter)'}
                    </button>
                </div>
            )}

            {session.status === 'completed' && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    {session.sessionId && (
                        <a
                            href={`/interview/result/${session.sessionId}`}
                            className="flex-1 rounded bg-blue-600 py-2 text-center text-xs text-white hover:bg-blue-700 sm:text-sm"
                            aria-label="면접 결과 페이지로 이동"
                        >
                            결과 보기
                        </a>
                    )}
                    <button
                        onClick={() => setSession({ ...INITIAL_SESSION_STATE, currentQuestion: initialQuestion })}
                        className="flex-1 rounded bg-neutral-200 py-2 text-xs dark:bg-neutral-700 sm:text-sm"
                        aria-label="새로운 면접 시작하기"
                    >
                        새 면접 시작
                    </button>
                </div>
            )}
        </div>
    );
}
