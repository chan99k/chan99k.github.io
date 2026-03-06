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
): PostEntry[] {
	const explicit = new Set(question.data.relatedPosts);
	return posts.filter((p) => explicit.has(p.slug));
}

export function getCategories(questions: QuestionEntry[]): string[] {
	return [...new Set(questions.map((q) => q.data.category))].sort();
}
