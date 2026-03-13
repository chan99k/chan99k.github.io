import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockContext } from '../../netlify/functions/utils/test-helpers';

// Mock Supabase client
const mockRpc = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            range: () => ({
              data: [],
              count: 0,
              error: null,
            }),
          }),
        }),
      }),
    }),
  }),
}));

// Dynamic import after mock
const importHandler = async () => {
  const mod = await import('../../netlify/functions/points.mts');
  return mod.default;
};

function makeRequest(body: Record<string, unknown>, token = 'valid-token') {
  return new Request('https://blog.chan99k.dev/.netlify/functions/points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://blog.chan99k.dev',
    },
    body: JSON.stringify(body),
  });
}

const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('points.mts Netlify Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe('balance action', () => {
    it('returns point balance for authenticated user', async () => {
      mockRpc.mockResolvedValue({
        data: [{ balance: 150, total_earned: 200, total_spent: 50 }],
        error: null,
      });

      const handler = await importHandler();
      const res = await handler(makeRequest({ action: 'balance' }), mockContext);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.balance).toBe(150);
      expect(data.total_earned).toBe(200);
      expect(data.total_spent).toBe(50);
    });

    it('returns zero balance for new user', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      const handler = await importHandler();
      const res = await handler(makeRequest({ action: 'balance' }), mockContext);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.balance).toBe(0);
    });
  });

  describe('history action', () => {
    it('returns paginated transaction history', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest({ action: 'history', limit: 10, offset: 0 }),
        mockContext,
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transactions).toBeDefined();
      expect(Array.isArray(data.transactions)).toBe(true);
    });
  });

  describe('authentication', () => {
    it('returns 401 without auth header', async () => {
      const req = new Request('https://blog.chan99k.dev/.netlify/functions/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://blog.chan99k.dev',
        },
        body: JSON.stringify({ action: 'balance' }),
      });

      const handler = await importHandler();
      const res = await handler(req, mockContext);
      expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } });

      const handler = await importHandler();
      const res = await handler(makeRequest({ action: 'balance' }), mockContext);
      expect(res.status).toBe(401);
    });
  });

  describe('unknown action', () => {
    it('returns 400 for unknown action', async () => {
      const handler = await importHandler();
      const res = await handler(makeRequest({ action: 'invalid' }), mockContext);
      expect(res.status).toBe(400);
    });
  });
});
