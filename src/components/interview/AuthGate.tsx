// src/components/interview/AuthGate.tsx
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface Props {
    supabaseUrl: string;
    supabaseAnonKey: string;
    children: (user: User | null, token: string | null) => React.ReactNode;
}

export default function AuthGate({ supabaseUrl, supabaseAnonKey, children }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setToken(session?.access_token ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setToken(session?.access_token ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabaseUrl, supabaseAnonKey]);

    return <>{children(user, token)}</>;
}
