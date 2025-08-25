import { Metadata } from 'next';
import { generatePortfolioMetadata } from '@/lib/seo';
import { getPortfolioData, getBlogPosts } from '@/lib/content';
import { PortfolioPage } from '@/components/portfolio';
import { notFound } from 'next/navigation';

export const metadata: Metadata = generatePortfolioMetadata();

export default async function Portfolio() {
  const portfolioData = await getPortfolioData();
  const blogPosts = await getBlogPosts();

  if (!portfolioData) {
    notFound();
  }

  return (
    <PortfolioPage 
      data={portfolioData} 
      blogPosts={blogPosts || []}
    />
  );
}
