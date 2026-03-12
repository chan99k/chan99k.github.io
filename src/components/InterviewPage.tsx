import { useState } from 'react';
import InterviewSetup from './InterviewSetup';
import InterviewChat from './InterviewChat';
import type { InterviewerId } from '../config/interviewers';

interface Props {
    initialQuestion: string;
}

export default function InterviewPage({ initialQuestion }: Props) {
    const [config, setConfig] = useState<{ interviewers: InterviewerId[] } | null>(null);

    if (!config) {
        return (
            <div className="mx-auto max-w-2xl rounded-xl border p-4 sm:p-6 dark:border-neutral-700">
                <h2 className="mb-4 text-lg font-bold sm:text-xl">AI 모의면접</h2>
                <InterviewSetup onStart={setConfig} />
            </div>
        );
    }

    return <InterviewChat initialQuestion={initialQuestion} interviewers={config.interviewers} />;
}
