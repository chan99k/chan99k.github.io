import { BlogPost, RelatedPostsConfig } from '@/types';

export class RelatedPostsEngine {
  private static defaultConfig: RelatedPostsConfig = {
    maxRelated: 3,
    tagWeight: 0.4,
    categoryWeight: 0.3,
    dateWeight: 0.3,
    minScore: 0.1,
  };

  /**
   * Calculate similarity score between two posts
   */
  private static calculateSimilarity(
    post1: BlogPost,
    post2: BlogPost,
    config: RelatedPostsConfig
  ): number {
    let score = 0;

    // Tag similarity
    const commonTags = post1.tags.filter(tag => post2.tags.includes(tag));
    const totalTags = new Set([...post1.tags, ...post2.tags]).size;
    const tagSimilarity = totalTags > 0 ? commonTags.length / totalTags : 0;
    score += tagSimilarity * config.tagWeight;

    // Category similarity
    const categorySimilarity = post1.category === post2.category ? 1 : 0;
    score += categorySimilarity * config.categoryWeight;

    // Date proximity (posts closer in time are more related)
    const date1 = new Date(post1.date).getTime();
    const date2 = new Date(post2.date).getTime();
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    const dateSimilarity = Math.max(0, 1 - daysDiff / 365); // Normalize to 1 year
    score += dateSimilarity * config.dateWeight;

    return score;
  }

  /**
   * Get related posts for a given post
   */
  static getRelatedPosts(
    currentPost: BlogPost,
    allPosts: BlogPost[],
    config: RelatedPostsConfig = this.defaultConfig
  ): BlogPost[] {
    // Filter out the current post and drafts
    const candidatePosts = allPosts.filter(
      post => post.slug !== currentPost.slug && !post.draft
    );

    // Calculate similarity scores
    const scoredPosts = candidatePosts.map(post => ({
      post,
      score: this.calculateSimilarity(currentPost, post, config),
    }));

    // Filter by minimum score and sort by score
    const relatedPosts = scoredPosts
      .filter(({ score }) => score >= config.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxRelated)
      .map(({ post }) => post);

    return relatedPosts;
  }

  /**
   * Get related posts with explicit relationships
   */
  static getExplicitlyRelatedPosts(
    currentPost: BlogPost,
    allPosts: BlogPost[]
  ): BlogPost[] {
    if (!currentPost.relatedPosts || currentPost.relatedPosts.length === 0) {
      return [];
    }

    return allPosts.filter(
      post => 
        currentPost.relatedPosts!.includes(post.slug) && 
        !post.draft
    );
  }

  /**
   * Get combined related posts (explicit + algorithmic)
   */
  static getCombinedRelatedPosts(
    currentPost: BlogPost,
    allPosts: BlogPost[],
    config: RelatedPostsConfig = this.defaultConfig
  ): BlogPost[] {
    const explicitRelated = this.getExplicitlyRelatedPosts(currentPost, allPosts);
    const algorithmicRelated = this.getRelatedPosts(currentPost, allPosts, config);

    // Combine and deduplicate
    const combined = new Map<string, BlogPost>();
    
    // Add explicit relationships first (higher priority)
    explicitRelated.forEach(post => combined.set(post.slug, post));
    
    // Add algorithmic relationships if we haven't reached the limit
    algorithmicRelated.forEach(post => {
      if (combined.size < config.maxRelated && !combined.has(post.slug)) {
        combined.set(post.slug, post);
      }
    });

    return Array.from(combined.values());
  }

  /**
   * Get posts related by project
   */
  static getProjectRelatedPosts(
    currentPost: BlogPost,
    allPosts: BlogPost[]
  ): BlogPost[] {
    if (!currentPost.relatedProject) return [];

    return allPosts.filter(
      post => 
        post.relatedProject === currentPost.relatedProject &&
        post.slug !== currentPost.slug &&
        !post.draft
    );
  }

  /**
   * Get posts in the same series
   */
  static getSeriesRelatedPosts(
    currentPost: BlogPost,
    allPosts: BlogPost[]
  ): BlogPost[] {
    if (!currentPost.series) return [];

    return allPosts.filter(
      post => 
        post.series?.id === currentPost.series!.id &&
        post.slug !== currentPost.slug &&
        !post.draft
    ).sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
  }

  /**
   * Get comprehensive related posts with different relationship types
   */
  static getComprehensiveRelatedPosts(
    currentPost: BlogPost,
    allPosts: BlogPost[],
    config: RelatedPostsConfig = this.defaultConfig
  ): {
    series: BlogPost[];
    project: BlogPost[];
    explicit: BlogPost[];
    algorithmic: BlogPost[];
    combined: BlogPost[];
  } {
    return {
      series: this.getSeriesRelatedPosts(currentPost, allPosts),
      project: this.getProjectRelatedPosts(currentPost, allPosts),
      explicit: this.getExplicitlyRelatedPosts(currentPost, allPosts),
      algorithmic: this.getRelatedPosts(currentPost, allPosts, config),
      combined: this.getCombinedRelatedPosts(currentPost, allPosts, config),
    };
  }
}