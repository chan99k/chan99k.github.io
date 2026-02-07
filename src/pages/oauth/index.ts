import type { APIRoute } from 'astro';

export const prerender = false;

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

export const GET: APIRoute = ({ url }) => {
	const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;

	if (!clientId) {
		return new Response('OAUTH_GITHUB_CLIENT_ID is not configured', { status: 500 });
	}

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: `${url.origin}/oauth/callback`,
		scope: 'repo,user',
		state: crypto.randomUUID(),
	});

	return Response.redirect(`${GITHUB_AUTH_URL}?${params}`, 302);
};
