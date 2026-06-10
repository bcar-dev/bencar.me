import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Body markdown is rendered through this collection (gfm + slug + autolink anchors
// configured in astro.config.mjs, and relative body images optimized via astro:assets).
// Post metadata for listings still comes from src/lib/posts.ts, so this schema only
// needs to validate frontmatter, not feed the listing pages.
const blog = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDatetime: z.coerce.date(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().optional(),
        heroImage: z.string().optional(),
        heroImageAlt: z.string().optional(),
    }),
});

export const collections = { blog };
