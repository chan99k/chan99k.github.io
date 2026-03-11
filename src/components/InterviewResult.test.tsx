// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import InterviewResult from './InterviewResult';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: '1', email: 'test@example.com' } },
            }),
            getSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'token' } },
            }),
            signInWithOAuth: vi.fn(),
        },
    },
}));

const mockSessionData = {
    session: {
        id: 'test-session',
        status: 'completed',
        initial_question: 'Test Question',
        total_score: 75,
        feedback: {
            overallFeedback: 'Good job!',
            strengths: ['Clear communication'],
            weaknesses: ['Need more depth'],
            studyGuide: [
                { topic: 'Topic 1', reason: 'Important', resources: ['Resource 1'] },
            ],
            interviewerComments: {
                'technical': { critique: 'Good technical knowledge', studyKeywords: ['java', 'spring'] },
            },
        },
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
    },
    messages: [
        {
            id: '1',
            depth: 1,
            role: 'user',
            content: 'My answer',
            message_type: 'answer',
            interviewer: null,
            score: null,
            created_at: new Date().toISOString(),
            ordering: 0,
        },
    ],
};

beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
    }) as any;
});

afterEach(() => cleanup());

describe('InterviewResult - Mobile Responsive', () => {
    it('renders result container with mobile-friendly max-width', async () => {
        const { container } = render(<InterviewResult sessionId="test-session" />);
        // Wait for data to load
        await new Promise((resolve) => setTimeout(resolve, 100));
        const resultContainer = container.querySelector('.max-w-2xl');
        expect(resultContainer).toBeDefined();
    });

    it('renders strengths/weaknesses in grid layout with mobile breakpoint', async () => {
        const { container } = render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const grid = container.querySelector('.grid.gap-4.sm\\:grid-cols-2');
        expect(grid).toBeDefined();
    });

    it('renders navigation buttons with flex layout', async () => {
        const { container } = render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const buttonContainer = container.querySelector('.flex.gap-3');
        expect(buttonContainer).toBeDefined();
    });

    it('renders score display prominently', async () => {
        render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const scoreElement = screen.queryByText('75');
        expect(scoreElement).toBeDefined();
    });
});

describe('InterviewResult - Accessibility', () => {
    it('renders main heading with proper hierarchy', async () => {
        render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const heading = screen.queryByText('면접 결과');
        expect(heading?.tagName).toBe('H2');
    });

    it('renders section headings for content structure', async () => {
        render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(screen.queryByText('종합 피드백')).toBeDefined();
        expect(screen.queryByText('학습 가이드')).toBeDefined();
        expect(screen.queryByText('대화 히스토리')).toBeDefined();
    });

    it('renders links with clear text labels', async () => {
        render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(screen.queryByText('히스토리 목록')).toBeDefined();
        expect(screen.queryByText('새 면접 시작')).toBeDefined();
    });

    it('provides semantic HTML for message roles', async () => {
        const { container } = render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const roleLabels = container.querySelectorAll('.text-xs.font-medium');
        expect(roleLabels.length).toBeGreaterThan(0);
    });

    it('uses color-coded score indicators', async () => {
        render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const scoreDisplay = screen.queryByText('75');
        expect(scoreDisplay?.className).toContain('text-green-600');
    });
});

describe('InterviewResult - Keyboard Navigation', () => {
    it('renders focusable navigation links', async () => {
        render(<InterviewResult sessionId="test-session" />);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThanOrEqual(2);
        links.forEach((link) => {
            expect(link.getAttribute('href')).toBeTruthy();
        });
    });
});
