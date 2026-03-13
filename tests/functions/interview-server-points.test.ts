import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockContext } from '../../netlify/functions/utils/test-helpers';

// Mock environment
vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SERVER_ANTHROPIC_API_KEY', 'test-key');

const mockRpc = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
  }),
}));

const importHandler = async () => {
  const mod = await import('../../netlify/functions/interview-server.mts');
  return mod.default;
};

function makeRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request('https://blog.chan99k.dev/.netlify/functions/interview-server', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer valid-token',
      'Origin': 'https://blog.chan99k.dev',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('interview-server.mts - Point system integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // Mock successful Anthropic API call
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      body: new ReadableStream(),
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
    }) as any;
  });

  describe('point deduction', () => {
    it('deducts 50P for interview usage', async () => {
      // spend_points returns new balance (e.g., 50)
      mockRpc.mockResolvedValue({ data: 50, error: null });

      const handler = await importHandler();
      const res = await handler(
        makeRequest({
          system: 'You are an interviewer',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
        mockContext,
      );

      expect(mockRpc).toHaveBeenCalledWith('spend_points', expect.objectContaining({
        p_user_id: 'user-123',
        p_amount: 50,
        p_type: 'interview',
      }));
      expect(res.status).toBe(200);
    });

    it('returns 402 when points insufficient', async () => {
      // spend_points returns -1 for insufficient balance
      mockRpc.mockResolvedValue({ data: -1, error: null });

      const handler = await importHandler();
      const res = await handler(
        makeRequest({
          system: 'You are an interviewer',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
        mockContext,
      );

      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error).toContain('포인트');
    });
  });

  describe('BYOK bypass', () => {
    it('skips point deduction when user provides own API key', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest(
          {
            system: 'You are an interviewer',
            messages: [{ role: 'user', content: 'Hello' }],
          },
          { 'X-Use-Own-Key': 'true' },
        ),
        mockContext,
      );

      // spend_points should NOT be called for BYOK users
      expect(mockRpc).not.toHaveBeenCalledWith(
        'spend_points',
        expect.anything(),
      );
    });
  });

  describe('no email whitelist', () => {
    it('allows any authenticated user (no ALLOWED_EMAILS check)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'other-user', email: 'other@example.com' } },
        error: null,
      });
      mockRpc.mockResolvedValue({ data: 50, error: null });

      const handler = await importHandler();
      const res = await handler(
        makeRequest({
          system: 'You are an interviewer',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
        mockContext,
      );

      // Should NOT return 403 - any authenticated user with points can use
      expect(res.status).not.toBe(403);
    });
  });
});
