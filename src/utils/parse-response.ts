// Utilities for parsing Claude's JSON interview responses
// Replaces greedy regex with balanced brace matching to handle nested JSON correctly

export interface ParsedInterviewResponse {
    evaluations: {
        interviewer: string;
        comment: string;
        score: { accuracy: number; depth: number; structure: number; practical: number; communication: number };
    }[];
    followUp: {
        interviewer: string;
        reaction: string;
        question: string;
        reason: string;
    } | null;
    shouldContinue: boolean;
    overallScore: number;
    summary: string;
}

/**
 * Parse Claude's interview response using balanced brace matching.
 * Tries ```json block first, then outermost balanced { }.
 */
export function parseInterviewResponse(rawText: string): ParsedInterviewResponse | null {
    // Strategy 1: Extract from ```json ... ``` fenced block
    const jsonBlockMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
        try {
            return JSON.parse(jsonBlockMatch[1]);
        } catch {
            // Fall through to strategy 2
        }
    }

    // Strategy 2: Balanced brace matching (not greedy regex)
    const braceStart = rawText.indexOf('{');
    if (braceStart !== -1) {
        let depth = 0;
        for (let i = braceStart; i < rawText.length; i++) {
            if (rawText[i] === '{') depth++;
            if (rawText[i] === '}') depth--;
            if (depth === 0) {
                try {
                    return JSON.parse(rawText.slice(braceStart, i + 1));
                } catch {
                    // Malformed JSON
                }
                break;
            }
        }
    }

    return null;
}

/**
 * Filter streaming text for display — hide raw JSON from the user.
 * During streaming, Claude may emit partial JSON that looks like garbage.
 * This function detects it and shows a placeholder instead.
 */
export function extractDisplayText(streamText: string): string {
    const trimmed = streamText.trimStart();

    // If the stream starts with a JSON block or raw {, it's evaluation data
    if (trimmed.startsWith('```json') || trimmed.startsWith('{')) {
        return '면접관이 평가 중입니다...';
    }

    // If a ```json block appears mid-stream, show only the text before it
    const jsonBlockStart = streamText.indexOf('```json');
    if (jsonBlockStart > 0) {
        return streamText.slice(0, jsonBlockStart).trimEnd();
    }

    // If a raw { appears mid-stream (after some text), show only the text before it
    const braceStart = streamText.indexOf('{');
    if (braceStart > 0) {
        const before = streamText.slice(0, braceStart).trimEnd();
        if (before.length > 0) return before;
        return '면접관이 평가 중입니다...';
    }

    return streamText;
}
