import { describe, it, expect } from 'vitest';
import {
	filterByCategory,
	getRandomQuestion,
	matchRelatedPosts,
	getCategories,
} from './questions';

const mockQuestions = [
	{
		slug: 'q1',
		data: {
			title: 'Q1',
			category: 'java',
			difficulty: 2,
			tags: ['Collections'],
			relatedPosts: ['post-a'],
		},
	},
	{
		slug: 'q2',
		data: {
			title: 'Q2',
			category: 'architecture',
			difficulty: 4,
			tags: ['DDD'],
			relatedPosts: [],
		},
	},
	{
		slug: 'q3',
		data: {
			title: 'Q3',
			category: 'java',
			difficulty: 3,
			tags: ['Concurrency'],
			relatedPosts: ['post-b'],
		},
	},
];

const mockPosts = [
	{ slug: 'post-a', data: { title: 'Post A', tags: ['Areas/개발/lang/Java'] } },
	{
		slug: 'post-b',
		data: { title: 'Post B', tags: ['Areas/개발/design-pattern'] },
	},
	{ slug: 'post-c', data: { title: 'Post C', tags: ['Areas/개발/lang/Java'] } },
];

describe('filterByCategory', () => {
	it('filters by category', () => {
		const result = filterByCategory(mockQuestions, 'java');
		expect(result).toHaveLength(2);
	});

	it('returns all when category is "all"', () => {
		const result = filterByCategory(mockQuestions, 'all');
		expect(result).toHaveLength(3);
	});
});

describe('getRandomQuestion', () => {
	it('returns a question from the list', () => {
		const q = getRandomQuestion(mockQuestions);
		expect(mockQuestions.map((q) => q.slug)).toContain(q.slug);
	});

	it('excludes specified slug', () => {
		for (let i = 0; i < 20; i++) {
			const q = getRandomQuestion(mockQuestions, 'q1');
			expect(q.slug).not.toBe('q1');
		}
	});
});

describe('matchRelatedPosts', () => {
	it('returns explicitly linked posts', () => {
		const result = matchRelatedPosts(mockQuestions[0], mockPosts);
		expect(result.some((p) => p.slug === 'post-a')).toBe(true);
	});

	it('returns empty for question with no related posts', () => {
		const result = matchRelatedPosts(mockQuestions[1], mockPosts);
		expect(result).toHaveLength(0);
	});
});

describe('getCategories', () => {
	it('returns sorted unique categories', () => {
		const result = getCategories(mockQuestions);
		expect(result).toEqual(['architecture', 'java']);
	});
});
