// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import InterviewWidget from './InterviewWidget';

beforeEach(() => {
    sessionStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ chunks: [] }),
    }) as any;
});
afterEach(() => cleanup());

const mockQuestions = [
    {
        slug: 'q1',
        data: {
            title: 'Test Question',
            answer: 'Test Answer',
            category: 'java',
            difficulty: 'junior' as const,
            tags: [],
            source: 'curated' as const,
            relatedPosts: [],
            hints: ['hint1'],
        },
        body: '',
    },
];

const mockPosts = [
    { slug: 'post-1', data: { title: 'Post 1', tags: [] } },
];

describe('InterviewWidget', () => {
    it('renders a question', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        expect(screen.getByText(/Test Question/)).toBeDefined();
    });

    it('shows API key banner when no key stored', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        expect(screen.getByPlaceholderText(/sk-ant-/i)).toBeDefined();
    });

    it('shows category filter', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        // The select should have the 'java' option
        const options = screen.getAllByRole('option');
        expect(options.some(o => o.textContent === 'java')).toBe(true);
    });

    it('shows next question button', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        expect(screen.getByText('다음 질문')).toBeDefined();
    });
});
