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
        <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-xs text-neutral-500 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                진행도: {depth}/{maxDepth}
            </div>
            {depth > 0 && !isComplete && (
                <button
                    onClick={onEndInterview}
                    className="text-xs text-neutral-500 bg-white dark:bg-[#2B3040] border border-gray-200 dark:border-gray-700 px-3 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                    면접 종료
                </button>
            )}
            {isComplete && sessionId && (
                <a
                    href={`/interview/result/${sessionId}`}
                    className="text-xs text-[#0078FF] font-medium hover:underline"
                >
                    결과 보기
                </a>
            )}
        </div>
    );
}
