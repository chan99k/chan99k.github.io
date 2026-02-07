import type { Config } from '@netlify/functions';
import { Resend } from 'resend';
import type { BlogPost } from './utils/leitner.js';
import { selectPostForReview, advanceBox } from './utils/leitner.js';
import { getReviewHistory, updatePostState } from './utils/review-storage.js';
import { buildSubject, buildHtml } from './utils/email-template.js';

export default async () => {
	const apiKey = process.env.RESEND_API_KEY;
	const recipientEmail = process.env.REVIEW_EMAIL_TO;
	const siteUrl = (process.env.SITE_URL || 'https://chan99k.github.io').replace(/\/$/, '');

	if (!apiKey || !recipientEmail) {
		console.log('Missing RESEND_API_KEY or REVIEW_EMAIL_TO. Skipping.');
		return new Response(JSON.stringify({ skipped: true, reason: 'missing config' }));
	}

	try {
		const posts = await fetchBlogPosts(siteUrl);

		if (posts.length === 0) {
			console.log('No blog posts found. Skipping.');
			return new Response(JSON.stringify({ skipped: true, reason: 'no posts' }));
		}

		const history = await getReviewHistory();
		const selected = selectPostForReview(posts, history);

		if (!selected) {
			console.log('No posts due for review today.');
			return new Response(JSON.stringify({ skipped: true, reason: 'nothing due' }));
		}

		const newState = advanceBox(history[selected.slug], selected);

		const resend = new Resend(apiKey);
		const { data, error } = await resend.emails.send({
			from: `chan99k Blog <noreply@${new URL(siteUrl).hostname}>`,
			to: [recipientEmail],
			subject: buildSubject(selected),
			html: buildHtml({ post: selected, state: newState, siteUrl }),
		});

		if (error) {
			throw new Error(error.message);
		}

		await updatePostState(selected.slug, newState);

		console.log(`Review email sent: "${selected.title}" (Box ${newState.box}, ${newState.timesReviewed}x) id=${data?.id}`);

		return new Response(
			JSON.stringify({
				success: true,
				emailId: data?.id,
				post: selected.slug,
				box: newState.box,
			}),
		);
	} catch (err) {
		console.error('Review email error:', err);
		return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
	}
};

async function fetchBlogPosts(siteUrl: string): Promise<BlogPost[]> {
	const res = await fetch(`${siteUrl}/search.json`);

	if (!res.ok) {
		throw new Error(`Failed to fetch search.json: ${res.status}`);
	}

	const items: { title: string; description: string; slug: string; type: string }[] = await res.json();

	return items
		.filter((item) => item.type === 'Blog')
		.map((item) => ({
			slug: item.slug.replace(/^\/blog\//, ''),
			title: item.title,
			description: item.description,
		}));
}

export const config: Config = {
	schedule: '0 0 * * *',
};
