'use client';

import { useState, useCallback } from 'react';
import { moderateComment, ModerationResult, CommentAnalysis } from '@/lib/comment-moderation';

interface UseCommentModerationOptions {
  enableSpamDetection?: boolean;
  enableInappropriateContentFilter?: boolean;
  enableRateLimit?: boolean;
  enableSanitization?: boolean;
  onModerationResult?: (result: ModerationResult & { analysis?: CommentAnalysis }) => void;
}

interface CommentModerationState {
  isProcessing: boolean;
  lastResult: (ModerationResult & { analysis?: CommentAnalysis; sanitizedContent?: string }) | null;
  error: string | null;
}

export function useCommentModeration(options: UseCommentModerationOptions = {}) {
  const {
    enableSpamDetection = true,
    enableInappropriateContentFilter = true,
    enableRateLimit = true,
    enableSanitization = true,
    onModerationResult
  } = options;

  const [state, setState] = useState<CommentModerationState>({
    isProcessing: false,
    lastResult: null,
    error: null
  });

  const moderateCommentContent = useCallback(async (
    content: string,
    userId?: string
  ): Promise<ModerationResult & { analysis?: CommentAnalysis; sanitizedContent?: string }> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = moderateComment(content, userId, {
        checkSpam: enableSpamDetection,
        checkInappropriate: enableInappropriateContentFilter,
        checkRateLimit: enableRateLimit,
        sanitize: enableSanitization
      });

      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        lastResult: result 
      }));

      if (onModerationResult) {
        onModerationResult(result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Moderation failed';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      
      throw error;
    }
  }, [
    enableSpamDetection,
    enableInappropriateContentFilter,
    enableRateLimit,
    enableSanitization,
    onModerationResult
  ]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, lastResult: null }));
  }, []);

  return {
    moderateComment: moderateCommentContent,
    isProcessing: state.isProcessing,
    lastResult: state.lastResult,
    error: state.error,
    clearError,
    clearResult
  };
}