import { ReadingProgress, BookmarkedPost, BlogPost } from '@/types';

export class ReadingProgressManager {
  private static readonly STORAGE_KEY = 'blog-reading-progress';
  private static readonly BOOKMARKS_KEY = 'blog-bookmarks';

  /**
   * Calculate reading time based on content
   */
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Calculate reading progress based on scroll position
   */
  static calculateScrollProgress(element: HTMLElement): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = element.scrollHeight - window.innerHeight;
    
    if (scrollHeight <= 0) return 100;
    
    const progress = (scrollTop / scrollHeight) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Save reading progress to localStorage
   */
  static saveReadingProgress(postSlug: string, progress: number): void {
    if (typeof window === 'undefined') return;

    try {
      const existingProgress = this.getReadingProgress();
      const updatedProgress: ReadingProgress = {
        postSlug,
        progress,
        lastReadAt: new Date(),
        completed: progress >= 95, // Consider 95% as completed
      };

      const newProgress = {
        ...existingProgress,
        [postSlug]: updatedProgress,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.warn('Failed to save reading progress:', error);
    }
  }

  /**
   * Get reading progress from localStorage
   */
  static getReadingProgress(): Record<string, ReadingProgress> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return {};

      const progress = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      Object.values(progress).forEach((item: any) => {
        if (item.lastReadAt) {
          item.lastReadAt = new Date(item.lastReadAt);
        }
      });

      return progress;
    } catch (error) {
      console.warn('Failed to load reading progress:', error);
      return {};
    }
  }

  /**
   * Get reading progress for a specific post
   */
  static getPostProgress(postSlug: string): ReadingProgress | null {
    const allProgress = this.getReadingProgress();
    return allProgress[postSlug] || null;
  }

  /**
   * Clear old reading progress (older than 30 days)
   */
  static cleanupOldProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const allProgress = this.getReadingProgress();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const cleanedProgress: Record<string, ReadingProgress> = {};
      
      Object.entries(allProgress).forEach(([slug, progress]) => {
        if (progress.lastReadAt > thirtyDaysAgo) {
          cleanedProgress[slug] = progress;
        }
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedProgress));
    } catch (error) {
      console.warn('Failed to cleanup reading progress:', error);
    }
  }

  /**
   * Get recently read posts
   */
  static getRecentlyReadPosts(limit: number = 5): ReadingProgress[] {
    const allProgress = this.getReadingProgress();
    
    return Object.values(allProgress)
      .sort((a, b) => b.lastReadAt.getTime() - a.lastReadAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get completed posts
   */
  static getCompletedPosts(): ReadingProgress[] {
    const allProgress = this.getReadingProgress();
    
    return Object.values(allProgress)
      .filter(progress => progress.completed)
      .sort((a, b) => b.lastReadAt.getTime() - a.lastReadAt.getTime());
  }
}

export class BookmarkManager {
  private static readonly BOOKMARKS_KEY = 'blog-bookmarks';

  /**
   * Add a post to bookmarks
   */
  static addBookmark(post: BlogPost): void {
    if (typeof window === 'undefined') return;

    try {
      const bookmarks = this.getBookmarks();
      const bookmark: BookmarkedPost = {
        slug: post.slug,
        title: post.title,
        bookmarkedAt: new Date(),
        tags: post.tags,
        category: post.category,
      };

      const updatedBookmarks = {
        ...bookmarks,
        [post.slug]: bookmark,
      };

      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.warn('Failed to add bookmark:', error);
    }
  }

  /**
   * Remove a post from bookmarks
   */
  static removeBookmark(postSlug: string): void {
    if (typeof window === 'undefined') return;

    try {
      const bookmarks = this.getBookmarks();
      delete bookmarks[postSlug];
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.warn('Failed to remove bookmark:', error);
    }
  }

  /**
   * Toggle bookmark status
   */
  static toggleBookmark(post: BlogPost): boolean {
    const isBookmarked = this.isBookmarked(post.slug);
    
    if (isBookmarked) {
      this.removeBookmark(post.slug);
      return false;
    } else {
      this.addBookmark(post);
      return true;
    }
  }

  /**
   * Check if a post is bookmarked
   */
  static isBookmarked(postSlug: string): boolean {
    const bookmarks = this.getBookmarks();
    return postSlug in bookmarks;
  }

  /**
   * Get all bookmarks
   */
  static getBookmarks(): Record<string, BookmarkedPost> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(this.BOOKMARKS_KEY);
      if (!stored) return {};

      const bookmarks = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      Object.values(bookmarks).forEach((bookmark: any) => {
        if (bookmark.bookmarkedAt) {
          bookmark.bookmarkedAt = new Date(bookmark.bookmarkedAt);
        }
      });

      return bookmarks;
    } catch (error) {
      console.warn('Failed to load bookmarks:', error);
      return {};
    }
  }

  /**
   * Get bookmarked posts as array
   */
  static getBookmarkedPosts(): BookmarkedPost[] {
    const bookmarks = this.getBookmarks();
    
    return Object.values(bookmarks)
      .sort((a, b) => b.bookmarkedAt.getTime() - a.bookmarkedAt.getTime());
  }

  /**
   * Get bookmarks by category
   */
  static getBookmarksByCategory(): Record<string, BookmarkedPost[]> {
    const bookmarks = this.getBookmarkedPosts();
    const byCategory: Record<string, BookmarkedPost[]> = {};

    bookmarks.forEach(bookmark => {
      if (!byCategory[bookmark.category]) {
        byCategory[bookmark.category] = [];
      }
      byCategory[bookmark.category].push(bookmark);
    });

    return byCategory;
  }

  /**
   * Search bookmarks
   */
  static searchBookmarks(query: string): BookmarkedPost[] {
    const bookmarks = this.getBookmarkedPosts();
    const lowercaseQuery = query.toLowerCase();

    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(lowercaseQuery) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      bookmark.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Export bookmarks
   */
  static exportBookmarks(): string {
    const bookmarks = this.getBookmarkedPosts();
    return JSON.stringify(bookmarks, null, 2);
  }

  /**
   * Import bookmarks
   */
  static importBookmarks(jsonData: string): boolean {
    try {
      const importedBookmarks = JSON.parse(jsonData) as BookmarkedPost[];
      const existingBookmarks = this.getBookmarks();

      importedBookmarks.forEach(bookmark => {
        existingBookmarks[bookmark.slug] = {
          ...bookmark,
          bookmarkedAt: new Date(bookmark.bookmarkedAt),
        };
      });

      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(existingBookmarks));
      return true;
    } catch (error) {
      console.warn('Failed to import bookmarks:', error);
      return false;
    }
  }
}