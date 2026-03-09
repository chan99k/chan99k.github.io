export const SESSION_CONFIG = {
    maxDepth: 10,
    minDepthForFinish: 3,
    searchTopK: 5,
    similarityThreshold: 0.7,
    evaluationCriteria: {
        accuracy: 30,
        depth: 25,
        structure: 20,
        practical: 15,
        communication: 10,
    },
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
