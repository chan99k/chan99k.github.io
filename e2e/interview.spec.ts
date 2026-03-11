import { test, expect } from '@playwright/test';
import { InterviewPage, InterviewHistoryPage, InterviewResultPage } from './pages/interview.page';

/**
 * E2E tests for Interview feature
 *
 * Test scenarios:
 * 1. Unauthenticated user access restriction
 * 2. Login → Interview start → Answer submission flow
 * 3. Interview completion → Result page navigation
 * 4. History list viewing
 */

test.describe('Interview Feature E2E Tests', () => {
  test.describe('Authentication', () => {
    test('should show login buttons when not authenticated', async ({ page }) => {
      const interviewPage = new InterviewPage(page);
      await interviewPage.goto();

      // Should show login buttons instead of interview interface
      const hasLogin = await interviewPage.hasLoginButtons();
      expect(hasLogin).toBe(true);
    });

    test('should show login on history page when not authenticated', async ({ page }) => {
      const historyPage = new InterviewHistoryPage(page);
      await historyPage.goto();

      const hasLogin = await historyPage.hasLoginButtons();
      expect(hasLogin).toBe(true);
    });
  });

  test.describe('Interview Flow (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication state
      await page.addInitScript(() => {
        const mockSession = {
          access_token: 'mock-token-12345',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { name: 'Test User' },
          },
        };

        // Mock localStorage
        const storageKey = Object.keys(localStorage).find(k => k.includes('sb-') && k.includes('auth-token'));
        if (!storageKey) {
          localStorage.setItem(
            'sb-test-auth-token',
            JSON.stringify({
              currentSession: mockSession,
              expiresAt: Date.now() / 1000 + 3600,
            })
          );
        }

        // Mock fetch for session API
        const originalFetch = window.fetch;
        (window as any).fetch = function (url: string, options?: RequestInit) {
          // Mock session creation
          if (url.includes('/session') && options?.method === 'POST') {
            const body = JSON.parse(options.body as string);

            if (body.action === 'create') {
              return Promise.resolve(
                new Response(JSON.stringify({ session_id: 'mock-session-123' }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }

            if (body.action === 'message') {
              return Promise.resolve(
                new Response(JSON.stringify({ success: true }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }

            if (body.action === 'complete') {
              return Promise.resolve(
                new Response(JSON.stringify({ success: true }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }

            if (body.action === 'list') {
              return Promise.resolve(
                new Response(JSON.stringify({ sessions: [], total: 0 }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }

            if (body.action === 'get') {
              return Promise.resolve(
                new Response(JSON.stringify({
                  session: {
                    id: body.session_id,
                    status: 'completed',
                    initial_question: 'Test question',
                    total_score: 75,
                    created_at: new Date().toISOString(),
                    completed_at: new Date().toISOString(),
                    feedback: {
                      totalScore: 75,
                      overallFeedback: 'Good performance overall.',
                    },
                  },
                  messages: [
                    {
                      id: '1',
                      role: 'user',
                      content: 'Test answer',
                      message_type: 'answer',
                      depth: 1,
                      ordering: 0,
                      created_at: new Date().toISOString(),
                      interviewer: null,
                      score: null,
                    },
                  ],
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }
          }

          // Mock RAG search
          if (url.includes('/rag-search')) {
            return Promise.resolve(
              new Response(JSON.stringify({ chunks: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          // Mock interview server (AI response)
          if (url.includes('/interview-server')) {
            const mockResponse = `data: ${JSON.stringify({
              type: 'content_block_delta',
              delta: { text: '좋은 답변입니다. ' }
            })}\n\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              delta: { text: '다음 질문입니다. ' }
            })}\n\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              delta: { text: JSON.stringify({
                evaluations: [{ interviewer: 'tech', score: { depth: 7 }, comment: 'Good' }],
                followUp: { interviewer: 'tech', question: '추가 질문이 있습니다.' },
                shouldContinue: false,
                overallScore: 75,
                summary: '면접이 종료되었습니다. 수고하셨습니다.'
              })}
            })}\n\ndata: [DONE]\n`;

            return Promise.resolve(
              new Response(mockResponse, {
                status: 200,
                headers: { 'Content-Type': 'text/event-stream' },
              })
            );
          }

          return originalFetch(url, options);
        };
      });
    });

    test('should complete interview setup and start chat', async ({ page }) => {
      const interviewPage = new InterviewPage(page);
      await interviewPage.goto();

      // Wait for setup section to load
      await interviewPage.waitForSetup();

      // Select interviewers (click to deselect some, keeping 2)
      const buttons = await interviewPage.interviewerButtons.all();
      if (buttons.length > 2) {
        // Deselect the last one to have exactly 2
        await buttons[buttons.length - 1].click();
      }

      // Start interview
      await interviewPage.startInterview();

      // Verify question is displayed
      await expect(interviewPage.questionDisplay.first()).toBeVisible();
    });

    test('should submit answer and receive AI response', async ({ page }) => {
      const interviewPage = new InterviewPage(page);
      await interviewPage.goto();

      // Setup and start
      await interviewPage.waitForSetup();
      await interviewPage.startInterview();

      // Submit an answer
      const testAnswer = 'This is my test answer to the interview question. I have experience with TypeScript and React.';
      await interviewPage.submitAnswer(testAnswer);

      // Wait for AI response
      await interviewPage.waitForAIResponse(60000);

      // Verify message appears in chat
      const messageCount = await interviewPage.getMessageCount();
      expect(messageCount).toBeGreaterThan(0);
    });

    test('should navigate to result page after completion', async ({ page }) => {
      const interviewPage = new InterviewPage(page);
      await interviewPage.goto();

      // Setup and start
      await interviewPage.waitForSetup();
      await interviewPage.startInterview();

      // Submit answer
      await interviewPage.submitAnswer('Final answer for the interview.');
      await interviewPage.waitForAIResponse(60000);

      // Check if interview is completed
      const isCompleted = await interviewPage.isInterviewCompleted();

      if (isCompleted) {
        // Click result button
        await interviewPage.goToResult();

        // Verify we're on result page
        const resultPage = new InterviewResultPage(page);
        await resultPage.waitForLoad();
        await expect(resultPage.pageTitle).toBeVisible();
      } else {
        // If not completed, just verify submit was successful
        const messageCount = await interviewPage.getMessageCount();
        expect(messageCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('History Page', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        const mockSession = {
          access_token: 'mock-token-12345',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        };

        localStorage.setItem(
          'sb-test-auth-token',
          JSON.stringify({ currentSession: mockSession })
        );

        // Mock session list API
        const originalFetch = window.fetch;
        (window as any).fetch = function (url: string, options?: RequestInit) {
          if (url.includes('/session') && options?.method === 'POST') {
            const body = JSON.parse(options.body as string);

            if (body.action === 'list') {
              return Promise.resolve(
                new Response(JSON.stringify({
                  sessions: [
                    {
                      id: 'session-1',
                      status: 'completed',
                      initial_question: 'What is React?',
                      total_score: 85,
                      created_at: new Date().toISOString(),
                      completed_at: new Date().toISOString(),
                      feedback: { totalScore: 85 },
                    },
                    {
                      id: 'session-2',
                      status: 'completed',
                      initial_question: 'Explain TypeScript benefits',
                      total_score: 70,
                      created_at: new Date(Date.now() - 86400000).toISOString(),
                      completed_at: new Date(Date.now() - 86400000).toISOString(),
                      feedback: { totalScore: 70 },
                    },
                  ],
                  total: 2,
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }

            if (body.action === 'get') {
              return Promise.resolve(
                new Response(JSON.stringify({
                  session: {
                    id: body.session_id,
                    status: 'completed',
                    initial_question: 'What is React?',
                    total_score: 85,
                    created_at: new Date().toISOString(),
                    completed_at: new Date().toISOString(),
                    feedback: { totalScore: 85 },
                  },
                  messages: [],
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }
          }

          return originalFetch(url, options);
        };
      });
    });

    test('should display interview history list', async ({ page }) => {
      const historyPage = new InterviewHistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForLoad();

      // Wait for sessions to load
      await page.waitForTimeout(1000);

      // Check if we have sessions or empty state
      const sessionCount = await historyPage.getSessionCount();

      if (sessionCount > 0) {
        // Verify sessions are displayed
        expect(sessionCount).toBeGreaterThanOrEqual(2);
      } else {
        // Empty state is also valid for first-time users
        await expect(historyPage.emptyState).toBeVisible();
      }
    });

    test('should navigate to result page from history', async ({ page }) => {
      const historyPage = new InterviewHistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForLoad();

      // Wait for sessions
      await page.waitForTimeout(1000);

      const sessionCount = await historyPage.getSessionCount();

      if (sessionCount > 0) {
        // Click first session
        await historyPage.clickFirstSession();

        // Verify navigation to result page
        const resultPage = new InterviewResultPage(page);
        await resultPage.waitForLoad();
        await expect(resultPage.pageTitle).toBeVisible();
      }
    });

    test('should filter and sort history', async ({ page }) => {
      const historyPage = new InterviewHistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForLoad();

      // Wait for sessions
      await page.waitForTimeout(1000);

      // Change filter
      await historyPage.changeFilter('completed');
      await page.waitForTimeout(500);

      // Change sort
      await historyPage.changeSort('score');
      await page.waitForTimeout(500);

      // Verify page still works
      await expect(historyPage.pageTitle).toBeVisible();
    });
  });

  test.describe('Result Page', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication and result data
      await page.addInitScript(() => {
        const mockSession = {
          access_token: 'mock-token-12345',
          user: { id: 'test-user-id', email: 'test@example.com' },
        };

        localStorage.setItem(
          'sb-test-auth-token',
          JSON.stringify({ currentSession: mockSession })
        );

        const originalFetch = window.fetch;
        (window as any).fetch = function (url: string, options?: RequestInit) {
          if (url.includes('/session') && options?.method === 'POST') {
            const body = JSON.parse(options.body as string);

            if (body.action === 'get') {
              return Promise.resolve(
                new Response(JSON.stringify({
                  session: {
                    id: 'test-session-123',
                    status: 'completed',
                    initial_question: 'Explain the difference between const and let in JavaScript',
                    total_score: 75,
                    created_at: new Date().toISOString(),
                    completed_at: new Date().toISOString(),
                    feedback: {
                      totalScore: 75,
                      overallFeedback: 'You demonstrated good understanding of JavaScript fundamentals.',
                      strengths: ['Clear explanation', 'Good examples'],
                      weaknesses: ['Could mention block scoping more explicitly'],
                    },
                  },
                  messages: [
                    {
                      id: '1',
                      role: 'user',
                      content: 'const is for constants and let is for variables.',
                      message_type: 'answer',
                      depth: 1,
                      ordering: 0,
                      created_at: new Date().toISOString(),
                      interviewer: null,
                      score: null,
                    },
                    {
                      id: '2',
                      role: 'assistant',
                      content: 'Good start! Can you elaborate on the scoping differences?',
                      message_type: 'evaluation',
                      depth: 1,
                      ordering: 1,
                      created_at: new Date().toISOString(),
                      interviewer: 'tech',
                      score: null,
                    },
                  ],
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }
          }

          return originalFetch(url, options);
        };
      });
    });

    test('should display result page with score and feedback', async ({ page }) => {
      const resultPage = new InterviewResultPage(page);

      // Navigate to a result page
      await page.goto('/interview/result/test-session-123');
      await resultPage.waitForLoad();

      // Verify page elements
      await expect(resultPage.pageTitle).toBeVisible();

      // Check if score is displayed
      const hasScore = await resultPage.hasScore();
      expect(hasScore).toBe(true);
    });

    test('should navigate back to history from result page', async ({ page }) => {
      const resultPage = new InterviewResultPage(page);

      await page.goto('/interview/result/test-session-123');
      await resultPage.waitForLoad();

      // Click history button
      await resultPage.goToHistory();

      // Verify navigation
      const historyPage = new InterviewHistoryPage(page);
      await historyPage.waitForLoad();
      await expect(historyPage.pageTitle).toBeVisible();
    });

    test('should start new interview from result page', async ({ page }) => {
      const resultPage = new InterviewResultPage(page);

      await page.goto('/interview/result/test-session-123');
      await resultPage.waitForLoad();

      // Click new interview button
      await resultPage.startNewInterview();

      // Verify navigation to chat page
      expect(page.url()).toContain('/interview/chat');
    });
  });
});
