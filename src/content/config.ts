import { defineCollection, z } from 'astro:content';
import { TAG_TAXONOMY } from '../data/tag-taxonomy';
import { questionSchema } from '../schemas/question';

const tagSchema = z.array(z.string()).default([]).superRefine((tags, ctx) => {
    const tier1Names = Object.keys(TAG_TAXONOMY);
    for (const tag of tags) {
        const segments = tag.split('/');
        const tier1 = segments[0];
        if (!tier1Names.includes(tier1)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Invalid 1tier tag "${tier1}". Must be one of: ${tier1Names.join(', ')}`,
            });
            continue;
        }
        if (segments.length >= 2) {
            const tier2 = segments[1];
            const validTier2 = TAG_TAXONOMY[tier1].children;
            if (!validTier2.includes(tier2)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid 2tier tag "${tier2}" under "${tier1}". Must be one of: ${validTier2.join(', ')}`,
                });
            }
        }
        // 3tier+ is free-form — no validation
    }
});

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
        tags: tagSchema,
        project: z.string().optional(),
        contentSource: z.enum(['original', 'ai-generated', 'ai-assisted']).default('ai-assisted'),
        draft: z.boolean().default(false),
        series: z.string().optional(),
        seriesOrder: z.number().optional(),
    }),
});

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        heroImage: z.string().optional(),
        techStack: z.array(z.string()),
        demoUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
    }),
});

const pages = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
    }),
});

const questions = defineCollection({
    type: 'content',
    schema: questionSchema,
});

const portfolio = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        category: z.enum(['problem', 'decision']),
        project: z.string(),
        techStack: z.array(z.string()).optional(),
    }),
});

export const collections = { blog, projects, pages, questions, portfolio };
