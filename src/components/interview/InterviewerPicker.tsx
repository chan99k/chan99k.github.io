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
                className="text-xs text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400"
            >
                면접관 설정 ({selected.length}명)
            </button>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
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
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                            isSelected
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                    >
                        {role.name.replace(' 면접관', '')}
                    </button>
                );
            })}
            {compact && (
                <button
                    onClick={() => setExpanded(false)}
                    className="text-xs text-neutral-400"
                >
                    접기
                </button>
            )}
        </div>
    );
}
