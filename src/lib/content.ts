import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';
import { calculateReadingTime, generateExcerpt } from './utils';

const contentDirectory = path.join(process.cwd(), 'content');

export async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(contentDirectory, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = getAllMarkdownFiles(blogDir);
  const posts: BlogPost[] = [];

  for (const filePath of files) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const relativePath = path.relative(blogDir, filePath);
    const slug = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/');

    posts.push({
      slug,
      title: data.title || 'Untitled',
      description: data.description || generateExcerpt(content),
      date: data.date || new Date().toISOString(),
      lastModified: data.lastModified,
      tags: data.tags || [],
      category: data.category || 'general',
      readingTime: calculateReadingTime(content),
      excerpt: data.excerpt || generateExcerpt(content),
      draft: data.draft || false,
      featured: data.featured || false,
      coverImage: data.coverImage,
      author: data.author || 'Chan99K',
      relatedProject: data.relatedProject,
      isProblemSolution: data.isProblemSolution || false,
      problemSolutionMeta: data.problemSolutionMeta,
    });
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<{ post: BlogPost; content: string } | null> {
  const blogDir = path.join(contentDirectory, 'blog');
  const filePath = path.join(blogDir, `${slug}.md`);
  const mdxFilePath = path.join(blogDir, `${slug}.mdx`);

  let targetPath = '';
  if (fs.existsSync(filePath)) {
    targetPath = filePath;
  } else if (fs.existsSync(mdxFilePath)) {
    targetPath = mdxFilePath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(targetPath, 'utf8');
  const { data, content } = matter(fileContents);

  const post: BlogPost = {
    slug,
    title: data.title || 'Untitled',
    description: data.description || generateExcerpt(content),
    date: data.date || new Date().toISOString(),
    lastModified: data.lastModified,
    tags: data.tags || [],
    category: data.category || 'general',
    readingTime: calculateReadingTime(content),
    excerpt: data.excerpt || generateExcerpt(content),
    draft: data.draft || false,
    featured: data.featured || false,
    coverImage: data.coverImage,
    author: data.author || 'Chan99K',
    relatedProject: data.relatedProject,
    isProblemSolution: data.isProblemSolution || false,
    problemSolutionMeta: data.problemSolutionMeta,
  };

  return { post, content };
}

export async function getRestaurantReviews(): Promise<RestaurantReview[]> {
  const reviewsDir = path.join(contentDirectory, 'reviews');
  
  if (!fs.existsSync(reviewsDir)) {
    return [];
  }

  const files = getAllMarkdownFiles(reviewsDir);
  const reviews: RestaurantReview[] = [];

  for (const filePath of files) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const relativePath = path.relative(reviewsDir, filePath);
    const id = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/');

    reviews.push({
      id,
      name: data.name || 'Unknown Restaurant',
      location: data.location || { address: '', coordinates: { lat: 0, lng: 0 }, region: '' },
      rating: data.rating || 0,
      visitDate: data.visitDate || new Date().toISOString(),
      cuisine: data.cuisine || 'other',
      priceRange: data.priceRange || 1,
      images: data.images || [],
      review: content,
      tags: data.tags || [],
      mapLinks: data.mapLinks || { naver: '', kakao: '', google: '' },
    });
  }

  return reviews.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
}

export async function getPortfolioData(): Promise<PortfolioData | null> {
  const portfolioPath = path.join(contentDirectory, 'portfolio', 'portfolio.md');
  
  if (!fs.existsSync(portfolioPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(portfolioPath, 'utf8');
  const { data } = matter(fileContents);

  return {
    personalInfo: data.personalInfo || {
      name: 'Chan99K',
      title: 'Software Developer',
      email: 'your-email@example.com',
      github: 'https://github.com/chan99k',
      summary: 'Passionate software developer with experience in web development.',
    },
    experience: data.experience || [],
    projects: data.projects || [],
    certifications: data.certifications || [],
    education: data.education || [],
  };
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}