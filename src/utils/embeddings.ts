export interface EmbeddingChunk {
    slug: string;
    title: string;
    chunk: string;
    embedding: number[];
}

export interface EmbeddingsData {
    chunks: EmbeddingChunk[];
}

export function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

export function findTopK(
    queryEmbedding: number[],
    data: EmbeddingsData,
    k: number,
): (EmbeddingChunk & { score: number })[] {
    return data.chunks
        .map((chunk) => ({
            ...chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
}
