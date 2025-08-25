'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Bookmark, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Calendar,
  Tag,
  FolderOpen,
  BookOpen
} from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkedPost } from '@/types';
import { formatDate } from '@/lib/utils';

export function BookmarksPage() {
  const { 
    bookmarks, 
    bookmarksByCategory, 
    removeBookmark, 
    searchBookmarks,
    exportBookmarks,
    importBookmarks,
    totalBookmarks 
  } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchBookmarks(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return b.bookmarkedAt.getTime() - a.bookmarkedAt.getTime();
      }
    });

    return filtered;
  }, [bookmarks, searchQuery, selectedCategory, sortBy, searchBookmarks]);

  const categories = Object.keys(bookmarksByCategory);

  const handleExport = () => {
    const data = exportBookmarks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importBookmarks(content);
      if (success) {
        alert('Bookmarks imported successfully!');
      } else {
        alert('Failed to import bookmarks. Please check the file format.');
      }
    };
    reader.readAsText(file);
    setShowImportDialog(false);
  };

  if (totalBookmarks === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Bookmarks Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start bookmarking your favorite blog posts to see them here.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse Blog Posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Bookmarks
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your saved blog posts ({totalBookmarks} total)
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category} ({bookmarksByCategory[category].length})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'category')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Export bookmarks"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Import bookmarks"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookmarkCard
                  bookmark={bookmark}
                  onRemove={() => removeBookmark(bookmark.slug)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No bookmarks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Import Bookmarks</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a JSON file containing exported bookmarks.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BookmarkCardProps {
  bookmark: BookmarkedPost;
  onRemove: () => void;
}

function BookmarkCard({ bookmark, onRemove }: BookmarkCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            href={`/blog/${bookmark.slug}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
              {bookmark.title}
            </h3>
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Bookmarked {formatDate(bookmark.bookmarkedAt.toISOString())}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              <span>{bookmark.category}</span>
            </div>
          </div>

          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {bookmark.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{bookmark.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onRemove}
          className="flex items-center gap-1 px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Remove bookmark"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}