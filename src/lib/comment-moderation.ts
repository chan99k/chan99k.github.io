/**
 * 댓글 검열 및 스팸 필터링 유틸리티
 * 클라이언트 사이드 검증 및 서버 사이드 처리에 사용
 */
export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  confidence: number; // 0-1, higher means more confident in the decision
}

export interface CommentAnalysis {
  isSpam: boolean;
  hasInappropriateContent: boolean;
  hasExcessiveLinks: boolean;
  hasRepeatedContent: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

/**
 * 스팸 탐지 패턴 및 규칙
 */
export const spamDetection = {
  // 일반적인 스팸 키워드
  spamKeywords: [
    'viagra',
    'cialis',
    'casino',
    'poker',
    'lottery',
    'winner',
    'congratulations',
    'click here',
    'visit now',
    'buy now',
    'limited time',
    'act now',
    'free money',
    'make money fast',
    'work from home',
    'guaranteed income',
    'no experience needed',
  ],

  // 의심스러운 URL 패턴
  suspiciousUrlPatterns: [
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf|pw)/i, // 스팸에 자주 사용되는 무료 도메인
    /bit\.ly|tinyurl|t\.co/i, // URL 단축 서비스 (정상적일 수도 있지만 스팸에 자주 사용됨)
    /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/i, // 도메인 대신 IP 주소 사용
  ],

  // 스팸을 나타내는 패턴
  spamPatterns: [
    /(.)\1{10,}/, // 반복되는 문자 (aaaaaaaaaa)
    /[A-Z]{5,}/, // 과도한 대문자
    /\b\d{10,}\b/, // 긴 숫자 (스팸에서 자주 사용되는 전화번호 등)
    /[!]{3,}/, // 연속된 느낌표
    /\$\d+/, // 금액 표시
  ],

  /**
   * 텍스트에서 스팸 지표를 분석
   */
  analyzeForSpam(text: string): {
    isSpam: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let spamScore = 0;

    // 스팸 키워드 확인
    const lowerText = text.toLowerCase();
    const keywordMatches = this.spamKeywords.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      spamScore += keywordMatches.length * 0.4;
      reasons.push(`Spam keywords detected: ${keywordMatches.join(', ')}`);
    }

    // 의심스러운 URL 확인
    const urlMatches = this.suspiciousUrlPatterns.filter(pattern =>
      pattern.test(text)
    );
    if (urlMatches.length > 0) {
      spamScore += urlMatches.length * 0.6;
      reasons.push('Suspicious URLs detected');
    }

    // 스팸 패턴 확인
    const patternMatches = this.spamPatterns.filter(pattern =>
      pattern.test(text)
    );
    if (patternMatches.length > 0) {
      spamScore += patternMatches.length * 0.4;
      reasons.push('Spam patterns detected');
    }

    // 과도한 링크 확인
    const linkCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 3) {
      spamScore += (linkCount - 3) * 0.3;
      reasons.push(`Excessive links: ${linkCount}`);
    }

    // 너무 짧거나 긴 콘텐츠 확인
    if (text.length < 10) {
      spamScore += 0.1;
      reasons.push('Content too short');
    } else if (text.length > 5000) {
      spamScore += 0.2;
      reasons.push('Content too long');
    }

    const confidence = Math.min(spamScore, 1);
    const isSpam = confidence >= 0.3;

    return { isSpam, confidence, reasons };
  },
};

/**
 * 부적절한 콘텐츠 필터링
 */
export const contentFilter = {
  // 부적절한 콘텐츠 패턴
  inappropriatePatterns: [
    /\b(fuck|fucking|shit|bullshit|damn|hell|bitch|asshole|bastard)\b/i,
    /\b(sex|porn|xxx|adult|nude)\b/i,
    // 한국어 패턴 (한국어는 단어 경계가 필요하지 않음)
    /(씨발|개새끼|병신|좆|꺼져|씨1발)/i,
  ],

  /**
   * 부적절한 콘텐츠를 확인합니다
   */
  hasInappropriateContent(text: string): boolean {
    return this.inappropriatePatterns.some(pattern => pattern.test(text));
  },

  /**
   * 부적절한 부분을 제거하거나 대체하여 콘텐츠를 정화합니다
   * @deprecated Use sanitizeInput from @/lib/security/input-sanitization instead
   */
  sanitizeContent(text: string): string {
    let sanitized = text;

    // 스크립트 태그 및 기타 잠재적으로 해로운 HTML 제거
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
    sanitized = sanitized.replace(
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ''
    );
    sanitized = sanitized.replace(
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      ''
    );
    sanitized = sanitized.replace(
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      ''
    );

    // 부적절한 단어를 별표로 대체
    this.inappropriatePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, match => '*'.repeat(match.length));
    });

    return sanitized.trim();
  },
};

/**
 * 댓글 제출 빈도 제한
 */
export const rateLimiting = {
  // 최근 제출 기록 저장 (실제 앱에서는 데이터베이스나 캐시에 저장)
  recentSubmissions: new Map<string, number[]>(),

  /**
   * 사용자가 빈도 제한에 걸렸는지 확인합니다
   */
  isRateLimited(
    userId: string,
    maxSubmissions: number = 5,
    timeWindow: number = 300000
  ): boolean {
    const now = Date.now();
    const userSubmissions = this.recentSubmissions.get(userId) || [];

    // 시간 윈도우 밖의 오래된 제출 기록 제거
    const recentSubmissions = userSubmissions.filter(
      timestamp => now - timestamp < timeWindow
    );

    // 저장된 제출 기록 업데이트
    this.recentSubmissions.set(userId, recentSubmissions);

    return recentSubmissions.length >= maxSubmissions;
  },

  /**
   * 새로운 제출을 기록합니다
   */
  recordSubmission(userId: string): void {
    const now = Date.now();
    const userSubmissions = this.recentSubmissions.get(userId) || [];
    userSubmissions.push(now);
    this.recentSubmissions.set(userId, userSubmissions);
  },
};

/**
 * 모든 검사를 결합한 메인 검열 함수
 */
export function moderateComment(
  content: string,
  userId?: string,
  options: {
    checkSpam?: boolean;
    checkInappropriate?: boolean;
    checkRateLimit?: boolean;
    sanitize?: boolean;
  } = {}
): ModerationResult & {
  sanitizedContent?: string;
  analysis?: CommentAnalysis;
} {
  const {
    checkSpam = true,
    checkInappropriate = true,
    checkRateLimit = true,
    sanitize = true,
  } = options;

  let isAllowed = true;
  let reason = '';
  let confidence = 0;
  let sanitizedContent = content;

  // Enhanced sanitization using the new security system
  if (sanitize) {
    try {
      // Use the enhanced sanitization system
      const { sanitizeInput, SANITIZATION_PRESETS } = require('@/lib/security/input-sanitization');
      const sanitizationResult = sanitizeInput(content, SANITIZATION_PRESETS.comment);
      
      sanitizedContent = sanitizationResult.sanitized;
      
      // If too much content was removed, it might be malicious
      if (sanitizationResult.wasModified && sanitizedContent.length < content.length * 0.3) {
        isAllowed = false;
        reason = 'Content contains too much potentially harmful material';
        confidence = Math.max(confidence, 0.9);
      }
      
      // Add warnings from sanitization
      if (sanitizationResult.warnings.length > 0) {
        confidence = Math.max(confidence, 0.3);
      }
    } catch (error) {
      // Fallback to legacy sanitization
      sanitizedContent = contentFilter.sanitizeContent(content);
    }
  }

  // 스팸 탐지
  if (checkSpam) {
    const spamAnalysis = spamDetection.analyzeForSpam(content);
    if (spamAnalysis.isSpam) {
      isAllowed = false;
      reason = `Spam detected: ${spamAnalysis.reasons.join(', ')}`;
      confidence = Math.max(confidence, spamAnalysis.confidence);
    }
  }

  // 부적절한 콘텐츠 확인
  if (checkInappropriate && contentFilter.hasInappropriateContent(content)) {
    if (!sanitize) {
      isAllowed = false;
      reason = 'Content contains inappropriate material';
      confidence = Math.max(confidence, 0.7);
    } else if (sanitizedContent.length < content.length * 0.5) {
      isAllowed = false;
      reason = 'Content contains too much inappropriate material';
      confidence = Math.max(confidence, 0.8);
    }
  }

  // Rate limiting check
  if (checkRateLimit && userId && rateLimiting.isRateLimited(userId)) {
    isAllowed = false;
    reason =
      'Rate limit exceeded. Please wait before submitting another comment.';
    confidence = 1.0;
  }

  // Record submission if allowed
  if (isAllowed && userId && checkRateLimit) {
    rateLimiting.recordSubmission(userId);
  }

  const spamAnalysis = checkSpam
    ? spamDetection.analyzeForSpam(content)
    : { isSpam: false, confidence: 0 };
  const analysis: CommentAnalysis = {
    isSpam: spamAnalysis.isSpam,
    hasInappropriateContent: checkInappropriate
      ? contentFilter.hasInappropriateContent(content)
      : false,
    hasExcessiveLinks: (content.match(/https?:\/\/[^\s]+/g) || []).length > 3,
    hasRepeatedContent: /(.)\1{10,}/.test(content),
    sentiment: 'neutral', // This would require more sophisticated analysis
    confidence: Math.max(confidence, spamAnalysis.confidence),
  };

  return {
    isAllowed,
    reason,
    confidence,
    sanitizedContent: sanitize ? sanitizedContent : undefined,
    analysis,
  };
}
