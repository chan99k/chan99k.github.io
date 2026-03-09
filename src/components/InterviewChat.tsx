import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { getQueryEmbedding, type EmbeddingStatus } from '../utils/client-embeddings';
import { INITIAL_SESSION_STATE, SESSION_CONFIG } from '../config/interview-session';
import type { SessionState, ChatMessage } from '../config/interview-session';
import { buildInterviewSystemPrompt } from '../utils/interview-prompt';
import type { User } from '@supabase/supabase-js';

interface Props {
    initialQuestion: string;
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
            max_tokens: 2048,
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

export default function InterviewChat({ initialQuestion }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [session, setSession] = useState<SessionState>({ ...INITIAL_SESSION_STATE, currentQuestion: initialQuestion });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamText, setStreamText] = useState('');
    const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingStatus>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

        const userMsg: ChatMessage = {
            role: 'user',
            content: answer,
            messageType: 'answer',
            timestamp: Date.now(),
        };

        const updatedMessages = [...sessionRef.current.messages, userMsg];
        setSession((s) => ({ ...s, messages: updatedMessages, status: 'searching' }));

        try {
            // 1. Create session if first answer
            let sessionId = sessionRef.current.sessionId;
            if (!sessionId) {
                const token = (await supabase.auth.getSession()).data.session?.access_token;
                const res = await fetch('/.netlify/functions/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ action: 'create', data: { initial_question: session.currentQuestion } }),
                });
                const data = await res.json();
                sessionId = data.session_id;
                setSession((s) => ({ ...s, sessionId: sessionId! }));
            }

            // 2. Client-side embedding + RAG search (graceful degradation if model fails)
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            let chunks: unknown[] = [];
            try {
                const embedding = await getQueryEmbedding(answer, setEmbeddingStatus);

                const searchRes = await fetch('/.netlify/functions/rag-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ embedding, top_k: SESSION_CONFIG.searchTopK }),
                });
                if (searchRes.ok) {
                    const data = await searchRes.json();
                    chunks = data.chunks ?? [];
                }
            } catch {
                // Embedding model download failed (CORS etc.) — skip RAG, continue with LLM only
                console.warn('Embedding failed, skipping RAG search');
            }

            setSession((s) => ({ ...s, status: 'evaluating' }));

            // 3. Build prompt and stream LLM
            const newDepth = sessionRef.current.depth + 1;
            const systemPrompt = buildInterviewSystemPrompt({
                question: sessionRef.current.currentQuestion,
                userAnswer: answer,
                chunks,
                history: updatedMessages,
                depth: newDepth,
            });

            const llmMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));

            let fullText = '';
            for await (const chunk of streamFromProxy(apiKey, systemPrompt, llmMessages)) {
                fullText += chunk;
                setStreamText(fullText);
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

            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: aiResponse ? aiResponse.summary : fullText,
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
            if (aiResponse?.shouldContinue && newDepth < SESSION_CONFIG.maxDepth) {
                setSession((s) => ({
                    ...s,
                    messages: newMessages,
                    depth: newDepth,
                    status: 'question_displayed',
                    currentQuestion: aiResponse!.followUp.question,
                    scores: newScores,
                }));
            } else {
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
    }, [input, isLoading, user, apiKey]);

    // --- Render ---

    if (!user) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-6 dark:border-neutral-700">
                <h2 className="mb-4 text-xl font-bold">AI 모의면접</h2>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">로그인하여 개인화된 모의면접을 시작하세요.</p>
                <div className="flex gap-2">
                    <button onClick={() => handleLogin('google')} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Google 로그인</button>
                    <button onClick={() => handleLogin('github')} className="rounded bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-900">GitHub 로그인</button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl rounded-xl border p-6 dark:border-neutral-700">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">AI 모의면접</h2>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    {embeddingStatus === 'loading' && <span>모델 로딩...</span>}
                    <span>Depth: {session.depth}/{SESSION_CONFIG.maxDepth}</span>
                </div>
            </div>

            {/* API Key input */}
            {!apiKey && (
                <div className="mb-4 rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
                    <label className="block text-sm font-medium">Claude API Key (BYOK)</label>
                    <input
                        type="password"
                        placeholder="sk-ant-api..."
                        className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        onBlur={(e) => setApiKey(e.target.value)}
                    />
                </div>
            )}

            {/* Current question */}
            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {session.status === 'completed' ? '면접이 종료되었습니다.' : session.currentQuestion}
                </p>
            </div>

            {/* Chat messages */}
            <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                {session.messages.map((msg, i) => (
                    <div key={i} className={`rounded p-3 text-sm ${msg.role === 'user' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-green-50 dark:bg-green-900/20'}`}>
                        <span className="text-xs font-medium text-neutral-500">
                            {msg.role === 'user' ? '나' : msg.interviewer ? `${msg.interviewer} 면접관` : 'AI'}
                        </span>
                        <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                ))}
                {streamText && (
                    <div className="rounded bg-green-50 p-3 text-sm dark:bg-green-900/20">
                        <span className="text-xs font-medium text-neutral-500">AI (응답 중...)</span>
                        <p className="mt-1 whitespace-pre-wrap">{streamText}</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {session.status !== 'completed' && (
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="답변을 입력하세요..."
                        rows={3}
                        className="flex-1 rounded border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(); } }}
                    />
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={isLoading || !apiKey}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? '...' : '제출'}
                    </button>
                </div>
            )}

            {session.status === 'completed' && (
                <button
                    onClick={() => setSession({ ...INITIAL_SESSION_STATE, currentQuestion: initialQuestion })}
                    className="w-full rounded bg-neutral-200 py-2 text-sm dark:bg-neutral-700"
                >
                    새 면접 시작
                </button>
            )}
        </div>
    );
}
