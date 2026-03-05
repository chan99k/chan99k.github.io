import { getTagColor as resolveTagColor } from '../data/tag-taxonomy';

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

/* ── Graph data generation ── */

export interface GraphNode {
	id: string;
	tier: number;
	count: number;
	color: string;
}

export interface GraphEdge {
	source: string;
	target: string;
	type: 'hierarchy' | 'cooccurrence';
}

export interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
}

export function getGraphData(posts: { data: { tags: string[] } }[]): GraphData {
	const tagCounts = new Map<string, number>();
	const cooccurrences = new Map<string, Set<string>>();

	// Count tags and track co-occurrences per post
	for (const post of posts) {
		const expandedTags = new Set<string>();
		for (const tag of post.data.tags) {
			for (const expanded of expandTag(tag)) {
				expandedTags.add(expanded);
				tagCounts.set(expanded, (tagCounts.get(expanded) ?? 0) + 1);
			}
		}

		// Co-occurrence: leaf-level tags that share a post but aren't in a parent-child relationship
		const leafTags = post.data.tags.map((t) => expandTag(t));
		for (let i = 0; i < leafTags.length; i++) {
			for (let j = i + 1; j < leafTags.length; j++) {
				const leafA = leafTags[i][leafTags[i].length - 1];
				const leafB = leafTags[j][leafTags[j].length - 1];
				if (!leafA.startsWith(leafB + '/') && !leafB.startsWith(leafA + '/')) {
					const key = [leafA, leafB].sort().join('||');
					if (!cooccurrences.has(key)) {
						cooccurrences.set(key, new Set());
					}
					cooccurrences.get(key)!.add(post.data.tags.join(','));
				}
			}
		}
	}

	// Build nodes
	const nodes: GraphNode[] = [...tagCounts.entries()].map(([id, count]) => ({
		id,
		tier: id.split('/').length,
		count,
		color: resolveTagColor(id),
	}));

	// Build hierarchy edges
	const edges: GraphEdge[] = [];
	const nodeIds = new Set(nodes.map((n) => n.id));

	for (const nodeId of nodeIds) {
		const segments = nodeId.split('/');
		if (segments.length > 1) {
			const parentId = segments.slice(0, -1).join('/');
			if (nodeIds.has(parentId)) {
				edges.push({ source: parentId, target: nodeId, type: 'hierarchy' });
			}
		}
	}

	// Build co-occurrence edges
	for (const [key] of cooccurrences) {
		const [source, target] = key.split('||');
		if (nodeIds.has(source) && nodeIds.has(target)) {
			edges.push({ source, target, type: 'cooccurrence' });
		}
	}

	return { nodes, edges };
}
