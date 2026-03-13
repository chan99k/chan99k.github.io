import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

const mockRpc = vi.fn();
const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();

const mockChainedQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnValue({ data: [], count: 0, error: null }),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: (table: string) => {
      if (table === 'submitted_questions') {
        return {
          insert: mockInsert.mockReturnValue({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'sq-1', status: 'pending' },
                error: null,
              }),
            }),
          }),
          select: mockChainedQuery.select.mockReturnValue(mockChainedQuery),
          update: mockUpdate.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: () => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'sq-1', status: 'approved', submitter_id: 'submitter-1' },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'interview_questions') {
        return {
          insert: vi.fn().mockReturnValue({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'iq-1' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    },
  }),
}));

const importHandler = async () => {
  const mod = await import('./submit-question.mts');
  return mod.default;
};

function makeRequest(body: Record<string, unknown>, email = 'user@example.com') {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-1', email } },
    error: null,
  });
  return new Request('https://blog.chan99k.dev/.netlify/functions/submit-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer valid-token',
      'Origin': 'https://blog.chan99k.dev',
    },
    body: JSON.stringify(body),
  });
}

const ADMIN_EMAIL = 'kjkj5868@gmail.com';

describe('submit-question.mts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submit action', () => {
    it('creates a pending question submission', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest({
          action: 'submit',
          data: {
            question: 'REST API와 GraphQL의 차이점은?',
            difficulty: 'mid',
            company_name: '네이버',
            is_anonymous: true,
          },
        }),
        {} as any,
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('sq-1');
      expect(data.status).toBe('pending');
    });

    it('rejects submission without question text', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest({
          action: 'submit',
          data: { difficulty: 'junior' },
        }),
        {} as any,
      );

      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } });

      const handler = await importHandler();
      const req = new Request('https://blog.chan99k.dev/.netlify/functions/submit-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid',
          'Origin': 'https://blog.chan99k.dev',
        },
        body: JSON.stringify({ action: 'submit', data: { question: 'test' } }),
      });
      const res = await handler(req, {} as any);
      expect(res.status).toBe(401);
    });
  });

  describe('my-submissions action', () => {
    it('returns user submissions list', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest({ action: 'my-submissions' }),
        {} as any,
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submissions).toBeDefined();
    });
  });

  describe('approve action (admin only)', () => {
    it('approves question and grants 100P to submitter', async () => {
      mockRpc.mockResolvedValue({ data: 200, error: null });

      const handler = await importHandler();
      const res = await handler(
        makeRequest(
          {
            action: 'approve',
            data: {
              submission_id: 'sq-1',
              category: 'network',
              title: 'REST vs GraphQL',
            },
          },
          ADMIN_EMAIL,
        ),
        {} as any,
      );

      expect(res.status).toBe(200);
      // Should grant points to submitter
      expect(mockRpc).toHaveBeenCalledWith('earn_points', expect.objectContaining({
        p_user_id: 'submitter-1',
        p_amount: 100,
        p_type: 'question_submit',
      }));
    });

    it('rejects non-admin approve attempts', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest(
          { action: 'approve', data: { submission_id: 'sq-1' } },
          'nonadmin@example.com',
        ),
        {} as any,
      );

      expect(res.status).toBe(403);
    });
  });

  describe('reject action (admin only)', () => {
    it('rejects question with reason', async () => {
      const handler = await importHandler();
      const res = await handler(
        makeRequest(
          {
            action: 'reject',
            data: { submission_id: 'sq-1', reason: '중복 문제' },
          },
          ADMIN_EMAIL,
        ),
        {} as any,
      );

      expect(res.status).toBe(200);
    });
  });
});
