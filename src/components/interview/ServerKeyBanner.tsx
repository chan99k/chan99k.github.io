// src/components/interview/ServerKeyBanner.tsx
import { useState } from 'react';

interface Props {
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    pointBalance?: number | null;
    forceShowInput?: boolean;
}

export default function ServerKeyBanner({
    apiKey, onApiKeyChange, isLoggedIn, onLoginClick, pointBalance, forceShowInput
}: Props) {
    const [showInput, setShowInput] = useState(false);
    const isInputVisible = showInput || forceShowInput;

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

    if (!isLoggedIn && !isInputVisible) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                <button
                    onClick={() => setShowInput(true)}
                    className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    API 키 입력
                </button>
                <span>·</span>
                <button
                    onClick={onLoginClick}
                    className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    로그인
                </button>
            </div>
        );
    }

    if (isInputVisible) {
        return (
            <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Claude API Key (BYOK)
                </label>
                <input
                    type="password"
                    placeholder="sk-ant-api..."
                    className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                    onBlur={(e) => { if (e.target.value) onApiKeyChange(e.target.value); }}
                />
                <button
                    onClick={() => setShowInput(false)}
                    className="text-xs text-neutral-400 underline hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    취소
                </button>
            </div>
        );
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
