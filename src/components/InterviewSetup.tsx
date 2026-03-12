import { useState } from 'react';
import { INTERVIEWER_ROLES, type InterviewerId } from '../config/interviewers';

interface Props {
    onStart: (config: { interviewers: InterviewerId[] }) => void;
}

const ALL_INTERVIEWERS = Object.keys(INTERVIEWER_ROLES) as InterviewerId[];

export default function InterviewSetup({ onStart }: Props) {
    const [selected, setSelected] = useState<InterviewerId[]>([...ALL_INTERVIEWERS]);

    const toggle = (id: InterviewerId) => {
        setSelected(prev => {
            if (prev.includes(id)) {
                if (prev.length <= 1) return prev; // 최소 1명
                return prev.filter(x => x !== id);
            }
            if (prev.length >= 3) return prev; // 최대 3명
            return [...prev, id];
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-medium sm:text-sm">면접관 선택 (1~3명)</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="면접관 선택">
                {ALL_INTERVIEWERS.map(id => {
                    const role = INTERVIEWER_ROLES[id];
                    const isSelected = selected.includes(id);
                    return (
                        <button
                            key={id}
                            onClick={() => toggle(id)}
                            className={`rounded-lg border px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400'
                            }`}
                            aria-pressed={isSelected}
                            aria-label={`${role.name} 면접관 ${isSelected ? '선택됨' : '선택 안됨'}. ${role.perspective}`}
                        >
                            <div className="font-medium">{role.name}</div>
                            <div className="text-xs opacity-70">{role.perspective}</div>
                        </button>
                    );
                })}
            </div>
            <button
                onClick={() => onStart({ interviewers: selected })}
                disabled={selected.length === 0}
                className="w-full rounded bg-blue-600 py-2 text-xs text-white hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
                aria-label="선택한 면접관으로 면접 시작하기"
            >
                면접 시작
            </button>
        </div>
    );
}
