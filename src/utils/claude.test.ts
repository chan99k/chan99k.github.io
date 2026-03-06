import { describe, it, expect } from 'vitest';
import { buildEvaluationPrompt } from './claude';

describe('buildEvaluationPrompt', () => {
    it('includes question, answer, difficulty, and blog context', () => {
        const prompt = buildEvaluationPrompt({
            question: 'HashMap vs Hashtable?',
            modelAnswer: 'HashMap은 비동기...',
            userAnswer: '동기화 차이입니다',
            difficulty: 'junior',
            blogContext: [
                { title: 'Meta Tag', chunk: 'HashSet은...' },
            ],
        });

        expect(prompt).toContain('HashMap vs Hashtable?');
        expect(prompt).toContain('동기화 차이입니다');
        expect(prompt).toContain('HashSet은...');
        expect(prompt).toContain('Meta Tag');
        expect(prompt).toContain('junior');
    });

    it('includes rubric table with criteria', () => {
        const prompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 'mid',
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
        const juniorPrompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 'junior',
            blogContext: [],
        });
        const seniorPrompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 'senior',
            blogContext: [],
        });

        // Junior should emphasize accuracy (1.5), Senior should emphasize depth (1.5)
        expect(juniorPrompt).toContain('1.5');
        expect(seniorPrompt).toContain('1.5');
    });

    it('omits blog section when no context', () => {
        const prompt = buildEvaluationPrompt({
            question: 'Q',
            modelAnswer: 'A',
            userAnswer: 'U',
            difficulty: 'mid',
            blogContext: [],
        });

        expect(prompt).not.toContain('참고 블로그 자료');
    });
});
