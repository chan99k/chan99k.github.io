import { EVALUATION_CRITERIA, TOTAL_SCORE } from '../config/evaluation';

interface EvaluationInput {
    question: string;
    modelAnswer: string;
    userAnswer: string;
    difficulty: 'junior' | 'mid' | 'senior';
    blogContext: { title: string; chunk: string }[];
}

export function buildEvaluationPrompt(input: EvaluationInput): string {
    const blogSection = input.blogContext.length > 0
        ? `\n\n## 참고 블로그 자료\n${input.blogContext.map((c) => `### ${c.title}\n${c.chunk}`).join('\n\n')}`
        : '';

    // Build rubric table with difficulty-weighted scores
    const rubricRows = EVALUATION_CRITERIA.map((criterion) => {
        const weight = criterion.weight[input.difficulty];
        return `| ${criterion.name} | ${criterion.maxScore} | x${weight} | ${criterion.description} |`;
    }).join('\n');

    return `당신은 기술 면접 평가관입니다. 다음 면접 질문에 대한 답변을 평가해주세요.

## 면접 질문
${input.question}

## 난이도
${input.difficulty} 레벨

## 모범 답안
${input.modelAnswer}

## 지원자 답변
${input.userAnswer}
${blogSection}

## 평가 루브릭 (${TOTAL_SCORE}점 만점)

| 관점 | 배점 | 가중치(${input.difficulty}) | 설명 |
|------|------|----------------------------|------|
${rubricRows}

가중치 적용: 각 관점의 원점수에 가중치를 곱한 후, 총점 ${TOTAL_SCORE}점으로 정규화합니다.

## 후속 학습 가이드
- 부족한 관점에 대해 구체적인 학습 주제를 제안해주세요
- 관련 키워드, 개념, 기술을 포함해주세요

## 응답 형식
다음 JSON 형식으로 응답해주세요:

\`\`\`json
{
  "totalScore": 72,
  "criteria": [
    { "id": "accuracy", "score": 25, "maxScore": 30, "feedback": "핵심 차이점을 정확히 설명..." },
    { "id": "depth", "score": 15, "maxScore": 25, "feedback": "내부 구현 원리에 대한..." },
    { "id": "structure", "score": 16, "maxScore": 20, "feedback": "논리적 순서로 잘 구성..." },
    { "id": "practical", "score": 10, "maxScore": 15, "feedback": "ConcurrentHashMap 언급..." },
    { "id": "communication", "score": 6, "maxScore": 10, "feedback": "표현이 명확하지만..." }
  ],
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선점 1", "개선점 2"],
  "studyGuide": ["학습 주제 1", "학습 주제 2"],
  "summary": "종합 평가 한 줄"
}
\`\`\`

피드백은 한국어로 작성해주세요.`;
}

export async function* streamEvaluation(
    apiKey: string,
    prompt: string,
): AsyncGenerator<string> {
    const response = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-claude-api-key': apiKey,
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            stream: true,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Claude API error: ${response.status} ${err}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    yield parsed.delta.text;
                }
            } catch {
                // skip non-JSON lines
            }
        }
    }
}
