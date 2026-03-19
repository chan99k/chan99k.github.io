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
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs dark:bg-green-900/20">
                <span className="text-green-700 dark:text-green-300">BYOK 모드 (무제한)</span>
                <button
                    onClick={() => onApiKeyChange('')}
                    className="text-green-600 underline hover:text-green-800 dark:text-green-400"
                >
                    서버 키로 전환
                </button>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs dark:bg-amber-900/20">
                <span className="text-amber-700 dark:text-amber-300">로그인하면 서버 키로 무료 이용 가능</span>
                <button
                    onClick={onLoginClick}
                    className="rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
                >
                    로그인
                </button>
            </div>
        );
    }

    if (showInput) {
        return (
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <label className="block text-xs font-medium">Claude API Key (BYOK)</label>
                <input
                    type="password"
                    placeholder="sk-ant-api..."
                    className="mt-1 w-full rounded border px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                    onBlur={(e) => { if (e.target.value) onApiKeyChange(e.target.value); }}
                />
                <button
                    onClick={() => setShowInput(false)}
                    className="mt-2 text-xs text-neutral-500 underline"
                >
                    서버 키 모드로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-900/20">
            <span className="text-blue-700 dark:text-blue-300">
                서버 키 모드{pointBalance != null && ` (${pointBalance}P)`}
            </span>
            <button
                onClick={() => setShowInput(true)}
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
            >
                자체 API 키 사용
            </button>
        </div>
    );
}
