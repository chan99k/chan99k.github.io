// src/components/interview/InterviewerPicker.tsx
import { useState } from 'react';
import { INTERVIEWER_ROLES, type InterviewerId } from '../../config/interviewers';

interface Props {
    selected: InterviewerId[];
    onChange: (ids: InterviewerId[]) => void;
    compact?: boolean;
}

const ALL_IDS: InterviewerId[] = ['frontend', 'backend', 'dba'];

export default function InterviewerPicker({ selected, onChange, compact }: Props) {
    const [expanded, setExpanded] = useState(false);

    if (compact && !expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
                title="면접관 설정"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                </svg>
                <span>면접관 {selected.length}명</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </button>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {ALL_IDS.map((id) => {
                const role = INTERVIEWER_ROLES[id];
                const isSelected = selected.includes(id);
                return (
                    <button
                        key={id}
                        onClick={() => {
                            if (isSelected && selected.length > 1) {
                                onChange(selected.filter((s) => s !== id));
                            } else if (!isSelected) {
                                onChange([...selected, id]);
                            }
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                            isSelected
                                ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                                : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                        }`}
                    >
                        {role.name.replace(' 면접관', '')}
                    </button>
                );
            })}
            {compact && (
                <button
                    onClick={() => setExpanded(false)}
                    className="text-xs text-neutral-300 hover:text-neutral-500 dark:text-neutral-600"
                >
                    접기
                </button>
            )}
        </div>
    );
}
