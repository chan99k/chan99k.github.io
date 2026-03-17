export interface EvaluationCriterion {
    id: string;
    name: string;
    description: string;
    maxScore: number;
    // Weight curve: [weight_at_1star, weight_at_5star] - linearly interpolated
    weightRange: [number, number];
}

export const EVALUATION_CRITERIA: EvaluationCriterion[] = [
    {
        id: 'accuracy',
        name: '정확성',
        description: '기술적 사실의 정확도, 용어의 올바른 사용',
        maxScore: 30,
        weightRange: [1.5, 0.8],
    },
    {
        id: 'depth',
        name: '깊이/원리',
        description: '표면적 설명을 넘어 동작 원리, 내부 구조 이해',
        maxScore: 25,
        weightRange: [0.8, 1.5],
    },
    {
        id: 'structure',
        name: '구조화',
        description: '논리적 순서, 핵심-부연 구분, 체계적 전달',
        maxScore: 20,
        weightRange: [1.0, 1.0],
    },
    {
        id: 'practical',
        name: '실무 연결',
        description: '실제 프로젝트 경험, 트레이드오프, 대안 기술 언급',
        maxScore: 15,
        weightRange: [0.5, 1.5],
    },
    {
        id: 'communication',
        name: '커뮤니케이션',
        description: '명확하고 간결한 표현, 면접관이 이해하기 쉬운 설명',
        maxScore: 10,
        weightRange: [1.0, 1.0],
    },
];

// Total: 100 points
export const TOTAL_SCORE = EVALUATION_CRITERIA.reduce((sum, c) => sum + c.maxScore, 0);

export function getDifficultyWeight(criterion: EvaluationCriterion, difficulty: number): number {
    const [low, high] = criterion.weightRange;
    // Linear interpolation: difficulty 1 → low, difficulty 5 → high
    return low + (high - low) * (difficulty - 1) / 4;
}
