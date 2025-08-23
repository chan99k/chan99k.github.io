import { Metadata } from 'next';
import { getRestaurantReviews } from '@/lib/content';
import { generateRestaurantReviewsMetadata } from '@/lib/seo';
import { RestaurantReviewsList } from '@/components/reviews';

export const metadata: Metadata = generateRestaurantReviewsMetadata();

export default async function ReviewsPage() {
  const reviews = await getRestaurantReviews();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            맛집 리뷰
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            개인적으로 방문한 맛집들의 솔직한 리뷰와 추천 메뉴, 사진을 공유합니다.
          </p>
        </div>

        <RestaurantReviewsList reviews={reviews} />
      </div>
    </div>
  );
}