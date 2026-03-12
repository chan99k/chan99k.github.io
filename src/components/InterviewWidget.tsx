import { useState, useCallback, useEffect, useRef } from 'react';
import { QuestionCard } from './interview/QuestionCard';
import { AnswerInput } from './interview/AnswerInput';
import { AiFeedback } from './interview/AiFeedback';
import type { FeedbackData } from './interview/AiFeedback';
import { ChatMessage } from './interview/ChatMessage';
import { ApiKeySettings } from './interview/ApiKeySettings';
import { RelatedPosts } from './interview/RelatedPosts';
import { getRandomQuestion, matchRelatedPosts } from '../utils/questions';
import { buildEvaluationPrompt, streamEvaluation } from '../utils/claude';
import type { Provider } from '../utils/claude';
import type { EmbeddingsData } from '../utils/embeddings';
import type { QuestionEntry, PostEntry } from '../utils/questions';

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
}

interface Message {
    role: 'user' | 'interviewer';
    content: string;
    feedback?: FeedbackData;
}

export default function InterviewWidget({ questions, posts }: Props) {
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState<Provider>('claude');
    const [current, setCurrent] = useState<QuestionData>(() => getRandomQuestion(questions));
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [streamText, setStreamText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [embeddings, setEmbeddings] = useState<EmbeddingsData | null>(null);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const phase = messages.length > 0 ? 'chat' : 'initial';

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
    }, [questions, current.slug]);

    const handleSubmit = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        if (!apiKey) {
            setShowApiKeyModal(true);
            return;
        }

        const answer = inputValue.trim();
        setInputValue('');
        setIsLoading(true);

        // Add user message
        const userMsg: Message = { role: 'user', content: answer };
        setMessages((prev) => [...prev, userMsg]);
        setStreamText('');

        // Build blog context from embeddings
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

        try {
            let fullText = '';
            for await (const chunk of streamEvaluation(apiKey, prompt, provider)) {
                fullText += chunk;
                setStreamText(fullText);
            }

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
        } catch (err) {
            const errorMsg: Message = {
                role: 'interviewer',
                content: `오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setStreamText('');
            setIsLoading(false);
        }
    }, [apiKey, provider, inputValue, isLoading, current, posts, embeddings]);

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
                <QuestionCard
                    title={current.data.title}
                    hints={current.data.hints ?? []}
                    onRefresh={handleRefresh}
                    compact={phase === 'chat'}
                />
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
            <div className="w-full pt-2">
                <AnswerInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    hasApiKey={!!apiKey}
                    placeholder={phase === 'initial' ? '답변을 입력하세요...' : '추가 답변을 입력하세요...'}
                />
            </div>

            {/* Bottom spacer - balances top spacer so input bar sits at ~center */}
            {phase === 'initial' && <div className="flex-[1.3]" />}

            {/* API Key modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1E2231]">
                        <h3 className="mb-4 text-lg font-semibold">API 키 설정</h3>
                        <ApiKeySettings onSettingsChange={(key, prov) => {
                            setApiKey(key);
                            setProvider(prov);
                            setShowApiKeyModal(false);
                        }} />
                        <button
                            onClick={() => setShowApiKeyModal(false)}
                            className="mt-4 w-full rounded-lg py-2 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
