import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
// Remove server-side image optimization import for client components
import { cn } from '@/lib/utils';

// React 타입 가져오기
import React from 'react';

// MDX를 위한 커스텀 이미지 컴포넌트
interface MDXImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  priority?: boolean;
}

function MDXImage({ src, alt, width, height, caption, priority = false }: MDXImageProps) {
  // Simple client-side image handling without server-side optimization
  const imageSrc = src.startsWith('/') ? src : `/images/blog/${src}`;

  return (
    <figure className="my-8">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          priority={priority}
          className="w-full h-auto"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// MDX를 위한 커스텀 링크 컴포넌트
interface MDXLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

function MDXLink({ href, children, className }: MDXLinkProps) {
  const isExternal = href.startsWith('http') || href.startsWith('//');
  const isAnchor = href.startsWith('#');

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2',
          className
        )}
      >
        {children}
      </a>
    );
  }

  if (isAnchor) {
    return (
      <a
        href={href}
        className={cn(
          'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2',
          className
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2',
        className
      )}
    >
      {children}
    </Link>
  );
}

// 커스텀 코드 블록 컴포넌트
interface MDXCodeProps {
  children: ReactNode;
  className?: string;
}

function MDXCode({ children, className }: MDXCodeProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
}

// 코드 블록을 위한 커스텀 Pre 컴포넌트
function MDXPre({ children, ...props }: { children: ReactNode;[key: string]: unknown }) {
  return (
    <pre
      className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100 my-6"
      {...props}
    >
      {children}
    </pre>
  );
}

// 커스텀 인용구 컴포넌트
function MDXBlockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-6">
      {children}
    </blockquote>
  );
}

// 커스텀 테이블 컴포넌트
function MDXTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
}

function MDXThead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      {children}
    </thead>
  );
}

function MDXTbody({ children }: { children: ReactNode }) {
  return (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  );
}

function MDXTh({ children }: { children: ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function MDXTd({ children }: { children: ReactNode }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
      {children}
    </td>
  );
}

// 앵커 링크가 있는 커스텀 제목 컴포넌트
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const HeadingComponent = ({ children, id, ...props }: { children: ReactNode; id?: string;[key: string]: unknown }) => {
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    const sizes = {
      1: 'text-3xl font-bold',
      2: 'text-2xl font-semibold',
      3: 'text-xl font-semibold',
      4: 'text-lg font-semibold',
      5: 'text-base font-semibold',
      6: 'text-sm font-semibold',
    };

    return (
      <Tag
        id={id}
        className={cn(
          sizes[level],
          'text-gray-900 dark:text-gray-100 mt-8 mb-4 first:mt-0',
          level <= 2 && 'border-b border-gray-200 dark:border-gray-700 pb-2'
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  };

  HeadingComponent.displayName = `MDXHeading${level}`;
  return HeadingComponent;
}

// 커스텀 리스트 컴포넌트
function MDXUl({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  );
}

function MDXOl({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  );
}

function MDXLi({ children }: { children: ReactNode }) {
  return (
    <li className="text-gray-700 dark:text-gray-300">
      {children}
    </li>
  );
}

// 커스텀 단락 컴포넌트
function MDXParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed my-4">
      {children}
    </p>
  );
}

// 커스텀 구분선 컴포넌트
function MDXHr() {
  return (
    <hr className="border-gray-200 dark:border-gray-700 my-8" />
  );
}

// MDX 컴포넌트 내보내기
export const mdxComponents = {
  // 타이포그래피
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  p: MDXParagraph,

  // 링크와 미디어
  a: MDXLink,
  img: MDXImage,
  Image: MDXImage,

  // 코드
  code: MDXCode,
  pre: MDXPre,

  // 리스트
  ul: MDXUl,
  ol: MDXOl,
  li: MDXLi,

  // 테이블
  table: MDXTable,
  thead: MDXThead,
  tbody: MDXTbody,
  th: MDXTh,
  td: MDXTd,

  // 기타 요소
  blockquote: MDXBlockquote,
  hr: MDXHr,
};

export default mdxComponents;