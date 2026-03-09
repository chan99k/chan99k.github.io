export interface InterviewerRole {
    id: string;
    name: string;
    perspective: string;
    focusAreas: string[];
    promptFragment: string;
}

export const INTERVIEWER_ROLES: Record<string, InterviewerRole> = {
    frontend: {
        id: 'frontend',
        name: '프론트엔드 면접관',
        perspective: '사용자 경험, 렌더링 성능, 컴포넌트 설계 관점',
        focusAreas: ['브라우저 동작', 'UI/UX', '상태 관리', '접근성'],
        promptFragment: '프론트엔드 개발자의 관점에서 답변을 평가하세요. 브라우저 동작 원리, 렌더링 최적화, 컴포넌트 설계, 사용자 경험에 초점을 맞추세요.',
    },
    backend: {
        id: 'backend',
        name: '백엔드 면접관',
        perspective: '서버 성능, 데이터 정합성, 확장성 관점',
        focusAreas: ['API 설계', '동시성', '캐싱', '보안'],
        promptFragment: '백엔드 개발자의 관점에서 답변을 평가하세요. API 설계, 동시성 제어, 데이터 정합성, 시스템 확장성에 초점을 맞추세요.',
    },
    dba: {
        id: 'dba',
        name: 'DBA 면접관',
        perspective: '데이터 모델링, 쿼리 최적화, 트랜잭션 관점',
        focusAreas: ['인덱싱', '정규화', '락', '복제'],
        promptFragment: 'DBA의 관점에서 답변을 평가하세요. 데이터 모델링, 인덱싱 전략, 쿼리 성능, 트랜잭션 격리 수준에 초점을 맞추세요.',
    },
} as const;

export type InterviewerId = keyof typeof INTERVIEWER_ROLES;
