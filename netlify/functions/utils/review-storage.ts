import { getStore } from '@netlify/blobs';
import type { PostReviewState } from './leitner.js';

const STORE_NAME = 'blog-reviews';
const HISTORY_KEY = 'post-history';

export type ReviewHistory = Record<string, PostReviewState>;

export async function getReviewHistory(): Promise<ReviewHistory> {
	const store = getStore(STORE_NAME);
	const data = await store.get(HISTORY_KEY, { type: 'json' });
	return (data as ReviewHistory) || {};
}

export async function saveReviewHistory(history: ReviewHistory): Promise<void> {
	const store = getStore(STORE_NAME);
	await store.setJSON(HISTORY_KEY, history);
}

export async function updatePostState(slug: string, state: PostReviewState): Promise<void> {
	const history = await getReviewHistory();
	history[slug] = state;
	await saveReviewHistory(history);
}
