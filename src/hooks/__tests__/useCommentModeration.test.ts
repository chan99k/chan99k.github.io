import { renderHook, act } from '@testing-library/react';
import { useCommentModeration } from '../useCommentModeration';

// Mock the comment moderation library
jest.mock('@/lib/comment-moderation', () => ({
  moderateComment: jest.fn(),
  isSpam: jest.fn(),
  containsProfanity: jest.fn(),
  sanitizeContent: jest.fn(),
}));

import { moderateComment, isSpam, containsProfanity, sanitizeContent } from '@/lib/comment-moderation';

const mockModerateComment = moderateComment as jest.MockedFunction<typeof moderateComment>;
const mockIsSpam = isSpam as jest.MockedFunction<typeof isSpam>;
const mockContainsProfanity = containsProfanity as jest.MockedFunction<typeof containsProfanity>;
const mockSanitizeContent = sanitizeContent as jest.MockedFunction<typeof sanitizeContent>;

describe('useCommentModeration Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCommentModeration());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.moderationResult).toBeNull();
  });

  it('should moderate comment successfully', async () => {
    const mockResult = {
      isApproved: true,
      isSpam: false,
      hasProfanity: false,
      sanitizedContent: 'This is a clean comment',
      confidence: 0.95,
    };

    mockModerateComment.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      await result.current.moderateComment('This is a clean comment');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.moderationResult).toEqual(mockResult);
    expect(mockModerateComment).toHaveBeenCalledWith('This is a clean comment');
  });

  it('should handle moderation error', async () => {
    const mockError = new Error('Moderation service unavailable');
    mockModerateComment.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      await result.current.moderateComment('Test comment');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Moderation service unavailable');
    expect(result.current.moderationResult).toBeNull();
  });

  it('should set loading state during moderation', async () => {
    let resolveModeration: (value: any) => void;
    const moderationPromise = new Promise(resolve => {
      resolveModeration = resolve;
    });

    mockModerateComment.mockReturnValue(moderationPromise);

    const { result } = renderHook(() => useCommentModeration());

    act(() => {
      result.current.moderateComment('Test comment');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveModeration!({
        isApproved: true,
        isSpam: false,
        hasProfanity: false,
        sanitizedContent: 'Test comment',
        confidence: 0.9,
      });
      await moderationPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should check if content is spam', async () => {
    mockIsSpam.mockResolvedValue(true);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      const isSpamResult = await result.current.checkSpam('Buy now! Click here!');
      expect(isSpamResult).toBe(true);
    });

    expect(mockIsSpam).toHaveBeenCalledWith('Buy now! Click here!');
  });

  it('should check for profanity', async () => {
    mockContainsProfanity.mockResolvedValue(true);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      const hasProfanity = await result.current.checkProfanity('Bad word content');
      expect(hasProfanity).toBe(true);
    });

    expect(mockContainsProfanity).toHaveBeenCalledWith('Bad word content');
  });

  it('should sanitize content', async () => {
    const sanitizedContent = 'Clean content without bad words';
    mockSanitizeContent.mockResolvedValue(sanitizedContent);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      const sanitized = await result.current.sanitizeContent('Content with bad words');
      expect(sanitized).toBe(sanitizedContent);
    });

    expect(mockSanitizeContent).toHaveBeenCalledWith('Content with bad words');
  });

  it('should clear error state', () => {
    const { result } = renderHook(() => useCommentModeration());

    // Set error state
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset moderation state', () => {
    const { result } = renderHook(() => useCommentModeration());

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.moderationResult).toBeNull();
  });

  it('should handle empty comment', async () => {
    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      await result.current.moderateComment('');
    });

    expect(result.current.error).toBe('Comment cannot be empty');
    expect(mockModerateComment).not.toHaveBeenCalled();
  });

  it('should handle very long comments', async () => {
    const longComment = 'a'.repeat(10000);
    
    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      await result.current.moderateComment(longComment);
    });

    expect(result.current.error).toBe('Comment is too long');
    expect(mockModerateComment).not.toHaveBeenCalled();
  });

  it('should provide moderation statistics', async () => {
    const mockResult = {
      isApproved: false,
      isSpam: true,
      hasProfanity: true,
      sanitizedContent: 'Sanitized content',
      confidence: 0.85,
    };

    mockModerateComment.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      await result.current.moderateComment('Spam content with profanity');
    });

    expect(result.current.moderationResult?.confidence).toBe(0.85);
    expect(result.current.moderationResult?.isSpam).toBe(true);
    expect(result.current.moderationResult?.hasProfanity).toBe(true);
  });

  it('should handle network timeout', async () => {
    const timeoutError = new Error('Request timeout');
    mockModerateComment.mockRejectedValue(timeoutError);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      await result.current.moderateComment('Test comment');
    });

    expect(result.current.error).toBe('Request timeout');
  });

  it('should batch moderate multiple comments', async () => {
    const comments = ['Comment 1', 'Comment 2', 'Comment 3'];
    const mockResults = comments.map((comment, index) => ({
      isApproved: true,
      isSpam: false,
      hasProfanity: false,
      sanitizedContent: comment,
      confidence: 0.9 + index * 0.01,
    }));

    mockModerateComment
      .mockResolvedValueOnce(mockResults[0])
      .mockResolvedValueOnce(mockResults[1])
      .mockResolvedValueOnce(mockResults[2]);

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      const results = await result.current.batchModerate(comments);
      expect(results).toHaveLength(3);
      expect(results[0].confidence).toBe(0.9);
      expect(results[1].confidence).toBe(0.91);
      expect(results[2].confidence).toBe(0.92);
    });

    expect(mockModerateComment).toHaveBeenCalledTimes(3);
  });

  it('should handle partial batch failures', async () => {
    const comments = ['Good comment', 'Bad comment'];
    
    mockModerateComment
      .mockResolvedValueOnce({
        isApproved: true,
        isSpam: false,
        hasProfanity: false,
        sanitizedContent: 'Good comment',
        confidence: 0.95,
      })
      .mockRejectedValueOnce(new Error('Moderation failed'));

    const { result } = renderHook(() => useCommentModeration());

    await act(async () => {
      const results = await result.current.batchModerate(comments);
      expect(results).toHaveLength(2);
      expect(results[0].isApproved).toBe(true);
      expect(results[1]).toBeNull(); // Failed moderation
    });
  });
});