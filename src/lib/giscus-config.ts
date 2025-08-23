import { GiscusConfig } from '@/types';

/**
 * Default Giscus configuration for the blog comment system
 */
export const defaultGiscusConfig: GiscusConfig = {
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
};

/**
 * Validates if the Giscus configuration is complete
 */
export function isGiscusConfigValid(
  config: Partial<GiscusConfig> = {}
): boolean {
  const finalConfig = { ...defaultGiscusConfig, ...config };

  return !!(
    finalConfig.repo &&
    finalConfig.repoId &&
    finalConfig.categoryId &&
    finalConfig.category
  );
}

/**
 * Gets the complete Giscus configuration with environment variables
 */
export function getGiscusConfig(
  overrides: Partial<GiscusConfig> = {}
): GiscusConfig {
  return {
    ...defaultGiscusConfig,
    ...overrides,
  };
}

/**
 * Comment moderation utilities
 */
export const commentModeration = {
  /**
   * Basic spam detection patterns
   */
  spamPatterns: [
    /\b(viagra|cialis|casino|poker|lottery|winner|congratulations)\b/i,
    /\b(click here|visit now|buy now|limited time)\b/i,
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf)/i, // Suspicious domains
    /(.)\1{10,}/, // Repeated characters
  ],

  /**
   * Checks if content might be spam
   */
  isLikelySpam(content: string): boolean {
    return this.spamPatterns.some(pattern => pattern.test(content));
  },

  /**
   * Sanitizes comment content (basic implementation)
   */
  sanitizeContent(content: string): string {
    // Remove potentially harmful HTML tags
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .trim();
  },
};

/**
 * Anonymous commenting configuration
 * Since Giscus requires GitHub authentication, we provide guidance for anonymous users
 */
export const anonymousCommentingGuide = {
  title: '익명 댓글 작성 방법',
  steps: [
    {
      step: 1,
      title: 'GitHub 계정 생성',
      description:
        'GitHub에서 무료 계정을 생성하세요. 실명을 사용할 필요는 없습니다.',
      link: 'https://github.com/signup',
    },
    {
      step: 2,
      title: 'GitHub Discussions 접근',
      description:
        '이 블로그의 GitHub 저장소 Discussions 섹션에 직접 접근할 수 있습니다.',
      link: process.env.NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL || '#',
    },
    {
      step: 3,
      title: '댓글 작성',
      description:
        '해당 포스트의 Discussion에서 댓글을 작성하면 자동으로 블로그에 표시됩니다.',
    },
  ],
  note: 'GitHub 계정은 익명성을 보장하며, 개인정보를 공개할 필요가 없습니다.',
};
