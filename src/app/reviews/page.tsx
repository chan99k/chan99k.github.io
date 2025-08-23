import { Metadata } from 'next';
import { getRestaurantReviews } from '@/lib/content';
import { generateRestaurantReviewsMetadata } from '@/lib/seo';

export const metadata: Metadata = generateRestaurantReviewsMetadata();

export default async function ReviewsPage() {
  const reviews = await getRestaurantReviews();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Restaurant Reviews
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Personal restaurant reviews and food recommendations with photos and ratings.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No restaurant reviews available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {review.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {review.location.address}
                  </p>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {review.review.substring(0, 150)}...
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}