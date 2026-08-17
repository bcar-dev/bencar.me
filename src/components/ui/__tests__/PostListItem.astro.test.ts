// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import PostListItem from '../PostListItem.astro';

let container: AstroContainer;
beforeAll(async () => {
    // PostListItem -> PostMeta uses the Icon component (a Vue glyph).
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

const base = {
    slug: 'hello-world',
    title: 'Hello World',
    pubDatetime: '2026-02-21',
    readingTime: '3 min read',
};

describe('PostListItem.astro', () => {
    it('renders the title link, meta and tags', async () => {
        const html = await container.renderToString(PostListItem, {
            props: { ...base, tags: ['dev', 'personal'] },
        });
        expect(html).toContain('href="/posts/hello-world"');
        expect(html).toContain('Hello World');
        expect(html).toContain('3 min read');
        expect(html).toContain('href="/tags?tag=dev"');
        expect(html).toContain('#personal');
    });

    it('falls back to the description when no slot is provided', async () => {
        const html = await container.renderToString(PostListItem, {
            props: { ...base, description: 'A first post' },
        });
        expect(html).toContain('A first post');
    });

    it('renders slot content instead of the description', async () => {
        const html = await container.renderToString(PostListItem, {
            props: { ...base, description: 'A first post' },
            slots: { default: '<div>custom slot</div>' },
        });
        expect(html).toContain('custom slot');
        expect(html).not.toContain('A first post');
    });
});
