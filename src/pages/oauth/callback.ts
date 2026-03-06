import type { APIRoute } from 'astro';

export const prerender = false;

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

export const GET: APIRoute = async ({ url }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		return new Response('Missing code parameter', { status: 400 });
	}

	const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
	const clientSecret = import.meta.env.OAUTH_GITHUB_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		return new Response('OAuth credentials not configured', { status: 500 });
	}

	const response = await fetch(GITHUB_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
		}),
	});

	const data = await response.json();

	if (data.error) {
		return new Response(
			renderMessage('error', data.error_description || data.error),
			{ headers: { 'Content-Type': 'text/html' } },
		);
	}

	return new Response(
		renderMessage('success', JSON.stringify({ token: data.access_token, provider: 'github' })),
		{ headers: { 'Content-Type': 'text/html' } },
	);
};

function renderMessage(type: 'success' | 'error', content: string): string {
	const allowedOrigin = import.meta.env.SITE || 'https://blog.chan99k.dev';
	return `<!doctype html>
<html>
<body>
<script>
(function() {
  var ALLOWED = '${allowedOrigin}';
  function receiveMessage(e) {
    if (e.origin !== ALLOWED) return;
    window.opener.postMessage(
      'authorization:github:${type}:${content}',
      ALLOWED
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", ALLOWED);
})();
</script>
</body>
</html>`;
}
