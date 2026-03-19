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
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
                <span>면접관</span>
                <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] dark:bg-neutral-800">
                    {selected.length}
                </span>
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
