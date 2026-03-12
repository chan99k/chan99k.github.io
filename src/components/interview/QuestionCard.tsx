import { useState } from 'react';

interface Props {
	title: string;
	hints: string[];
	onRefresh?: () => void;
	compact?: boolean;
}

export function QuestionCard({ title, hints, onRefresh, compact = false }: Props) {
	const [showHints, setShowHints] = useState(false);

	return (
		<div>
			<h3
				className={
					compact
						? 'text-base font-semibold'
						: 'text-center text-xl font-semibold sm:text-2xl'
				}
			>
				<span className="text-neutral-400">Q. </span>
				{title}
			</h3>
			{hints.length > 0 && (
				<div className="mt-2">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowHints(!showHints)}
							className="text-sm text-blue-600 hover:underline dark:text-blue-400"
						>
							{showHints ? '힌트 숨기기' : '힌트 보기'}
						</button>
						{onRefresh && (
							<button
								onClick={onRefresh}
								className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
								aria-label="Refresh question"
							>
								<svg
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M1 4v6h6M23 20v-6h-6" />
									<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
								</svg>
							</button>
						)}
					</div>
					{showHints && (
						<div className="mt-1 flex flex-wrap gap-1">
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
			)}
		</div>
	);
}
