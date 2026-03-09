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
${ragSection}

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
답변 내용에 대한 짧은 리액션(1문장)과 꼬리질문만 하세요.
지원자의 블로그/프로젝트 자료가 있으면 적극 활용하세요.

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
    "reaction": "답변에 대한 짧은 리액션 (1문장, 예: '네, 그렇군요.' / '좋은 답변입니다.')",
    "question": "꼬리질문 내용",
    "reason": "이 질문을 하는 이유 (내부 메모, 지원자에게 보이지 않음)"
  },
  "shouldContinue": true,
  "overallScore": 72,
  "summary": "내부 종합 평가 메모 (지원자에게 보이지 않음)"
}
\`\`\`

${input.depth >= SESSION_CONFIG.minDepthForFinish
        ? '면접이 충분히 진행되었습니다. 답변 품질과 깊이에 따라 shouldContinue를 false로 설정하여 종합 피드백으로 전환할 수 있습니다.'
        : '아직 최소 깊이에 도달하지 않았으므로 shouldContinue는 반드시 true여야 합니다.'}

한국어로 응답해주세요.`;
}

export function buildFinalFeedbackPrompt(
    history: ChatMessage[],
    scores: number[],
): string {
    return `지금까지의 면접 대화를 종합하여 최종 피드백을 생성하세요.

## 대화 히스토리
${history.map((m) => `[${m.role}${m.interviewer ? ` - ${m.interviewer}` : ''}]: ${m.content}`).join('\n')}

## 각 턴 점수
${scores.map((s, i) => `Turn ${i + 1}: ${s}점`).join(', ')}

JSON으로 응답하세요:

\`\`\`json
{
  "totalScore": 75,
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2"],
  "studyGuide": [
    { "topic": "학습 주제", "reason": "이유", "resources": ["추천 키워드"] }
  ],
  "overallFeedback": "종합 피드백 (3-5문장)",
  "interviewerComments": {
    "frontend": "프론트엔드 관점 총평",
    "backend": "백엔드 관점 총평",
    "dba": "DBA 관점 총평"
  }
}
\`\`\`

한국어로 응답해주세요.`;
}
