import type { InterviewCategory } from './interviewers';

export const EVALUATION_CRITERIA = {
    developer: {
        accuracy: 30,
        depth: 25,
        structure: 20,
        practical: 15,
        communication: 10,
    },
    lossAdjuster: {
        legalAccuracy: 30,
        conceptClarity: 25,
        caseApplication: 25,
        terminology: 10,
        communication: 10,
    },
} as const;

export const EVALUATION_CRITERIA_LABELS: Record<string, string> = {
    accuracy: '정확성',
    depth: '깊이/원리',
    structure: '구조화',
    practical: '실무 연결',
    communication: '커뮤니케이션',
    legalAccuracy: '법조문/판례 정확성',
    conceptClarity: '개념 명확성',
    caseApplication: '사례 적용 능력',
    terminology: '전문 용어 사용',
};

export function getEvaluationCriteria(category: InterviewCategory) {
    return EVALUATION_CRITERIA[category];
}

export const SESSION_CONFIG = {
    maxDepth: 10,
    minDepthForFinish: 3,
    searchTopK: 5,
    similarityThreshold: 0.7,
    evaluationCriteria: EVALUATION_CRITERIA.developer,
} as const;

export type SessionStatus = 'idle' | 'question_displayed' | 'searching' | 'evaluating' | 'feedback' | 'completed';

export interface SessionState {
    sessionId: string | null;
    status: SessionStatus;
    depth: number;
    currentQuestion: string;
    messages: ChatMessage[];
    scores: number[];
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    interviewer?: string;
    messageType?: 'question' | 'answer' | 'evaluation' | 'feedback';
    timestamp: number;
}

export const INITIAL_SESSION_STATE: SessionState = {
    sessionId: null,
    status: 'idle',
    depth: 0,
    currentQuestion: '',
    messages: [],
    scores: [],
};
