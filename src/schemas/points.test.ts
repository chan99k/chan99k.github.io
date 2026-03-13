import { describe, it, expect } from 'vitest';
import { POINTS, POINT_TYPE_LABELS } from './points';
import type { PointBalance, PointTransaction, PointTransactionType } from './points';

describe('Points Schema', () => {
  describe('POINTS constants', () => {
    it('welcome bonus is 100P', () => {
      expect(POINTS.WELCOME).toBe(100);
    });

    it('question submit reward is 100P', () => {
      expect(POINTS.QUESTION_SUBMIT).toBe(100);
    });

    it('feedback reward is 25P', () => {
      expect(POINTS.FEEDBACK).toBe(25);
    });

    it('interview cost is 50P', () => {
      expect(POINTS.INTERVIEW_COST).toBe(50);
    });
  });

  describe('POINT_TYPE_LABELS', () => {
    it('has labels for all transaction types', () => {
      const types: PointTransactionType[] = [
        'welcome',
        'question_submit',
        'feedback',
        'interview',
      ];
      for (const type of types) {
        expect(POINT_TYPE_LABELS[type]).toBeDefined();
        expect(typeof POINT_TYPE_LABELS[type]).toBe('string');
      }
    });
  });

  describe('PointBalance type', () => {
    it('structure has required fields', () => {
      const balance: PointBalance = {
        balance: 100,
        total_earned: 200,
        total_spent: 100,
      };
      expect(balance.balance).toBe(100);
      expect(balance.total_earned).toBe(200);
      expect(balance.total_spent).toBe(100);
    });
  });

  describe('PointTransaction type', () => {
    it('structure has required fields', () => {
      const tx: PointTransaction = {
        id: 'uuid-1',
        user_id: 'user-1',
        amount: 100,
        type: 'welcome',
        reference_id: null,
        description: 'Welcome bonus',
        created_at: '2026-03-13T00:00:00Z',
      };
      expect(tx.amount).toBe(100);
      expect(tx.type).toBe('welcome');
    });
  });
});
