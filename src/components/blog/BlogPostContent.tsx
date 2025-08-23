'use client';

import { useEffect, useState } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import { CodeBlock } from './CodeBlock';

interface BlogPostContentProps {
  content: string;
}

// Enhanced MDX components with code block support
const blogMdxComponents = {
  ...mdxComponents,
  pre: CodeBlock,
};

export function BlogPostContent({ content }: BlogPostContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processMDX = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mdxSource = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: 'wrap',
                  properties: {
                    className: ['anchor-link'],
                  },
                },
              ],
              [
                rehypePrettyCode,
                {
                  theme: {
                    dark: 'github-dark',
                    light: 'github-light',
                  },
                  keepBackground: false,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onVisitLine(node: any) {
                    // Prevent lines from collapsing in `display: grid` mode, and
                    // allow empty lines to be copy/pasted
                    if (node.children.length === 0) {
                      node.children = [{ type: 'text', value: ' ' }];
                    }
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onVisitHighlightedLine(node: any) {
                    node.properties.className.push('highlighted');
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onVisitHighlightedWord(node: any) {
                    node.properties.className = ['highlighted-word'];
                  },
                },
              ],
            ],
          },
        });

        setMdxSource(mdxSource);
      } catch (err) {
        console.error('Error processing MDX:', err);
        setError(err instanceof Error ? err.message : 'Failed to process content');
      } finally {
        setIsLoading(false);
      }
    };

    processMDX();
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
          Error Loading Content
        </h3>
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
      </div>
    );
  }

  if (!mdxSource) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No content available</p>
      </div>
    );
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <MDXRemote {...mdxSource} components={blogMdxComponents} />
    </div>
  );
}