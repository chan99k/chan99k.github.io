// src/components/interview/ServerKeyBanner.tsx
import { useState } from 'react';

interface Props {
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    pointBalance?: number | null;
}

export default function ServerKeyBanner({
    apiKey, onApiKeyChange, isLoggedIn, onLoginClick, pointBalance
}: Props) {
    const [showInput, setShowInput] = useState(false);

    if (apiKey) {
        return (
            <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                <span>BYOK 모드 · 무제한</span>
                <button
                    onClick={() => onApiKeyChange('')}
                    className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    서버 키로 전환
                </button>
            </div>
        );
    }

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
            <span>
                서버 키 모드{pointBalance != null && ` · ${pointBalance}P`}
            </span>
            <button
                onClick={() => setShowInput(true)}
                className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
            >
                자체 API 키 사용
            </button>
        </div>
    );
}
