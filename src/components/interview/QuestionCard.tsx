import { useState } from 'react';

interface Props {
	title: string;
	hints: string[];
	onRefresh?: () => void;
	compact?: boolean;
	isFollowUp?: boolean;
	reaction?: string;
}

export function QuestionCard({ title, hints, onRefresh, compact = false, isFollowUp = false, reaction }: Props) {
	const [showHints, setShowHints] = useState(false);

	return (
		<div>
			{reaction && (
				<p className="mb-2 text-xs italic text-neutral-500 dark:text-neutral-400">{reaction}</p>
			)}
			<div className="flex items-start gap-2">
				<span className="text-[#0078FF] font-bold text-lg leading-snug shrink-0">Q.</span>
				<h3
					className={
						compact
							? 'text-base font-bold leading-snug break-keep text-balance'
							: 'text-xl font-bold leading-snug break-keep text-balance'
					}
				>
					{title}
				</h3>
			</div>
			<div className={`mt-4 flex items-center gap-2 ${compact ? 'pl-7' : 'pl-7'}`}>
				{!isFollowUp && hints.length > 0 && (
					<button
						onClick={() => setShowHints(!showHints)}
						className="text-sm text-neutral-400 transition-colors hover:text-[#0078FF] dark:hover:text-blue-400"
					>
						{showHints ? 'Hide' : 'Hint?'}
					</button>
				)}
				{!isFollowUp && onRefresh && (
					<button
						onClick={onRefresh}
						className="text-neutral-400 transition-colors hover:text-[#0078FF] dark:hover:text-blue-400"
						aria-label="Refresh question"
					>
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</button>
				)}
			</div>
			{!isFollowUp && showHints && hints.length > 0 && (
				<div className={`mt-2 flex flex-wrap gap-1 pl-7`}>
					{hints.map((hint) => (
						<span
							key={hint}
							className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200"
						>
							{hint}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
