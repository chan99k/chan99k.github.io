'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogPost } from '@/types';
import { BlogPostCard } from './BlogPostCard';
import { BlogFilters } from './BlogFilters';
import { Pagination } from './Pagination';

interface BlogPostListProps {
  posts: BlogPost[];
}

const POSTS_PER_PAGE = 6;

export function BlogPostList({ posts }: BlogPostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // URL 매개변수에서 상태 초기화
  useEffect(() => {
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    setSelectedCategory(category);
    setSelectedTag(tag);
    setSearchQuery(search);
    setCurrentPage(page);
  }, [searchParams]);

  // 고유한 카테고리와 태그 추출
  const categories = useMemo(() => {
    const categorySet = new Set(posts.map(post => post.category));
    return Array.from(categorySet).sort();
  }, [posts]);

  const tags = useMemo(() => {
    const tagSet = new Set(posts.flatMap(post => post.tags));
    return Array.from(tagSet).sort();
  }, [posts]);

  // 현재 필터를 기반으로 포스트 필터링
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  // 필터링된 포스트 페이지네이션
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // 필터 변경 시 URL 업데이트
  const updateURL = (newCategory?: string, newTag?: string, newSearch?: string, newPage?: number) => {
    const params = new URLSearchParams();
    
    if (newCategory) params.set('category', newCategory);
    if (newTag) params.set('tag', newTag);
    if (newSearch) params.set('search', newSearch);
    if (newPage && newPage > 1) params.set('page', newPage.toString());

    const queryString = params.toString();
    const newURL = queryString ? `/blog?${queryString}` : '/blog';
    
    router.push(newURL, { scroll: false });
  };

  const handleCategoryChange = (category: string | undefined) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL(category, selectedTag, searchQuery, 1);
  };

  const handleTagChange = (tag: string | undefined) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    updateURL(selectedCategory, tag, searchQuery, 1);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
    updateURL(selectedCategory, selectedTag, search, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(selectedCategory, selectedTag, searchQuery, page);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/blog');
  };

  const hasActiveFilters = !!(selectedCategory || selectedTag || searchQuery);

  return (
    <div className="space-y-8">
      <BlogFilters
        categories={categories}
        tags={tags}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        searchQuery={searchQuery}
        onCategoryChange={handleCategoryChange}
        onTagChange={handleTagChange}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 결과 요약 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredPosts.length === 0 ? (
            'No posts found'
          ) : (
            <>
              Showing {((currentPage - 1) * POSTS_PER_PAGE) + 1}-{Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
            </>
          )}
        </p>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* 블로그 포스트 그리드 */}
      {paginatedPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No posts match your current filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Clear filters to see all posts
            </button>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}