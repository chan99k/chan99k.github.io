import { Metadata } from 'next';
import { getPortfolioData, getBlogPosts } from '@/lib/content';
import { PortfolioPage } from '@/components/portfolio/PortfolioPage';
import { generatePortfolioMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePortfolioMetadata();

export default async function Portfolio() {
  const [portfolioData, blogPosts] = await Promise.all([
    getPortfolioData(),
    getBlogPosts(),
  ]);

  if (!portfolioData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Portfolio Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Portfolio data could not be loaded. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return <PortfolioPage data={portfolioData} blogPosts={blogPosts} />;
}