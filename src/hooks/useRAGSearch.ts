import { useState, useCallback } from 'react';

export interface RAGChunk {
    slug: string;
    title: string;
    chunk_text: string;
    source: string;
}

interface UseRAGSearchOptions {
    token: string | null;
}

export function useRAGSearch({ token }: UseRAGSearchOptions) {
    const [chunks, setChunks] = useState<RAGChunk[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const search = useCallback(async (text: string, topK = 5): Promise<RAGChunk[]> => {
        if (!token) return [];

        setIsSearching(true);
        try {
            const res = await fetch('/.netlify/functions/rag-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text, top_k: topK }),
            });

            if (res.ok) {
                const data = await res.json();
                const result = data.chunks ?? [];
                setChunks(result);
                return result;
            }
            return [];
        } catch {
            // Graceful degradation: continue without RAG
            return [];
        } finally {
            setIsSearching(false);
        }
    }, [token]);

    const reset = useCallback(() => setChunks([]), []);

    return { chunks, isSearching, search, reset };
}
