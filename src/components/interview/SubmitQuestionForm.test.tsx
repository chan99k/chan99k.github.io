// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import SubmitQuestionForm from './SubmitQuestionForm';

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
  mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token' } } });
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 'sq-1', status: 'pending' }),
  }) as any;
});

afterEach(() => cleanup());

describe('SubmitQuestionForm', () => {
  it('shows login prompt when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<SubmitQuestionForm />);
    expect(await screen.findByText('로그인 후 기출 문제를 제출할 수 있습니다.')).toBeDefined();
  });

  it('renders form when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<SubmitQuestionForm />);
    expect(await screen.findByLabelText(/면접 질문/)).toBeDefined();
    expect(screen.getByLabelText(/난이도/)).toBeDefined();
    expect(screen.getByLabelText(/기업명/)).toBeDefined();
    expect(screen.getByLabelText(/익명/)).toBeDefined();
  });

  it('disables submit button when question is empty', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<SubmitQuestionForm />);
    const btn = await screen.findByText('기출 문제 제출하기');
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('enables submit button when question is filled', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<SubmitQuestionForm />);
    const textarea = await screen.findByLabelText(/면접 질문/);
    fireEvent.change(textarea, { target: { value: 'REST와 GraphQL의 차이는?' } });
    const btn = screen.getByText('기출 문제 제출하기');
    expect(btn.hasAttribute('disabled')).toBe(false);
  });

  it('shows success message after submission', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    render(<SubmitQuestionForm />);
    const textarea = await screen.findByLabelText(/면접 질문/);
    fireEvent.change(textarea, { target: { value: 'REST와 GraphQL의 차이는?' } });

    const btn = screen.getByText('기출 문제 제출하기');
    fireEvent.click(btn);

    expect(await screen.findByTestId('submit-success')).toBeDefined();
    expect(screen.getByText('제출 완료!')).toBeDefined();
  });
});
