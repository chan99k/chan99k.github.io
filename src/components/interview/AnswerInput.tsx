interface Props {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isLoading?: boolean;
	hasApiKey?: boolean;
}

export function AnswerInput({ value, onChange, onSubmit, isLoading, hasApiKey }: Props) {
	return (
		<div className="mt-4">
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="답변을 입력하세요..."
				rows={5}
				className="w-full rounded-lg border p-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
				disabled={isLoading}
			/>
			<div className="mt-2 flex justify-end">
				<button
					onClick={onSubmit}
					disabled={isLoading || !hasApiKey || !value.trim()}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{!hasApiKey ? 'API 키를 먼저 설정하세요' : 'AI 평가 받기'}
				</button>
			</div>
		</div>
	);
}
