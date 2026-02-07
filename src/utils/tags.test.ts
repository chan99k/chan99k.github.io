import { describe, it, expect } from 'vitest';
import {
	parseTag,
	expandTag,
	buildTagTree,
	getPostsByTag,
	getAllTags,
	getRootTags,
	tagToSlug,
	slugToTag,
} from './tags';

const makePosts = (tagsPerPost: string[][]) =>
	tagsPerPost.map((tags) => ({ data: { tags } }));

describe('tags', () => {
	describe('parseTag', () => {
		it('parses a simple tag', () => {
			expect(parseTag('TIL')).toEqual({ segments: ['TIL'], full: 'TIL' });
		});

		it('parses a hierarchical tag', () => {
			expect(parseTag('개발/React/Next.js')).toEqual({
				segments: ['개발', 'React', 'Next.js'],
				full: '개발/React/Next.js',
			});
		});
	});

	describe('expandTag', () => {
		it('expands a root tag to itself', () => {
			expect(expandTag('TIL')).toEqual(['TIL']);
		});

		it('expands a hierarchical tag to all ancestors', () => {
			expect(expandTag('개발/React/Next.js')).toEqual([
				'개발',
				'개발/React',
				'개발/React/Next.js',
			]);
		});
	});

	describe('buildTagTree', () => {
		it('builds a tree from posts', () => {
			const posts = makePosts([
				['개발/React', 'TIL'],
				['개발/React/Next.js'],
				['개발/TypeScript'],
			]);
			const tree = buildTagTree(posts);

			expect(tree.children['개발'].count).toBe(3);
			expect(tree.children['개발'].children['React'].count).toBe(2);
			expect(tree.children['개발'].children['React'].children['Next.js'].count).toBe(1);
			expect(tree.children['개발'].children['TypeScript'].count).toBe(1);
			expect(tree.children['TIL'].count).toBe(1);
		});

		it('does not double-count when a post has parent and child tags', () => {
			const posts = makePosts([['개발', '개발/React']]);
			const tree = buildTagTree(posts);
			expect(tree.children['개발'].count).toBe(1);
			expect(tree.children['개발'].children['React'].count).toBe(1);
		});
	});

	describe('getPostsByTag', () => {
		const posts = makePosts([
			['개발/React'],
			['개발/React/Next.js'],
			['개발/TypeScript'],
			['TIL'],
		]);

		it('returns posts matching exact tag', () => {
			expect(getPostsByTag(posts, 'TIL')).toHaveLength(1);
		});

		it('returns posts including descendant tags', () => {
			expect(getPostsByTag(posts, '개발/React')).toHaveLength(2);
		});

		it('returns all posts under a root tag', () => {
			expect(getPostsByTag(posts, '개발')).toHaveLength(3);
		});
	});

	describe('getAllTags', () => {
		it('returns all expanded tags sorted', () => {
			const posts = makePosts([['개발/React'], ['TIL']]);
			const tags = getAllTags(posts);
			expect(tags).toEqual(['TIL', '개발', '개발/React']);
		});
	});

	describe('getRootTags', () => {
		it('returns only root-level tags', () => {
			const posts = makePosts([['개발/React/Next.js'], ['디자인/UI'], ['TIL']]);
			expect(getRootTags(posts)).toEqual(['TIL', '개발', '디자인']);
		});
	});

	describe('tagToSlug / slugToTag', () => {
		it('round-trips a Korean hierarchical tag', () => {
			const tag = '개발/React/Next.js';
			expect(slugToTag(tagToSlug(tag))).toBe(tag);
		});
	});
});
