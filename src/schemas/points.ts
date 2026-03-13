/** Point system constants and types */

export const POINTS = {
  WELCOME: 100,
  QUESTION_SUBMIT: 100,
  FEEDBACK: 25,
  INTERVIEW_COST: 50,
} as const;

export type PointTransactionType =
  | 'welcome'
  | 'question_submit'
  | 'feedback'
  | 'interview';

export interface PointBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: PointTransactionType;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export const POINT_TYPE_LABELS: Record<PointTransactionType, string> = {
  welcome: '웰컴 포인트',
  question_submit: '기출 기부 보상',
  feedback: '피드백 작성 보상',
  interview: '면접 이용',
};
