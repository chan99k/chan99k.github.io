import { useState, useCallback, useEffect } from 'react';
import { QuestionCard } from './interview/QuestionCard';
import { AnswerInput } from './interview/AnswerInput';
import { AiFeedback } from './interview/AiFeedback';
import type { FeedbackData } from './interview/AiFeedback';
import { ApiKeySettings } from './interview/ApiKeySettings';
import { RelatedPosts } from './interview/RelatedPosts';
import { filterByCategory, getRandomQuestion, matchRelatedPosts, getCategories } from '../utils/questions';
import { buildEvaluationPrompt, streamEvaluation } from '../utils/claude';
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

export default function InterviewWidget({ questions, posts }: Props) {
    const [apiKey, setApiKey] = useState('');
    const [category, setCategory] = useState('all');
    const [current, setCurrent] = useState<QuestionData>(() => getRandomQuestion(questions));
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [streamText, setStreamText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [embeddings, setEmbeddings] = useState<EmbeddingsData | null>(null);

    const categories = getCategories(questions);

    useEffect(() => {
        fetch('/blog-embeddings.json')
            .then((r) => r.json())
            .then(setEmbeddings)
            .catch(() => {});
    }, []);

    const handleNext = useCallback(() => {
        const filtered = filterByCategory(questions, category);
        setCurrent(getRandomQuestion(filtered, current.slug));
        setAnswer('');
        setFeedback(null);
        setStreamText('');
        setShowAnswer(false);
    }, [questions, category, current.slug]);

    const handleCategoryChange = useCallback((cat: string) => {
        setCategory(cat);
        const filtered = filterByCategory(questions, cat);
        setCurrent(getRandomQuestion(filtered));
        setAnswer('');
        setFeedback(null);
        setStreamText('');
        setShowAnswer(false);
    }, [questions]);

    const handleEvaluate = useCallback(async () => {
        if (!apiKey || !answer.trim()) return;

        setIsLoading(true);
        setFeedback(null);
        setStreamText('');

        // Find related blog chunks from embeddings data
        let blogContext: { title: string; chunk: string }[] = [];
        const related = matchRelatedPosts(current, posts);

        if (embeddings) {
            // Get actual content chunks from embeddings for related posts
            for (const post of related) {
                const postChunks = embeddings.chunks.filter((c) => c.slug === post.slug);
                for (const chunk of postChunks) {
                    blogContext.push({
                        title: chunk.title,
                        chunk: chunk.chunk,
                    });
                }
            }
        } else {
            // Fallback: just use titles if embeddings not loaded
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
            for await (const chunk of streamEvaluation(apiKey, prompt)) {
                fullText += chunk;
                setStreamText(fullText);
            }

            const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) ?? fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
                setFeedback(parsed);
            }
        } catch (err) {
            setStreamText(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, answer, current, posts, embeddings]);

    const relatedPosts = matchRelatedPosts(current, posts);

    return (
        <div className="mx-auto max-w-2xl rounded-xl border p-6 dark:border-neutral-700">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">오늘의 면접 질문</h2>
                <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="rounded border px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                    <option value="all">전체</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <QuestionCard
                title={current.data.title}
                category={current.data.category}
                difficulty={current.data.difficulty}
                hints={current.data.hints ?? []}
            />

            <AnswerInput
                value={answer}
                onChange={setAnswer}
                onSubmit={handleEvaluate}
                isLoading={isLoading}
                hasApiKey={!!apiKey}
            />

            <div className="mt-2 flex gap-2">
                <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                >
                    {showAnswer ? '모범답안 숨기기' : '모범답안 보기'}
                </button>
                <button
                    onClick={handleNext}
                    className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                >
                    다음 질문
                </button>
            </div>

            {showAnswer && (
                <div className="mt-3 rounded bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
                    {current.data.answer}
                </div>
            )}

            <AiFeedback
                feedback={feedback}
                isLoading={isLoading}
            />

            {feedback && (
                <RelatedPosts
                    posts={relatedPosts.map((p) => ({ slug: p.slug, title: p.data.title }))}
                />
            )}

            {!apiKey && (
                <div className="mt-6">
                    <ApiKeySettings onKeyChange={setApiKey} />
                </div>
            )}
        </div>
    );
}
