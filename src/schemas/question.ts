import { z } from 'zod';

export const questionSchema = z.object({
	title: z.string(),
	answer: z.string(),
	category: z.string(),
	difficulty: z.enum(['junior', 'mid', 'senior']),
	tags: z.array(z.string()).default([]),
	source: z.enum(['curated', 'crowdsourced', 'ai-generated']).default('curated'),
	relatedPosts: z.array(z.string()).default([]),
	hints: z.array(z.string()).max(5).default([]),
});

export type Question = z.infer<typeof questionSchema>;
