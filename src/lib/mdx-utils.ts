// Compile MDX content (simplified version for static generation)
export async function compileMDXContent(
  content: string,
  _components: Record<string, React.ComponentType<unknown>> = {}
) {
  try {
    // For static generation, we rely on Next.js built-in MDX processing
    // This function provides a consistent interface for future enhancements
    return {
      content: content,
      frontmatter: {},
      success: true,
    };
  } catch (error) {
    console.error('Error processing MDX content:', error);
    return {
      content: null,
      frontmatter: {},
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Extract headings from MDX content for table of contents
export function extractHeadings(content: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ id: string; title: string; level: number }> = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    headings.push({ id, title, level });
  }
  
  return headings;
}

// Generate table of contents from headings
export function generateTableOfContents(headings: Array<{
  id: string;
  title: string;
  level: number;
}>): Array<{
  id: string;
  title: string;
  level: number;
  children?: Array<{ id: string; title: string; level: number }>;
}> {
  const toc: Array<{
    id: string;
    title: string;
    level: number;
    children?: Array<{ id: string; title: string; level: number }>;
  }> = [];
  
  let currentH2: {
    id: string;
    title: string;
    level: number;
    children: Array<{ id: string; title: string; level: number }>;
  } | null = null;
  
  headings.forEach(heading => {
    if (heading.level === 1) {
      // Skip H1 as it's usually the page title
      return;
    }
    
    if (heading.level === 2) {
      currentH2 = { ...heading, children: [] };
      toc.push(currentH2);
    } else if (heading.level === 3 && currentH2) {
      currentH2.children.push(heading);
    }
    // For simplicity, we only handle H2 and H3 levels
  });
  
  return toc;
}

// Estimate reading time from content
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Extract excerpt from MDX content
export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove MDX/markdown syntax
  const plainText = content
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}

// Validate MDX content
export function validateMDXContent(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for common MDX issues
  
  // Check for unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }

  // Check for malformed frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (content.startsWith('---') && !frontmatterMatch) {
    errors.push('Malformed frontmatter detected');
  }

  // Check for broken image references
  const imageMatches = content.match(/!\[.*?\]\((.*?)\)/g);
  if (imageMatches) {
    imageMatches.forEach(match => {
      const srcMatch = match.match(/!\[.*?\]\((.*?)\)/);
      if (srcMatch && srcMatch[1]) {
        const src = srcMatch[1];
        if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('./')) {
          warnings.push(`Potentially broken image reference: ${src}`);
        }
      }
    });
  }

  // Check for broken link references
  const linkMatches = content.match(/\[.*?\]\((.*?)\)/g);
  if (linkMatches) {
    linkMatches.forEach(match => {
      const hrefMatch = match.match(/\[.*?\]\((.*?)\)/);
      if (hrefMatch && hrefMatch[1]) {
        const href = hrefMatch[1];
        if (href.startsWith('#') && href.length === 1) {
          warnings.push('Empty anchor link detected');
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

const mdxUtils = {
  compileMDXContent,
  extractHeadings,
  generateTableOfContents,
  estimateReadingTime,
  extractExcerpt,
  validateMDXContent,
};

export default mdxUtils;