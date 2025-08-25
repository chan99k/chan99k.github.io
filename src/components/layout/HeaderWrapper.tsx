import { getBlogPosts, getRestaurantReviews, getPortfolioData } from '@/lib/content';
import { HeaderWithSearch } from './HeaderWithSearch';

export async function HeaderWrapper() {
  // Load all content for search functionality
  const [blogPosts, restaurantReviews, portfolioData] = await Promise.all([
    getBlogPosts(),
    getRestaurantReviews(),
    getPortfolioData(),
  ]);

  return (
    <HeaderWithSearch
      blogPosts={blogPosts}
      restaurantReviews={restaurantReviews}
      portfolioData={portfolioData}
    />
  );
}