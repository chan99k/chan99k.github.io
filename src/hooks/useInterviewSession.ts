import { useState, useCallback } from 'react';

interface UseInterviewSessionOptions {
    token: string | null;
}

interface SessionState {
    sessionId: string | null;
    depth: number;
    isComplete: boolean;
    scores: number[];
}

export function useInterviewSession({ token }: UseInterviewSessionOptions) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [depth, setDepth] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [scores, setScores] = useState<number[]>([]);

    const createSession = useCallback(async (initialQuestion: string): Promise<string | null> => {
        if (!token) return null;

        const res = await fetch('/.netlify/functions/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                action: 'create',
                data: { initial_question: initialQuestion },
            }),
        });

        if (res.ok) {
            const data = await res.json();
            setSessionId(data.session_id);
            return data.session_id;
        }
        return null;
    }, [token]);

    const saveMessage = useCallback(async (
        sid: string,
        role: 'user' | 'assistant',
        content: string,
    ) => {
        if (!token || !sid) return;

        await fetch('/.netlify/functions/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                action: 'message',
                session_id: sid,
                data: { role, content },
            }),
        });
    }, [token]);

    const completeSession = useCallback(async (sid: string, totalScore: number) => {
        if (!token || !sid) return;

        await fetch('/.netlify/functions/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                action: 'complete',
                session_id: sid,
                data: { total_score: totalScore },
            }),
        });
        setIsComplete(true);
    }, [token]);

    const advanceDepth = useCallback(() => {
        setDepth((d) => d + 1);
    }, []);

    const addScore = useCallback((score: number) => {
        setScores((prev) => [...prev, score]);
    }, []);

    const getAverageScore = useCallback(() => {
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [scores]);

    const reset = useCallback(() => {
        setSessionId(null);
        setDepth(0);
        setIsComplete(false);
        setScores([]);
    }, []);

    return {
        sessionId,
        depth,
        isComplete,
        scores,
        setIsComplete,
        createSession,
        saveMessage,
        completeSession,
        advanceDepth,
        addScore,
        getAverageScore,
        reset,
    };
}
