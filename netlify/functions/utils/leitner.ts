export interface PostReviewState {
	slug: string;
	title: string;
	box: 1 | 2 | 3;
	lastSeen: string;
	timesReviewed: number;
}

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
}

const BOX_INTERVALS: Record<1 | 2 | 3, number> = {
	1: 1,
	2: 3,
	3: 7,
};

export function isDueForReview(state: PostReviewState, now: Date = new Date()): boolean {
	const lastSeen = new Date(state.lastSeen);
	const daysSince = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
	return daysSince >= BOX_INTERVALS[state.box];
}

export function selectPostForReview(
	posts: BlogPost[],
	history: Record<string, PostReviewState>,
	now: Date = new Date(),
): BlogPost | null {
	const unseen: BlogPost[] = [];
	const due: { post: BlogPost; box: number }[] = [];

	for (const post of posts) {
		const state = history[post.slug];
		if (!state) {
			unseen.push(post);
		} else if (isDueForReview(state, now)) {
			due.push({ post, box: state.box });
		}
	}

	if (unseen.length > 0) {
		return unseen[Math.floor(Math.random() * unseen.length)];
	}

	if (due.length > 0) {
		due.sort((a, b) => a.box - b.box);
		return due[0].post;
	}

	return null;
}

export function advanceBox(state: PostReviewState | undefined, post: BlogPost): PostReviewState {
	if (!state) {
		return {
			slug: post.slug,
			title: post.title,
			box: 1,
			lastSeen: new Date().toISOString(),
			timesReviewed: 1,
		};
	}

	return {
		...state,
		title: post.title,
		box: Math.min(state.box + 1, 3) as 1 | 2 | 3,
		lastSeen: new Date().toISOString(),
		timesReviewed: state.timesReviewed + 1,
	};
}

export function getNextReviewDays(box: 1 | 2 | 3): number {
	return BOX_INTERVALS[Math.min(box + 1, 3) as 1 | 2 | 3];
}
