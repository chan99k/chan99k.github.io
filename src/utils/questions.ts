export interface QuestionEntry {
	slug: string;
	data: {
		title: string;
		category: string;
		difficulty: 'junior' | 'mid' | 'senior';
		tags: string[];
		relatedPosts: string[];
		[key: string]: unknown;
	};
}

export interface PostEntry {
	slug: string;
	data: {
		title: string;
		tags: string[];
		[key: string]: unknown;
	};
}

export function filterByCategory<T extends QuestionEntry>(
	questions: T[],
	category: string,
): T[] {
	if (category === 'all') return questions;
	return questions.filter((q) => q.data.category === category);
}

export function getRandomQuestion<T extends QuestionEntry>(
	questions: T[],
	excludeSlug?: string,
): T {
	const candidates = excludeSlug
		? questions.filter((q) => q.slug !== excludeSlug)
		: questions;
	const pool = candidates.length > 0 ? candidates : questions;
	return pool[Math.floor(Math.random() * pool.length)];
}

export function matchRelatedPosts(
	question: QuestionEntry,
	posts: PostEntry[],
	maxResults = 5,
): PostEntry[] {
	const explicit = new Set(question.data.relatedPosts);
	const explicitPosts = posts.filter((p) => explicit.has(p.slug));

	const qTags = new Set(question.data.tags.map((t) => t.toLowerCase()));
	if (qTags.size === 0) return explicitPosts.slice(0, maxResults);

	const explicitSlugs = new Set(explicitPosts.map((p) => p.slug));
	const tagMatched = posts
		.filter((p) => !explicitSlugs.has(p.slug))
		.map((p) => {
			// Extract tier2/tier3 from PARA tags (skip tier1)
			const segments = p.data.tags.flatMap((t) =>
				t.split('/').slice(1).map((s) => s.toLowerCase()),
			);
			const overlap = segments.filter((s) => qTags.has(s)).length;
			return { post: p, overlap };
		})
		.filter(({ overlap }) => overlap > 0)
		.sort((a, b) => b.overlap - a.overlap)
		.map(({ post }) => post);

	return [...explicitPosts, ...tagMatched].slice(0, maxResults);
}

export function getCategories(questions: QuestionEntry[]): string[] {
	return [...new Set(questions.map((q) => q.data.category))].sort();
}
