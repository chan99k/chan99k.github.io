'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import Giscus from '@giscus/react';
import { GiscusConfig } from '@/types';
import { AnonymousCommentGuide } from './AnonymousCommentGuide';

interface CommentSectionProps {
  postSlug: string;
  giscusConfig?: Partial<GiscusConfig>;
}

const getDefaultGiscusConfig = (): GiscusConfig => ({
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '',
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '',
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General',
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  mapping: 'pathname',
  reactionsEnabled: true,
  emitMetadata: false,
  inputPosition: 'bottom',
  theme: 'preferred_color_scheme',
  lang: 'ko',
});

export function CommentSection({
  postSlug,
  giscusConfig = {},
}: CommentSectionProps) {
  const { resolvedTheme } = useTheme();
  const commentRef = useRef<HTMLDivElement>(null);

  const config = { ...getDefaultGiscusConfig(), ...giscusConfig };

  // Determine the theme for Giscus
  const giscusTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // Don't render if required config is missing
  if (!config.repo || !config.repoId || !config.categoryId) {
    return (
      <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-8'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-yellow-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
              댓글 시스템 설정 필요
            </h3>
            <div className='mt-2 text-sm text-yellow-700 dark:text-yellow-300'>
              <p>
                댓글 기능을 사용하려면 Giscus 설정이 필요합니다. 환경 변수를
                확인해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-700'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
          댓글
        </h2>
        <p className='text-gray-600 dark:text-gray-400 text-sm mb-4'>
          GitHub 계정으로 로그인하여 댓글을 남겨보세요. 익명 댓글은 GitHub
          Discussions를 통해 작성할 수 있습니다.
        </p>
        <AnonymousCommentGuide />
      </div>

      <div ref={commentRef} className='giscus-container'>
        <Giscus
          id='comments'
          repo={config.repo as `${string}/${string}`}
          repoId={config.repoId}
          category={config.category}
          categoryId={config.categoryId}
          mapping={config.mapping}
          term={postSlug}
          reactionsEnabled={config.reactionsEnabled ? '1' : '0'}
          emitMetadata={config.emitMetadata ? '1' : '0'}
          inputPosition={config.inputPosition}
          theme={giscusTheme}
          lang={config.lang}
          loading='lazy'
        />
      </div>

      <div className='mt-4 text-xs text-gray-500 dark:text-gray-400'>
        <p>
          댓글은 GitHub Discussions를 통해 관리됩니다. 부적절한 댓글은 관리자에
          의해 삭제될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
