import type { BlogPost, PostReviewState } from './leitner.js';
import { getNextReviewDays } from './leitner.js';

interface EmailData {
	post: BlogPost;
	state: PostReviewState;
	siteUrl: string;
}

export function buildSubject(post: BlogPost): string {
	return `복습할 시간: ${post.title}`;
}

export function buildHtml({ post, state, siteUrl }: EmailData): string {
	const postUrl = `${siteUrl}/blog/${post.slug}/`;
	const nextDays = getNextReviewDays(state.box);

	return `<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

    <p style="font-size:12px;color:#a3a3a3;letter-spacing:2px;text-transform:uppercase;margin:0 0 40px;">
      chan99k 블로그 복습
    </p>

    <p style="font-size:14px;color:#a3a3a3;margin:0 0 8px;">오늘의 복습 글</p>

    <h1 style="font-size:28px;font-weight:700;color:#000000;margin:0 0 12px;line-height:1.3;">
      ${escapeHtml(post.title)}
    </h1>

    <p style="font-size:16px;color:#666666;line-height:1.6;margin:0 0 32px;">
      ${escapeHtml(post.description)}
    </p>

    <a href="${postUrl}"
       style="display:inline-block;padding:14px 28px;background:#FF4800;color:#ffffff;
              text-decoration:none;font-size:14px;font-weight:600;border-radius:4px;">
      다시 읽기
    </a>

    <hr style="border:none;border-top:1px solid #e4e4e4;margin:40px 0 20px;" />

    <p style="font-size:12px;color:#a3a3a3;margin:0;">
      Box ${state.box} &middot; ${state.timesReviewed}회째 복습 &middot; 다음 복습: ${nextDays}일 후
    </p>

  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
