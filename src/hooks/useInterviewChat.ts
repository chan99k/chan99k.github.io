import { useState, useCallback } from 'react';
import { streamEvaluation, streamFromServer } from '../utils/prompts';
import { parseInterviewResponse, extractDisplayText } from '../utils/parse-response';
import type { ParsedInterviewResponse } from '../utils/parse-response';
import type { Provider } from '../utils/claude';

interface UseInterviewChatOptions {
    token: string | null;
    apiKey: string;
    provider: Provider;
}

interface StreamResult {
    rawText: string;
    parsed: ParsedInterviewResponse | null;
}

export function useInterviewChat({ token, apiKey, provider }: UseInterviewChatOptions) {
    const [streamText, setStreamText] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendAnswer = useCallback(async (
        systemPrompt: string,
        historyMessages: { role: string; content: string }[],
        answer: string,
    ): Promise<StreamResult> => {
        setIsLoading(true);
        setStreamText('');
        setDisplayText('');
        setError(null);

        let fullText = '';

        try {
            if (apiKey) {
                // BYOK mode
                for await (const chunk of streamEvaluation(apiKey, systemPrompt, provider)) {
                    fullText += chunk;
                    setStreamText(fullText);
                    setDisplayText(extractDisplayText(fullText));
                }
            } else {
                // Server key mode
                for await (const chunk of streamFromServer(
                    token,
                    systemPrompt,
                    [...historyMessages, { role: 'user', content: answer }],
                )) {
                    fullText += chunk;
                    setStreamText(fullText);
                    setDisplayText(extractDisplayText(fullText));
                }
            }

            const parsed = parseInterviewResponse(fullText);
            return { rawText: fullText, parsed };
        } catch (err) {
            const msg = err instanceof Error ? err.message : '알 수 없는 오류';
            setError(msg);
            throw err;
        } finally {
            setStreamText('');
            setDisplayText('');
            setIsLoading(false);
        }
    }, [apiKey, provider, token]);

    const clearError = useCallback(() => setError(null), []);

    return {
        streamText,
        displayText,
        isLoading,
        error,
        sendAnswer,
        clearError,
    };
}
