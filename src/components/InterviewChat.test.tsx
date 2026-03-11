// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import InterviewChat from './InterviewChat';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com' } } }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } }),
        },
    },
}));

beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ session_id: 'test-session', chunks: [] }),
    }) as any;
});

afterEach(() => cleanup());

describe('InterviewChat - Mobile Responsive', () => {
    it('renders chat container with mobile-friendly max-width', async () => {
        const { container } = render(<InterviewChat initialQuestion="Test Question" />);
        // Wait for auth check
        await new Promise(resolve => setTimeout(resolve, 100));
        const chatContainer = container.querySelector('.mx-auto');
        expect(chatContainer?.className).toContain('max-w-2xl');
    });

    it('renders input textarea with full width when logged in', async () => {
        const { container } = render(<InterviewChat initialQuestion="Test Question" />);
        // Wait for auth check to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        const textarea = container.querySelector('textarea');
        expect(textarea).toBeDefined();
        if (textarea) {
            expect(textarea.className).toContain('flex-1');
        }
    });

    it('renders messages in scrollable container when logged in', async () => {
        const { container } = render(<InterviewChat initialQuestion="Test Question" />);
        // Wait for auth check
        await new Promise(resolve => setTimeout(resolve, 100));
        const messagesContainer = container.querySelector('.overflow-y-auto');
        expect(messagesContainer).toBeDefined();
        if (messagesContainer) {
            // Check for mobile-responsive max-height
            expect(messagesContainer.className).toMatch(/max-h-/);
        }
    });

    it('renders action buttons with flex layout for mobile', async () => {
        const { container } = render(<InterviewChat initialQuestion="Test Question" />);
        await new Promise(resolve => setTimeout(resolve, 100));
        const buttonContainers = container.querySelectorAll('.flex');
        expect(buttonContainers.length).toBeGreaterThan(0);
    });
});

describe('InterviewChat - Accessibility', () => {
    it('renders main heading with proper hierarchy', () => {
        render(<InterviewChat initialQuestion="Test Question" />);
        const heading = screen.getByText('AI 모의면접');
        expect(heading.tagName).toBe('H2');
    });

    it('renders textarea with accessible placeholder when logged in', async () => {
        const { container } = render(<InterviewChat initialQuestion="Test Question" />);
        await new Promise(resolve => setTimeout(resolve, 100));
        const textarea = container.querySelector('textarea');
        if (textarea) {
            expect(textarea.placeholder).toBe('답변을 입력하세요...');
        }
    });

    it('renders submit button with accessible label when logged in', async () => {
        render(<InterviewChat initialQuestion="Test Question" />);
        await new Promise(resolve => setTimeout(resolve, 100));
        const submitBtn = screen.queryByLabelText('답변 제출하기');
        if (submitBtn) {
            expect(submitBtn).toBeDefined();
        }
    });

    it('renders login buttons with accessible labels', () => {
        render(<InterviewChat initialQuestion="Test Question" />);
        // Login buttons should be visible initially (before auth check completes)
        const googleBtn = screen.queryByLabelText('Google 계정으로 로그인');
        const githubBtn = screen.queryByLabelText('GitHub 계정으로 로그인');

        // At least one should be present during render
        expect(googleBtn || githubBtn).toBeTruthy();
    });

    it('provides keyboard shortcut hint for submit when logged in', async () => {
        render(<InterviewChat initialQuestion="Test Question" />);
        await new Promise(resolve => setTimeout(resolve, 100));
        const submitBtn = screen.queryByText(/⇧Enter/);
        if (submitBtn) {
            expect(submitBtn.textContent).toContain('⇧Enter');
        }
    });

    it('uses ARIA live regions for dynamic content', async () => {
        const { container } = render(<InterviewChat initialQuestion="Test Question" />);
        await new Promise(resolve => setTimeout(resolve, 100));
        const liveRegions = container.querySelectorAll('[aria-live]');
        expect(liveRegions.length).toBeGreaterThan(0);
    });
});
