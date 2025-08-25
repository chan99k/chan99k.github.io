import { BlogPost, BlogSeries, BlogSeriesPost } from '@/types';

export class BlogSeriesManager {
  /**
   * Extract series information from blog posts
   */
  static extractSeries(posts: BlogPost[]): BlogSeries[] {
    const seriesMap = new Map<string, BlogSeries>();

    posts.forEach(post => {
      if (post.series) {
        const seriesId = post.series.id;
        
        if (!seriesMap.has(seriesId)) {
          seriesMap.set(seriesId, {
            ...post.series,
            posts: [],
          });
        }

        const series = seriesMap.get(seriesId)!;
        series.posts.push({
          slug: post.slug,
          title: post.title,
          order: post.seriesOrder || 0,
          published: !post.draft,
        });
      }
    });

    // Sort posts within each series by order
    seriesMap.forEach(series => {
      series.posts.sort((a, b) => a.order - b.order);
      series.totalParts = series.posts.length;
    });

    return Array.from(seriesMap.values());
  }

  /**
   * Get series information for a specific post
   */
  static getPostSeries(post: BlogPost, allPosts: BlogPost[]): BlogSeries | null {
    if (!post.series) return null;

    const seriesPosts = allPosts
      .filter(p => p.series?.id === post.series!.id)
      .map(p => ({
        slug: p.slug,
        title: p.title,
        order: p.seriesOrder || 0,
        published: !p.draft,
      }))
      .sort((a, b) => a.order - b.order);

    return {
      ...post.series,
      posts: seriesPosts,
      totalParts: seriesPosts.length,
    };
  }

  /**
   * Get navigation info for a post within a series
   */
  static getSeriesNavigation(post: BlogPost, allPosts: BlogPost[]) {
    const series = this.getPostSeries(post, allPosts);
    if (!series) return null;

    const currentIndex = series.posts.findIndex(p => p.slug === post.slug);
    if (currentIndex === -1) return null;

    const previousPost = currentIndex > 0 ? series.posts[currentIndex - 1] : null;
    const nextPost = currentIndex < series.posts.length - 1 ? series.posts[currentIndex + 1] : null;

    return {
      series,
      currentIndex,
      currentOrder: currentIndex + 1,
      totalParts: series.posts.length,
      previousPost,
      nextPost,
      progress: ((currentIndex + 1) / series.posts.length) * 100,
    };
  }

  /**
   * Validate series configuration
   */
  static validateSeries(posts: BlogPost[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const seriesMap = new Map<string, BlogPost[]>();

    // Group posts by series
    posts.forEach(post => {
      if (post.series) {
        const seriesId = post.series.id;
        if (!seriesMap.has(seriesId)) {
          seriesMap.set(seriesId, []);
        }
        seriesMap.get(seriesId)!.push(post);
      }
    });

    // Validate each series
    seriesMap.forEach((seriesPosts, seriesId) => {
      // Check for duplicate orders
      const orders = seriesPosts.map(p => p.seriesOrder || 0);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        errors.push(`Series "${seriesId}" has duplicate order numbers`);
      }

      // Check for missing orders
      const sortedOrders = [...uniqueOrders].sort((a, b) => a - b);
      for (let i = 0; i < sortedOrders.length - 1; i++) {
        if (sortedOrders[i + 1] - sortedOrders[i] > 1) {
          warnings.push(`Series "${seriesId}" has gaps in order numbers`);
          break;
        }
      }

      // Check if series info is consistent across posts
      const seriesInfos = seriesPosts.map(p => p.series!);
      const firstInfo = seriesInfos[0];
      
      seriesInfos.forEach((info, index) => {
        if (info.title !== firstInfo.title) {
          errors.push(`Series "${seriesId}" has inconsistent titles in post ${seriesPosts[index].slug}`);
        }
        if (info.description !== firstInfo.description) {
          warnings.push(`Series "${seriesId}" has inconsistent descriptions in post ${seriesPosts[index].slug}`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}