// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import MyPage from './MyPage';

const mockGetUser = vi.fn();
const mockGetSession = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
    const body = JSON.parse(opts.body);
    if (body.action === 'balance') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ balance: 150, total_earned: 250, total_spent: 100 }),
      });
    }
    if (body.action === 'history') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          transactions: [{
            id: 'tx-1', user_id: 'u1', amount: 100, type: 'welcome',
            reference_id: null, description: '웰컴 포인트', created_at: '2026-03-13T00:00:00Z',
          }],
          total: 1,
        }),
      });
    }
    if (body.action === 'list') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sessions: [], total: 0 }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as any;

  mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token' } } });
});

afterEach(() => cleanup());

describe('MyPage', () => {
  it('shows login prompt when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<MyPage />);
    expect(await screen.findByText('로그인이 필요합니다.')).toBeDefined();
  });

  it('shows points balance when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<MyPage />);
    expect(await screen.findByTestId('balance')).toBeDefined();
    expect(screen.getByTestId('balance').textContent).toContain('150P');
  });

  it('shows point card with earn/spend totals', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<MyPage />);
    expect(await screen.findByTestId('points-card')).toBeDefined();
    expect(screen.getByTestId('points-card').textContent).toContain('250P');
    expect(screen.getByTestId('points-card').textContent).toContain('100P');
  });

  it('has tabs for points, history, submissions', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<MyPage />);
    expect(await screen.findByText('포인트')).toBeDefined();
    expect(screen.getByText('면접 히스토리')).toBeDefined();
    expect(screen.getByText('내 기출 제출')).toBeDefined();
  });
});
