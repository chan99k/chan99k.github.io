// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import InterviewWidget from './InterviewWidget';

beforeEach(() => {
    sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
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
            difficulty: 2,
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

    it('shows answer input field', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        expect(screen.getByPlaceholderText('답변을 입력하세요...')).toBeDefined();
    });

    it('disables submit button when no API key', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        const submitBtn = screen.getByTitle('API 키를 먼저 설정하세요');
        expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    it('shows refresh question button', () => {
        render(<InterviewWidget questions={mockQuestions} posts={mockPosts} />);
        expect(screen.getByLabelText('Refresh question')).toBeDefined();
    });
});
