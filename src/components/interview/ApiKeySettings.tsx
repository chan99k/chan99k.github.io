import { useState, useEffect } from 'react';

const STORAGE_KEY = 'claude-api-key';

interface Props {
    onKeyChange: (key: string) => void;
}

export function ApiKeySettings({ onKeyChange }: Props) {
    const [key, setKey] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setKey(stored);
            onKeyChange(stored);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, key);
        onKeyChange(key);
    };

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="mb-2 text-sm font-medium">Claude API Key 설정</p>
            <div className="flex gap-2">
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="flex-1 rounded border px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                />
                <button
                    onClick={handleSave}
                    className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                    저장
                </button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
                * 키는 브라우저에만 저장되며, 블로그 서버를 거치지 않고 Claude API에 직접 전송됩니다
            </p>
        </div>
    );
}
