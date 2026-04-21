import { INTERVIEWER_ROLES, type InterviewerId } from '../config/interviewers';
import { SESSION_CONFIG } from '../config/interview-session';
import type { ChatMessage } from '../config/interview-session';

interface PromptInput {
    question: string;
    userAnswer: string;
    chunks: { slug: string; title: string; chunk_text: string; source: string }[];
    history: ChatMessage[];
    depth: number;
    interviewers?: InterviewerId[];
    jdContext?: { company: string; jd: string };
    referenceAnswer?: string;
    referenceExplanation?: string;
}

export function buildInterviewSystemPrompt(input: PromptInput): string {
    const activeInterviewers = (input.interviewers ?? ['frontend', 'backend', 'dba'])
        .map((id) => INTERVIEWER_ROLES[id])
        .filter(Boolean);

    const interviewerSection = activeInterviewers
        .map((r) => `### ${r.name}\n${r.promptFragment}`)
        .join('\n\n');

    const ragSection = input.chunks.length > 0
        ? `\n\n## 지원자 관련 자료 (블로그/프로젝트)\n${input.chunks.map((c) =>
            `- [${c.source}] ${c.title}: ${c.chunk_text.slice(0, 300)}`
        ).join('\n')}`
        : '';

    const jdSection = input.jdContext
        ? `\n\n## 기업 맥락\n- 기업: ${input.jdContext.company}\n- 채용공고:\n${input.jdContext.jd}\n\n이 기업의 기술 스택과 채용 요구사항을 고려하여 질문하세요.`
        : '';

    const referenceSection = (input.referenceAnswer || input.referenceExplanation)
        ? `\n\n## 채점 참고 자료 (지원자에게 보이지 않음)
${input.referenceAnswer ? `### 모범 답안\n${input.referenceAnswer}\n` : ''}${input.referenceExplanation ? `### 상세 해설\n${input.referenceExplanation}\n` : ''}
위 모범 답안을 기준으로 정확성을 채점하세요. 모범 답안에 없는 추가 지식을 답변하면 깊이 점수에 가산하세요.`
        : '';

    const criteria = SESSION_CONFIG.evaluationCriteria;

    return `당신은 AI 모의면접 시스템의 면접관 패널입니다.
다수의 면접관이 각자의 전문 관점에서 지원자를 평가합니다.

## 면접관 패널
${interviewerSection}

## 현재 면접 상태
- 질문 깊이: ${input.depth}/${SESSION_CONFIG.maxDepth}
- 최소 깊이: ${SESSION_CONFIG.minDepthForFinish}

## 초기 질문
${input.question}
${ragSection}${jdSection}${referenceSection}

## 평가 기준 (${Object.values(criteria).reduce((a, b) => a + b, 0)}점 만점)
- 정확성: ${criteria.accuracy}점
- 깊이/원리: ${criteria.depth}점
- 구조화: ${criteria.structure}점
- 실무 연결: ${criteria.practical}점
- 커뮤니케이션: ${criteria.communication}점

## 응답 규칙

면접관이 돌아가며 꼬리질문을 합니다.
**중요: 면접 진행 중에는 평가나 피드백을 지원자에게 직접 말하지 마세요.**
실제 면접처럼, 답변을 듣고 바로 다음 질문으로 넘어가세요.

### 리액션 규칙
- "훌륭합니다", "좋은 답변입니다", "잘 설명해주셨네요" 같은 평가적 반응 금지
- 중립적 확인만 허용: "네.", "알겠습니다.", "그렇군요.", "음."
- 가능한 리액션 생략하고 바로 질문으로 넘어가세요

### 질문 흐름 (순서대로 진행)
1. **CS 기초 확인**: 개념의 정의, 기본 원리 검증
2. **관련 키워드 심화**: 기술적 깊이, 내부 동작 원리, 트레이드오프
3. **실무 경험 연결**: 지원자의 블로그/프로젝트 자료(RAG)를 활용하여 실제 경험 탐색

지원자의 블로그/프로젝트 자료가 있으면 2-3단계에서 적극 활용하세요.

JSON으로 응답하세요:

\`\`\`json
{
  "evaluations": [
    {
      "interviewer": "frontend|backend|dba",
      "comment": "내부 평가 메모 (지원자에게 보이지 않음)",
      "score": { "accuracy": 0, "depth": 0, "structure": 0, "practical": 0, "communication": 0 }
    }
  ],
  "followUp": {
    "interviewer": "다음 질문을 하는 면접관 ID",
    "reaction": "중립적 확인만 (예: '네.' / '알겠습니다.' / '그렇군요.') 또는 생략",
    "question": "꼬리질문 내용",
    "reason": "이 질문을 하는 이유 (내부 메모, 지원자에게 보이지 않음)"
  },
  "shouldContinue": true,
  "overallScore": 72,
  "summary": "내부 종합 평가 메모 (지원자에게 보이지 않음)"
}
\`\`\`

${input.depth >= SESSION_CONFIG.minDepthForFinish
        ? `면접이 충분히 진행되었습니다. 다음 상황에서는 shouldContinue를 false로 설정하여 조기 종료하세요:

### 조기 종료 조건
1. **명확한 숙달**: 2-3회 연속으로 고득점(80점 이상) 답변이 나온 경우
2. **근본적 이해 부족**: "모르겠습니다" 반복 또는 근본적으로 잘못된 답변이 계속되는 경우
3. **정체**: 새로운 정보 없이 비슷한 수준의 답변이 반복되는 경우

위 조건에 해당하지 않으면 계속 진행하세요.`
        : '아직 최소 깊이에 도달하지 않았으므로 shouldContinue는 반드시 true여야 합니다.'}

한국어로 응답해주세요.`;
}

export function buildFinalFeedbackPrompt(
    history: ChatMessage[],
    scores: number[],
    interviewers?: InterviewerId[],
): string {
    const activeInterviewers = (interviewers ?? ['frontend', 'backend', 'dba'])
        .map((id) => INTERVIEWER_ROLES[id])
        .filter(Boolean);
    return `지금까지의 면접 대화를 종합하여 최종 피드백을 생성하세요.

## 대화 히스토리
${history.map((m) => `[${m.role}${m.interviewer ? ` - ${m.interviewer}` : ''}]: ${m.content}`).join('\n')}

## 각 턴 점수
${scores.map((s, i) => `Turn ${i + 1}: ${s}점`).join(', ')}

## 피드백 원칙
**"잘한 건 당연한 거라서 의미가 없어요. 미흡한 부분을 조금이라도 고쳐야죠."**

- 칭찬은 최소화하고 비판과 개선점에 집중하세요
- 각 면접관은 자신의 전문 영역에서 구체적인 부족한 점을 지적하세요
- 각 면접관이 학습이 필요한 구체적 키워드/주제를 제시하세요
- "강점"보다 "약점"과 "학습 가이드"를 더 상세하게 작성하세요

## 참여 면접관
${activeInterviewers.map((r) => `- ${r.id}: ${r.name} (${r.perspective})`).join('\n')}

JSON으로 응답하세요:

\`\`\`json
{
  "totalScore": 75,
  "strengths": ["강점1", "강점2"],
  "weaknesses": ["약점1", "약점2", "약점3", "약점4"],
  "studyGuide": [
    { "topic": "학습 주제", "reason": "부족한 이유", "resources": ["추천 키워드1", "추천 키워드2"] }
  ],
  "overallFeedback": "종합 피드백 (비판적 관점, 3-5문장)",
  "interviewerComments": {
${activeInterviewers.map((r) => `    "${r.id}": {
      "critique": "${r.name} 관점에서 부족한 점 (비판적)",
      "studyKeywords": ["학습 필요 키워드1", "학습 필요 키워드2", "학습 필요 키워드3"]
    }`).join(',\n')}
  }
}
\`\`\`

한국어로 응답해주세요.`;
}
