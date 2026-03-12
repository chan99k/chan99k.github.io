import { useEffect, useRef } from 'react';

interface Props {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isLoading?: boolean;
	hasApiKey?: boolean;
	placeholder?: string;
}

export function AnswerInput({
	value,
	onChange,
	onSubmit,
	isLoading,
	hasApiKey,
	placeholder = '답변을 입력하세요...'
}: Props) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const isDisabled = isLoading || !value.trim();

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = 'auto';
		const newHeight = Math.min(textarea.scrollHeight, 144);
		textarea.style.height = `${newHeight}px`;
	}, [value]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (!isDisabled) {
				onSubmit();
			}
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-gray-700 dark:bg-[#2B3040] dark:shadow-none">
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					rows={1}
					disabled={isLoading}
					className="flex-1 resize-none overflow-hidden border-none bg-transparent text-sm leading-8 outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
				/>
				<button
					onClick={onSubmit}
					disabled={isDisabled}
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0078FF] text-white transition-colors hover:bg-[#0066DD] disabled:bg-gray-300 dark:disabled:bg-gray-600"
					title={!hasApiKey ? 'API 키를 먼저 설정하세요' : '제출 (Enter)'}
				>
					{isLoading ? (
						<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					) : (
						<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M12 19V5M5 12l7-7 7 7" />
						</svg>
					)}
				</button>
			</div>
		</div>
	);
}
