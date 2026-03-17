import { describe, it, expect } from 'vitest';
import { buildEvaluationPrompt } from './claude';

describe('buildEvaluationPrompt', () => {
    it('includes question, answer, difficulty, and blog context', () => {
        const prompt = buildEvaluationPrompt({
            question: 'HashMap vs Hashtable?',
            modelAnswer: 'HashMap은 비동기...',
            userAnswer: '동기화 차이입니다',
            difficulty: 2,
            blogContext: [
                { title: 'Meta Tag', chunk: 'HashSet은...' },
            ],
        });

        expect(prompt).toContain('HashMap vs Hashtable?');
        expect(prompt).toContain('동기화 차이입니다');
        expect(prompt).toContain('HashSet은...');
        expect(prompt).toContain('Meta Tag');
        expect(prompt).toContain('★★☆☆☆ (2/5)');
    });

    it('includes rubric table with criteria', () => {
        const prompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 3,
            blogContext: [],
        });

        expect(prompt).toContain('정확성');
        expect(prompt).toContain('깊이');
        expect(prompt).toContain('구조화');
        expect(prompt).toContain('실무 연결');
        expect(prompt).toContain('커뮤니케이션');
        expect(prompt).toContain('100');
    });

    it('adjusts weights by difficulty', () => {
        const easyPrompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 1,
            blogContext: [],
        });
        const hardPrompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 5,
            blogContext: [],
        });

        // Difficulty 1: accuracy weight=1.50, depth weight=0.80
        expect(easyPrompt).toContain('x1.50');
        // Difficulty 5: accuracy weight=0.80, depth weight=1.50
        expect(hardPrompt).toContain('x0.80');
    });

    it('omits blog section when no context', () => {
        const prompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 3,
            blogContext: [],
        });

        expect(prompt).not.toContain('참고 블로그 자료');
    });
});
