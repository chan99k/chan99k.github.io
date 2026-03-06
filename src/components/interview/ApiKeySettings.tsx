import { useState, useEffect } from 'react';
import type { Provider } from '../../utils/claude';

const KEY_STORAGE = 'interview-api-key';
const PROVIDER_STORAGE = 'interview-provider';

const PROVIDER_OPTIONS: { value: Provider; label: string; placeholder: string }[] = [
    { value: 'claude', label: 'Claude', placeholder: 'sk-ant-...' },
    { value: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
];

interface Props {
    onSettingsChange: (key: string, provider: Provider) => void;
}

export function ApiKeySettings({ onSettingsChange }: Props) {
    const [key, setKey] = useState('');
    const [provider, setProvider] = useState<Provider>('claude');

    useEffect(() => {
        const storedKey = sessionStorage.getItem(KEY_STORAGE);
        const storedProvider = sessionStorage.getItem(PROVIDER_STORAGE) as Provider | null;
        if (storedProvider) setProvider(storedProvider);
        if (storedKey) {
            setKey(storedKey);
            onSettingsChange(storedKey, storedProvider ?? 'claude');
        }
    }, []);

    const handleSave = () => {
        sessionStorage.setItem(KEY_STORAGE, key);
        sessionStorage.setItem(PROVIDER_STORAGE, provider);
        onSettingsChange(key, provider);
    };

    const currentOption = PROVIDER_OPTIONS.find((o) => o.value === provider)!;

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="mb-2 text-sm font-medium">API Key 설정</p>
            <div className="flex gap-2">
                <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Provider)}
                    className="rounded border px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                    {PROVIDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={currentOption.placeholder}
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
                * 키는 현재 세션에만 저장되며, 탭을 닫으면 자동 삭제됩니다
            </p>
        </div>
    );
}
