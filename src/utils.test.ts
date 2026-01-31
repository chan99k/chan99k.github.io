import { describe, it, expect } from 'vitest';
import { randomInt, uniqueName, formatDate } from './utils';

describe('utils', () => {
    describe('randomInt', () => {
        it('should return a number between min and max', () => {
            const min = 1;
            const max = 10;
            const result = randomInt(min, max);
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        });
    });

    describe('formatDate', () => {
        it('formats date correctly', () => {
            const date = new Date('2025-07-08');
            expect(formatDate(date)).toBe('Jul 8, 2025');
        });
    });
});
