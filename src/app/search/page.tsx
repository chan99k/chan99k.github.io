import { Metadata } from 'next';
import { getBlogPosts, getRestaurantReviews, getPortfolioData } from '@/lib/content';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';

export const metadata: Metadata = {
  title: 'Search - Chan99K',
  description: 'Search across blog posts, portfolio projects, and restaurant reviews. Find exactly what you\'re looking for with advanced filtering and sorting options.',
  keywords: ['search', 'blog', 'portfolio', 'restaurant reviews', 'filter', 'find content'],
  openGraph: {
    title: 'Advanced Search - Chan99K',
    description: 'Search across all content types with advanced filtering and sorting capabilities.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Advanced Search - Chan99K',
    description: 'Search across all content types with advanced filtering and sorting capabilities.',
  },
};

export default async function SearchPage() {
  // Load all content for search
  const [blogPosts, restaurantReviews, portfolioData] = await Promise.all([
    getBlogPosts(),
    getRestaurantReviews(),
    getPortfolioData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Advanced Search
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search across blog posts, portfolio projects, and restaurant reviews. 
            Use advanced filters to find exactly what you're looking for.
          </p>
        </div>

        {/* Search Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {blogPosts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📝 Blog Posts
            </div>
          </div>
          
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {portfolioData?.projects.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💼 Portfolio Projects
            </div>
          </div>
          
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {restaurantReviews.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              🍽️ Restaurant Reviews
            </div>
          </div>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch
          blogPosts={blogPosts}
          restaurantReviews={restaurantReviews}
          portfolioData={portfolioData}
          showAnalytics={true}
          placeholder="Search across all content types..."
        />

        {/* Search Tips */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Search Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Basic Search
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Type keywords to search across all content</li>
                <li>• Search is case-insensitive</li>
                <li>• Multiple words are searched as separate terms</li>
                <li>• Results are ranked by relevance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Advanced Features
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Use filters to narrow down results</li>
                <li>• Filter by content type, date, tags, and more</li>
                <li>• Sort by relevance, date, title, or rating</li>
                <li>• View search analytics and popular terms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Popular Content Categories */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Popular Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Extract popular tags from all content */}
            {(() => {
              const allTags = new Set<string>();
              
              blogPosts.forEach(post => {
                post.tags.forEach(tag => allTags.add(tag));
              });
              
              restaurantReviews.forEach(review => {
                review.tags.forEach(tag => allTags.add(tag));
              });

              if (portfolioData) {
                portfolioData.projects.forEach(project => {
                  project.techStack.forEach(tech => allTags.add(tech));
                });
              }

              return Array.from(allTags).slice(0, 15).map(tag => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"

                >
                  {tag}
                </button>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}