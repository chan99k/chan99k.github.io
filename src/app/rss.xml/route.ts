import { getBlogPosts } from '@/lib/content';
import { SITE_CONFIG } from '@/lib/constants';

export const dynamic = 'force-static';

export async function GET() {
  const posts = await getBlogPosts();
  
  // Filter out draft posts in production
  const publishedPosts = posts.filter(post => !post.draft);
  
  const rssItems = publishedPosts
    .slice(0, 20) // Limit to 20 most recent posts
    .map(post => {
      const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${SITE_CONFIG.author.email} (${post.author})</author>
      <category><![CDATA[${post.category}]]></category>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('')}
      ${post.coverImage ? `<enclosure url="${SITE_CONFIG.url}${post.coverImage}" type="image/jpeg" />` : ''}
    </item>`;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${SITE_CONFIG.name}]]></title>
    <description><![CDATA[${SITE_CONFIG.description}]]></description>
    <link>${SITE_CONFIG.url}</link>
    <language>en-us</language>
    <managingEditor>${SITE_CONFIG.author.email} (${SITE_CONFIG.author.name})</managingEditor>
    <webMaster>${SITE_CONFIG.author.email} (${SITE_CONFIG.author.name})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_CONFIG.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js Personal Website</generator>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}