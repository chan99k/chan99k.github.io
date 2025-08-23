import { MetadataRoute } from 'next';
import { getBlogPosts, getRestaurantReviews } from '@/lib/content';
import { SITE_CONFIG } from '@/lib/constants';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Get all blog posts and restaurant reviews
  const [blogPosts, restaurantReviews] = await Promise.all([
    getBlogPosts(),
    getRestaurantReviews(),
  ]);

  // Filter out draft posts
  const publishedPosts = blogPosts.filter(post => !post.draft);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified:
        publishedPosts.length > 0
          ? new Date(publishedPosts[0].date)
          : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified:
        restaurantReviews.length > 0
          ? new Date(restaurantReviews[0].visitDate)
          : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = publishedPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Restaurant review pages (if we have individual review pages)
  const reviewPages: MetadataRoute.Sitemap = restaurantReviews.map(review => ({
    url: `${baseUrl}/reviews/${review.id}`,
    lastModified: new Date(review.visitDate),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages, ...reviewPages];
}
