export interface CriterionScore {
    id: string;
    score: number;
    maxScore: number;
    feedback: string;
}

export interface FeedbackData {
    totalScore: number;
    criteria: CriterionScore[];
    strengths: string[];
    improvements: string[];
    studyGuide: string[];
    summary: string;
}

interface Props {
    feedback: FeedbackData | null;
    isLoading: boolean;
}

export function AiFeedback({ feedback, isLoading }: Props) {
    if (isLoading && !feedback) {
        return (
            <div className="flex items-center gap-2 py-1">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600 dark:border-neutral-600 dark:border-t-blue-400"></div>
                <p className="text-sm text-neutral-500">평가 중...</p>
            </div>
        );
    }

    if (!feedback) return null;

    return (
        <div className="space-y-3">
            {/* Total Score */}
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{feedback.totalScore}</span>
                <span className="text-sm text-neutral-400">/100</span>
            </div>

            {/* Criteria Scores */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">평가 항목</h3>
                {feedback.criteria.map((criterion) => {
                    const percentage = (criterion.score / criterion.maxScore) * 100;
                    return (
                        <div key={criterion.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                    {criterion.id}
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    {criterion.score}/{criterion.maxScore}
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                <div
                                    className="h-full bg-blue-600 dark:bg-blue-400"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {criterion.feedback}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">잘한 점</h3>
                    <ul className="space-y-1">
                        {feedback.strengths.map((item, i) => (
                            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300">
                                <span className="mr-1 text-green-600 dark:text-green-400">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Improvements */}
            {feedback.improvements.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">개선할 점</h3>
                    <ul className="space-y-1">
                        {feedback.improvements.map((item, i) => (
                            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300">
                                <span className="mr-1 text-yellow-600 dark:text-yellow-400">→</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Study Guide */}
            {feedback.studyGuide.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        📚 학습 가이드
                    </h3>
                    <ul className="space-y-1">
                        {feedback.studyGuide.map((item, i) => (
                            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300">
                                <span className="mr-1 text-blue-600 dark:text-blue-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Summary */}
            {feedback.summary && (
                <div className="border-t border-neutral-200 pt-3 dark:border-neutral-600">
                    <p className="text-sm italic text-neutral-600 dark:text-neutral-400">
                        {feedback.summary}
                    </p>
                </div>
            )}
        </div>
    );
}
