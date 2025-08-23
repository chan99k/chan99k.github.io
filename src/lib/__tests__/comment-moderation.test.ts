import {
  spamDetection,
  contentFilter,
  rateLimiting,
  moderateComment,
} from '../comment-moderation';

describe('Comment Moderation', () => {
  describe('spamDetection', () => {
    it('should detect spam keywords', () => {
      const spamText = 'Click here to win free money! Visit now!';
      const result = spamDetection.analyzeForSpam(spamText);

      expect(result.isSpam).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasons[0]).toContain('Spam keywords detected');
    });

    it('should detect suspicious URLs', () => {
      const spamText = 'Check out this site: http://suspicious.tk/offer';
      const result = spamDetection.analyzeForSpam(spamText);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('Suspicious URLs detected');
    });

    it('should detect repeated characters', () => {
      const spamText = 'Hellooooooooooo world!';
      const result = spamDetection.analyzeForSpam(spamText);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('Spam patterns detected');
    });

    it('should detect excessive links', () => {
      const spamText =
        'Visit http://site1.com and http://site2.com and http://site3.com and http://site4.com';
      const result = spamDetection.analyzeForSpam(spamText);

      expect(result.isSpam).toBe(true);
      expect(
        result.reasons.some(reason => reason.includes('Excessive links'))
      ).toBe(true);
    });

    it('should allow legitimate content', () => {
      const legitimateText =
        'This is a great blog post! Thanks for sharing your insights.';
      const result = spamDetection.analyzeForSpam(legitimateText);

      expect(result.isSpam).toBe(false);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('contentFilter', () => {
    it('should detect inappropriate English content', () => {
      const inappropriateText = 'This is fucking bullshit!';
      const result = contentFilter.hasInappropriateContent(inappropriateText);

      expect(result).toBe(true);
    });

    it('should detect inappropriate Korean content', () => {
      const inappropriateText = '이건 진짜 씨발 같네';
      const result = contentFilter.hasInappropriateContent(inappropriateText);

      expect(result).toBe(true);
    });

    it('should sanitize inappropriate content', () => {
      const inappropriateText = 'This is fucking amazing!';
      const sanitized = contentFilter.sanitizeContent(inappropriateText);

      expect(sanitized).toBe('This is ******* amazing!');
    });

    it('should remove harmful HTML', () => {
      const maliciousText = 'Hello <script>alert("xss")</script> world!';
      const sanitized = contentFilter.sanitizeContent(maliciousText);

      expect(sanitized).toBe('Hello  world!');
    });

    it('should allow appropriate content', () => {
      const appropriateText =
        'This is a wonderful article about web development.';
      const result = contentFilter.hasInappropriateContent(appropriateText);

      expect(result).toBe(false);
    });
  });

  describe('rateLimiting', () => {
    beforeEach(() => {
      // 각 테스트 전에 속도 제한 상태 초기화
      rateLimiting.recentSubmissions.clear();
    });

    it('should allow submissions within rate limit', () => {
      const userId = 'user123';

      // 첫 번째 제출은 허용되어야 함
      expect(rateLimiting.isRateLimited(userId, 5, 300000)).toBe(false);
      rateLimiting.recordSubmission(userId);

      // 두 번째 제출도 허용되어야 함
      expect(rateLimiting.isRateLimited(userId, 5, 300000)).toBe(false);
      rateLimiting.recordSubmission(userId);
    });

    it('should block submissions when rate limit exceeded', () => {
      const userId = 'user123';
      const maxSubmissions = 3;

      // 최대 허용 제출 수만큼 제출
      for (let i = 0; i < maxSubmissions; i++) {
        expect(rateLimiting.isRateLimited(userId, maxSubmissions, 300000)).toBe(
          false
        );
        rateLimiting.recordSubmission(userId);
      }

      // 다음 제출은 차단되어야 함
      expect(rateLimiting.isRateLimited(userId, maxSubmissions, 300000)).toBe(
        true
      );
    });

    it('should reset rate limit after time window', () => {
      const userId = 'user123';
      const maxSubmissions = 2;
      const timeWindow = 100; // 100ms for testing

      // 최대 제출 수만큼 제출
      rateLimiting.recordSubmission(userId);
      rateLimiting.recordSubmission(userId);

      expect(
        rateLimiting.isRateLimited(userId, maxSubmissions, timeWindow)
      ).toBe(true);

      // 시간 윈도우가 지날 때까지 대기
      return new Promise(resolve => {
        setTimeout(() => {
          expect(
            rateLimiting.isRateLimited(userId, maxSubmissions, timeWindow)
          ).toBe(false);
          resolve(void 0);
        }, timeWindow + 10);
      });
    });
  });

  describe('moderateComment', () => {
    beforeEach(() => {
      rateLimiting.recentSubmissions.clear();
    });

    it('should allow legitimate comments', () => {
      const legitimateComment =
        'Great article! I learned a lot about React hooks.';
      const result = moderateComment(legitimateComment, 'user123');

      expect(result.isAllowed).toBe(true);
      expect(result.analysis?.isSpam).toBe(false);
      expect(result.analysis?.hasInappropriateContent).toBe(false);
    });

    it('should block spam comments', () => {
      const spamComment =
        'Click here to win free money! Visit now! http://suspicious.tk';
      const result = moderateComment(spamComment, 'user123');

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('Spam detected');
      expect(result.analysis?.isSpam).toBe(true);
    });

    it('should sanitize inappropriate content', () => {
      const inappropriateComment = 'This fucking rocks!';
      const result = moderateComment(inappropriateComment, 'user123', {
        sanitize: true,
      });

      expect(result.sanitizedContent).toBe('This ******* rocks!');
    });

    it('should block rate limited users', () => {
      const userId = 'user123';
      const comment = 'Normal comment';

      // 속도 제한을 트리거하기 위해 여러 번 제출
      for (let i = 0; i < 5; i++) {
        moderateComment(comment, userId);
      }

      // 다음 제출은 차단되어야 함
      const result = moderateComment(comment, userId);
      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded');
    });

    it('should provide detailed analysis', () => {
      const comment =
        'Check out http://site1.com and http://site2.com and http://site3.com and http://site4.com';
      const result = moderateComment(comment, 'user123');

      expect(result.analysis).toBeDefined();
      expect(result.analysis?.hasExcessiveLinks).toBe(true);
      expect(result.analysis?.confidence).toBeGreaterThan(0);
    });

    it('should handle comments without user ID', () => {
      const comment = 'Anonymous comment';
      const result = moderateComment(comment);

      expect(result.isAllowed).toBe(true);
      // Rate limiting should not apply without user ID
    });
  });
});
