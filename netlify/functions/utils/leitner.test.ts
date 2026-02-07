import { describe, it, expect } from 'vitest';
import {
	isDueForReview,
	selectPostForReview,
	advanceBox,
	getNextReviewDays,
	type PostReviewState,
	type BlogPost,
} from './leitner';

const makePost = (slug: string): BlogPost => ({
	slug,
	title: `Post ${slug}`,
	description: `Description for ${slug}`,
});

const makeState = (
	slug: string,
	box: 1 | 2 | 3,
	daysAgo: number,
): PostReviewState => ({
	slug,
	title: `Post ${slug}`,
	box,
	lastSeen: new Date(Date.now() - daysAgo * 86400000).toISOString(),
	timesReviewed: 1,
});

describe('leitner', () => {
	describe('isDueForReview', () => {
		it('Box 1 is due after 1 day', () => {
			expect(isDueForReview(makeState('a', 1, 1))).toBe(true);
			expect(isDueForReview(makeState('a', 1, 0))).toBe(false);
		});

		it('Box 2 is due after 3 days', () => {
			expect(isDueForReview(makeState('a', 2, 3))).toBe(true);
			expect(isDueForReview(makeState('a', 2, 2))).toBe(false);
		});

		it('Box 3 is due after 7 days', () => {
			expect(isDueForReview(makeState('a', 3, 7))).toBe(true);
			expect(isDueForReview(makeState('a', 3, 6))).toBe(false);
		});
	});

	describe('selectPostForReview', () => {
		const posts = [makePost('a'), makePost('b'), makePost('c')];

		it('returns unseen post first', () => {
			const history = {
				a: makeState('a', 1, 0),
			};
			const result = selectPostForReview(posts, history);
			expect(result).not.toBeNull();
			expect(['b', 'c']).toContain(result!.slug);
		});

		it('returns null when nothing is due', () => {
			const history = {
				a: makeState('a', 3, 0),
				b: makeState('b', 3, 0),
				c: makeState('c', 3, 0),
			};
			expect(selectPostForReview(posts, history)).toBeNull();
		});

		it('prioritizes lower box when multiple are due', () => {
			const history = {
				a: makeState('a', 1, 2),
				b: makeState('b', 3, 8),
				c: makeState('c', 2, 4),
			};
			const result = selectPostForReview(posts, history);
			expect(result!.slug).toBe('a');
		});
	});

	describe('advanceBox', () => {
		it('creates new state for unseen post', () => {
			const post = makePost('new');
			const state = advanceBox(undefined, post);
			expect(state.box).toBe(1);
			expect(state.timesReviewed).toBe(1);
		});

		it('advances box from 1 to 2', () => {
			const state = advanceBox(makeState('a', 1, 1), makePost('a'));
			expect(state.box).toBe(2);
			expect(state.timesReviewed).toBe(2);
		});

		it('caps at box 3', () => {
			const state = advanceBox(makeState('a', 3, 7), makePost('a'));
			expect(state.box).toBe(3);
		});
	});

	describe('getNextReviewDays', () => {
		it('returns correct intervals', () => {
			expect(getNextReviewDays(1)).toBe(3);
			expect(getNextReviewDays(2)).toBe(7);
			expect(getNextReviewDays(3)).toBe(7);
		});
	});
});
