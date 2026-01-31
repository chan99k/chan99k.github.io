import { describe, it, expect } from 'vitest';
import { randomInt, uniqueName } from './utils';

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
});
