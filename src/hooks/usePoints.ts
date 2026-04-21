import { useState, useCallback, useEffect } from 'react';

interface UsePointsOptions {
    token: string | null;
    isLoggedIn: boolean;
}

export function usePoints({ token, isLoggedIn }: UsePointsOptions) {
    const [balance, setBalance] = useState<number | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch('/.netlify/functions/points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ action: 'balance' }),
            });

            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance ?? data.data?.balance ?? null);
            }
        } catch {
            // Silent failure — balance display is non-critical
        }
    }, [token]);

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchBalance();
        }
    }, [isLoggedIn, token, fetchBalance]);

    return { balance, refetch: fetchBalance };
}
