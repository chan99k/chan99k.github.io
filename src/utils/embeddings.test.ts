import { describe, it, expect } from 'vitest';
import { cosineSimilarity, findTopK } from './embeddings';

describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
        const v = [1, 0, 0];
        expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
    });

    it('returns 0 for orthogonal vectors', () => {
        expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0);
    });

    it('returns -1 for opposite vectors', () => {
        expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
    });

    it('handles zero vectors', () => {
        expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
    });
});

describe('findTopK', () => {
    const embeddings = {
        chunks: [
            { slug: 'post-a', title: 'Post A', chunk: 'content A', embedding: [1, 0, 0] },
            { slug: 'post-b', title: 'Post B', chunk: 'content B', embedding: [0, 1, 0] },
            { slug: 'post-c', title: 'Post C', chunk: 'content C', embedding: [0.9, 0.1, 0] },
        ],
    };

    it('returns top-k most similar chunks', () => {
        const query = [1, 0, 0];
        const results = findTopK(query, embeddings, 2);
        expect(results).toHaveLength(2);
        expect(results[0].slug).toBe('post-a');
        expect(results[1].slug).toBe('post-c');
    });

    it('returns all if k > total chunks', () => {
        const results = findTopK([1, 0, 0], embeddings, 10);
        expect(results).toHaveLength(3);
    });

    it('includes score in results', () => {
        const results = findTopK([1, 0, 0], embeddings, 1);
        expect(results[0].score).toBeCloseTo(1.0);
    });
});
