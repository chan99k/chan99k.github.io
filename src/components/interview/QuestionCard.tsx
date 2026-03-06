import { useState } from 'react';

interface Props {
	title: string;
	category: string;
	difficulty: 'junior' | 'mid' | 'senior';
	hints: string[];
}

const DIFFICULTY_LABEL: Record<string, string> = {
	junior: 'Junior',
	mid: 'Mid',
	senior: 'Senior',
};

const DIFFICULTY_COLOR: Record<string, string> = {
	junior:
		'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	mid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
	senior: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function QuestionCard({ title, category, difficulty, hints }: Props) {
	const [showHints, setShowHints] = useState(false);

	return (
		<div>
			<div className="mb-2 flex items-center gap-2">
				<span className="text-xs text-neutral-500">{category}</span>
				<span
					className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[difficulty]}`}
				>
					{DIFFICULTY_LABEL[difficulty]}
				</span>
			</div>
			<h3 className="text-lg font-semibold">Q. {title}</h3>
			{hints.length > 0 && (
				<div className="mt-2">
					<button
						onClick={() => setShowHints(!showHints)}
						className="text-sm text-blue-600 hover:underline dark:text-blue-400"
					>
						{showHints ? '힌트 숨기기' : '힌트 보기'}
					</button>
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
