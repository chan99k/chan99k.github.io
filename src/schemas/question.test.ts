import { describe, it, expect } from 'vitest';
import { questionSchema } from './question';

describe('questionSchema', () => {
	it('validates a valid question', () => {
		const result = questionSchema.safeParse({
			title: 'HashMap vs Hashtable 차이점',
			answer: 'HashMap은 비동기, Hashtable은 동기화',
			category: 'java',
			difficulty: 'junior',
			tags: ['Collections'],
			source: 'curated',
			relatedPosts: ['meta-tag-collection-optimization'],
			hints: ['동기화', 'null 허용'],
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid difficulty', () => {
		const result = questionSchema.safeParse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 'expert',
		});
		expect(result.success).toBe(false);
	});

	it('enforces hints max 5', () => {
		const result = questionSchema.safeParse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 'junior',
			hints: ['a', 'b', 'c', 'd', 'e', 'f'],
		});
		expect(result.success).toBe(false);
	});

	it('applies defaults for optional fields', () => {
		const result = questionSchema.parse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 'junior',
		});
		expect(result.tags).toEqual([]);
		expect(result.source).toBe('curated');
		expect(result.relatedPosts).toEqual([]);
		expect(result.hints).toEqual([]);
	});
});
