import { test as base, expect } from '@playwright/test';

/**
 * Mock authentication state for testing.
 * In a real scenario, you would either:
 * 1. Use Supabase test credentials
 * 2. Mock the auth API responses
 * 3. Use a test user account
 */
export interface AuthFixtures {
  authenticatedPage: any;
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Mock Supabase auth state
    await page.addInitScript(() => {
      // Mock localStorage for Supabase session
      const mockSession = {
        access_token: 'mock-token-12345',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            name: 'Test User',
          },
        },
      };

      localStorage.setItem(
        'sb-localhost-auth-token',
        JSON.stringify({
          currentSession: mockSession,
          expiresAt: Date.now() / 1000 + 3600,
        })
      );

      // Mock Supabase auth methods
      (window as any).__mockSupabaseAuth = {
        getUser: () => Promise.resolve({
          data: { user: mockSession.user },
          error: null,
        }),
        getSession: () => Promise.resolve({
          data: { session: mockSession },
          error: null,
        }),
        onAuthStateChange: (callback: any) => {
          setTimeout(() => callback('SIGNED_IN', mockSession), 0);
          return {
            data: { subscription: { unsubscribe: () => {} } },
          };
        },
        signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
      };
    });

    await use(page);
  },
});

export { expect };
