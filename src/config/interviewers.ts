export type InterviewCategory = 'developer' | 'lossAdjuster';

export interface InterviewerRole {
    id: string;
    name: string;
    category: InterviewCategory;
    perspective: string;
    focusAreas: string[];
    promptFragment: string;
}

export const INTERVIEWER_ROLES: Record<string, InterviewerRole> = {
    frontend: {
        id: 'frontend',
        name: '프론트엔드 면접관',
        category: 'developer',
        perspective: '사용자 경험, 렌더링 성능, 컴포넌트 설계 관점',
        focusAreas: ['브라우저 동작', 'UI/UX', '상태 관리', '접근성'],
        promptFragment: '프론트엔드 개발자의 관점에서 답변을 평가하세요. 브라우저 동작 원리, 렌더링 최적화, 컴포넌트 설계, 사용자 경험에 초점을 맞추세요.',
    },
    backend: {
        id: 'backend',
        name: '백엔드 면접관',
        category: 'developer',
        perspective: '서버 성능, 데이터 정합성, 확장성 관점',
        focusAreas: ['API 설계', '동시성', '캐싱', '보안'],
        promptFragment: '백엔드 개발자의 관점에서 답변을 평가하세요. API 설계, 동시성 제어, 데이터 정합성, 시스템 확장성에 초점을 맞추세요.',
    },
    dba: {
        id: 'dba',
        name: 'DBA 면접관',
        category: 'developer',
        perspective: '데이터 모델링, 쿼리 최적화, 트랜잭션 관점',
        focusAreas: ['인덱싱', '정규화', '락', '복제'],
        promptFragment: 'DBA의 관점에서 답변을 평가하세요. 데이터 모델링, 인덱싱 전략, 쿼리 성능, 트랜잭션 격리 수준에 초점을 맞추세요.',
    },
    lossAdjusterLaw: {
        id: 'lossAdjusterLaw',
        name: '보험법규 면접관',
        category: 'lossAdjuster',
        perspective: '보험업법, 보험계약법, 상법 보험편 관점',
        focusAreas: ['보험업법', '보험계약법', '약관 해석', '보험금 지급 기준'],
        promptFragment: '보험법규 전문가의 관점에서 답변을 평가하세요. 보험업법/보험계약법 조문 이해, 약관 해석, 보험금 지급/면책 사유, 손해배상 법리에 초점을 맞추세요.',
    },
    lossAdjusterClaim: {
        id: 'lossAdjusterClaim',
        name: '손해사정 실무 면접관',
        category: 'lossAdjuster',
        perspective: '손해액 산정, 보상 실무, 사고 조사 관점',
        focusAreas: ['손해액 산정', '과실 비율', '보상 절차', '사고 조사'],
        promptFragment: '손해사정 실무 전문가의 관점에서 답변을 평가하세요. 신체/재물 손해액 산정, 과실 비율 판단, 보험금 산출 과정, 보상 실무 절차에 초점을 맞추세요.',
    },
    lossAdjusterMedical: {
        id: 'lossAdjusterMedical',
        name: '의학이론 면접관',
        category: 'lossAdjuster',
        perspective: '의학 기초, 후유장해, 노동능력상실 관점',
        focusAreas: ['해부학 기초', '후유장해 평가', '노동능력상실률', '의학 용어'],
        promptFragment: '의학이론 전문가의 관점에서 답변을 평가하세요. 인체 해부학, 상해 유형별 후유장해 판정, 노동능력상실률 산정, McBride 평가법에 초점을 맞추세요.',
    },
} as const;

export function getInterviewersByCategory(category: InterviewCategory): InterviewerId[] {
    return (Object.keys(INTERVIEWER_ROLES) as InterviewerId[])
        .filter((id) => INTERVIEWER_ROLES[id].category === category);
}

export function detectCategory(interviewerIds: InterviewerId[]): InterviewCategory {
    const first = interviewerIds[0];
    return first ? INTERVIEWER_ROLES[first]?.category ?? 'developer' : 'developer';
}

export type InterviewerId = keyof typeof INTERVIEWER_ROLES;
