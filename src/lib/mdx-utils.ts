// MDX 콘텐츠 컴파일 (정적 생성을 위한 간소화된 버전)
export async function compileMDXContent(
  content: string,
  _components: Record<string, React.ComponentType<unknown>> = {}
) {
  try {
    // 정적 생성을 위해 Next.js 내장 MDX 처리에 의존
    // 이 함수는 향후 개선을 위한 일관된 인터페이스를 제공
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

// 목차를 위해 MDX 콘텐츠에서 제목 추출
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

// 제목들로부터 목차 생성
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
      // H1은 보통 페이지 제목이므로 건너뜀
      return;
    }
    
    if (heading.level === 2) {
      currentH2 = { ...heading, children: [] };
      toc.push(currentH2);
    } else if (heading.level === 3 && currentH2) {
      currentH2.children.push(heading);
    }
    // 단순화를 위해 H2와 H3 레벨만 처리
  });
  
  return toc;
}

// 콘텐츠로부터 읽기 시간 추정
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// MDX 콘텐츠에서 발췌문 추출
export function extractExcerpt(content: string, maxLength: number = 160): string {
  // MDX/마크다운 문법 제거
  const plainText = content
    .replace(/^---[\s\S]*?---/, '') // frontmatter 제거
    .replace(/#{1,6}\s+/g, '') // 헤더 제거
    .replace(/\*\*(.*?)\*\*/g, '$1') // 굵은 글씨 제거
    .replace(/\*(.*?)\*/g, '$1') // 기울임 글씨 제거
    .replace(/`(.*?)`/g, '$1') // 인라인 코드 제거
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 링크 제거
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 교체
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}

// MDX 콘텐츠 유효성 검사
export function validateMDXContent(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 일반적인 MDX 문제 확인
  
  // 닫히지 않은 코드 블록 확인
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }

  // 잘못된 형식의 frontmatter 확인
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (content.startsWith('---') && !frontmatterMatch) {
    errors.push('Malformed frontmatter detected');
  }

  // 깨진 이미지 참조 확인
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

  // 깨진 링크 참조 확인
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