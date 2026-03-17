import { describe, it, expect } from 'vitest';
import { questionSchema } from './question';

describe('questionSchema', () => {
	it('validates a valid question', () => {
		const result = questionSchema.safeParse({
			title: 'HashMap vs Hashtable 차이점',
			answer: 'HashMap은 비동기, Hashtable은 동기화',
			category: 'java',
			difficulty: 2,
			tags: ['Collections'],
			source: 'curated',
			relatedPosts: ['meta-tag-collection-optimization'],
			hints: ['동기화', 'null 허용'],
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid difficulty', () => {
		const resultString = questionSchema.safeParse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 'expert',
		});
		expect(resultString.success).toBe(false);

		const resultTooLow = questionSchema.safeParse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 0,
		});
		expect(resultTooLow.success).toBe(false);

		const resultTooHigh = questionSchema.safeParse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 6,
		});
		expect(resultTooHigh.success).toBe(false);
	});

	it('enforces hints max 5', () => {
		const result = questionSchema.safeParse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 2,
			hints: ['a', 'b', 'c', 'd', 'e', 'f'],
		});
		expect(result.success).toBe(false);
	});

	it('applies defaults for optional fields', () => {
		const result = questionSchema.parse({
			title: 'Test',
			answer: 'Answer',
			category: 'java',
			difficulty: 3,
		});
		expect(result.tags).toEqual([]);
		expect(result.source).toBe('curated');
		expect(result.relatedPosts).toEqual([]);
		expect(result.hints).toEqual([]);
	});

	it('validates all difficulty levels 1-5', () => {
		for (let level = 1; level <= 5; level++) {
			const result = questionSchema.safeParse({
				title: 'Test',
				answer: 'Answer',
				category: 'java',
				difficulty: level,
			});
			expect(result.success).toBe(true);
		}
	});
});
