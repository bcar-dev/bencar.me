// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import { makePost } from '@/test/factories';
import { siteConfig } from '@/config/site';

const getAllPosts = vi.fn();
const getAllTags = vi.fn();
vi.mock('@/lib/posts', () => ({
    getAllPosts: () => getAllPosts(),
    getAllTags: () => getAllTags(),
}));

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

async function render() {
    const { default: Tags } = await import('../tags.astro');
    return container.renderToString(Tags);
}

describe('tags.astro', () => {
    it('titles the page Tags and renders the heading', async () => {
        getAllPosts.mockReturnValue([]);
        getAllTags.mockReturnValue([]);
        const html = await render();
        expect(html).toContain(`<title>Tags | ${siteConfig.name}</title>`);
        expect(html).toContain('>Tags</h1>');
    });

    it('passes every known tag into the filter island', async () => {
        getAllPosts.mockReturnValue([
            makePost({ slug: 'a', frontmatter: { tags: ['dev', 'personal'] } }),
        ]);
        getAllTags.mockReturnValue(['dev', 'personal']);
        const html = await render();
        expect(html).toContain('dev');
        expect(html).toContain('personal');
    });
});
