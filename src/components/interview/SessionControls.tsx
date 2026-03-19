// src/components/interview/SessionControls.tsx
interface Props {
    depth: number;
    maxDepth: number;
    sessionId: string | null;
    isComplete: boolean;
    onEndInterview: () => void;
}

export default function SessionControls({
    depth, maxDepth, sessionId, isComplete, onEndInterview
}: Props) {
    return (
        <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>진행도: {depth}/{maxDepth}</span>
            {depth > 0 && !isComplete && (
                <button
                    onClick={onEndInterview}
                    className="rounded border border-neutral-300 px-2 py-0.5 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                >
                    면접 종료
                </button>
            )}
            {isComplete && sessionId && (
                <a
                    href={`/interview/result/${sessionId}`}
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                >
                    결과 보기
                </a>
            )}
        </div>
    );
}
