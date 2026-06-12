// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostNavigation from '../PostNavigation.astro';
import type { Post } from '@/types';

let container: AstroContainer;
beforeAll(async () => {
    container = await AstroContainer.create();
});

function makePost(slug: string, title: string): Post {
    return {
        slug,
        frontmatter: { title, description: '', pubDatetime: '2026-01-01', tags: [] },
        content: '',
        readingTime: '1 min read',
        headings: [],
        formattedDate: 'Jan 1, 2026',
    };
}

describe('PostNavigation.astro', () => {
    it('renders nothing when there are no neighbours', async () => {
        const html = await container.renderToString(PostNavigation, {
            props: { prevPost: null, nextPost: null },
        });
        expect(html.trim()).toBe('');
    });

    it('links to previous and next posts with their titles', async () => {
        const html = await container.renderToString(PostNavigation, {
            props: {
                prevPost: makePost('older', 'Older Post'),
                nextPost: makePost('newer', 'Newer Post'),
            },
        });
        expect(html).toContain('href="/posts/older"');
        expect(html).toContain('Older Post');
        expect(html).toContain('Previous Post');
        expect(html).toContain('href="/posts/newer"');
        expect(html).toContain('Newer Post');
        expect(html).toContain('Next Post');
    });
});
