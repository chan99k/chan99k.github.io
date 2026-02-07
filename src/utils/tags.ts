export interface ParsedTag {
	segments: string[];
	full: string;
}

export interface TagTreeNode {
	count: number;
	children: Record<string, TagTreeNode>;
}

export function parseTag(tag: string): ParsedTag {
	const segments = tag.split('/').filter(Boolean);
	return { segments, full: tag };
}

export function expandTag(tag: string): string[] {
	const segments = tag.split('/').filter(Boolean);
	const expanded: string[] = [];
	for (let i = 1; i <= segments.length; i++) {
		expanded.push(segments.slice(0, i).join('/'));
	}
	return expanded;
}

export function buildTagTree(posts: { data: { tags: string[] } }[]): TagTreeNode {
	const root: TagTreeNode = { count: 0, children: {} };

	for (const post of posts) {
		const seen = new Set<string>();
		for (const tag of post.data.tags) {
			for (const expanded of expandTag(tag)) {
				if (seen.has(expanded)) continue;
				seen.add(expanded);

				const segments = expanded.split('/');
				let node = root;
				for (const segment of segments) {
					if (!node.children[segment]) {
						node.children[segment] = { count: 0, children: {} };
					}
					node = node.children[segment];
				}
				node.count++;
			}
		}
	}

	return root;
}

export function getPostsByTag(
	posts: { data: { tags: string[] } }[],
	tag: string,
): typeof posts {
	return posts.filter((post) =>
		post.data.tags.some((t) => t === tag || t.startsWith(tag + '/')),
	);
}

export function getAllTags(posts: { data: { tags: string[] } }[]): string[] {
	const tagSet = new Set<string>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			for (const expanded of expandTag(tag)) {
				tagSet.add(expanded);
			}
		}
	}
	return [...tagSet].sort();
}

export function getRootTags(posts: { data: { tags: string[] } }[]): string[] {
	const tree = buildTagTree(posts);
	return Object.keys(tree.children).sort();
}

export function tagToSlug(tag: string): string {
	return tag
		.split('/')
		.map((s) => encodeURIComponent(s))
		.join('/');
}

export function slugToTag(slug: string): string {
	return slug
		.split('/')
		.map((s) => decodeURIComponent(s))
		.join('/');
}
