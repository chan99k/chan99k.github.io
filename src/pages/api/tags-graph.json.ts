import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getGraphData } from '../../utils/tags';

export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog', ({ data }) => data.draft !== true)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const graphData = getGraphData(posts);

	return new Response(JSON.stringify(graphData), {
		headers: { 'Content-Type': 'application/json' },
	});
};
