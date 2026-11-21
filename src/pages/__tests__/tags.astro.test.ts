// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import { makePost } from '@/test/factories';
import { siteConfig } from '@/config/site';

const getAllPosts = vi.fn();
const getAllTags = vi.fn();
const getHeroImage = vi.fn();
vi.mock('@/lib/posts', () => ({
    getAllPosts: () => getAllPosts(),
    getAllTags: () => getAllTags(),
}));
vi.mock('@/lib/heroImages', () => ({ getHeroImage: (src?: string) => getHeroImage(src) }));

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

    it('hands the filter an optimized cover thumbnail for each post that has one', async () => {
        getAllPosts.mockReturnValue([
            makePost({ slug: 'with-cover', frontmatter: { heroImage: '/assets/img/cover.png' } }),
            makePost({ slug: 'no-cover' }),
        ]);
        getAllTags.mockReturnValue([]);
        getHeroImage.mockImplementation((src?: string) =>
            src ? { src: '/_astro/cover.png', width: 1600, height: 900, format: 'png' } : undefined
        );
        const html = await render();
        // Only the cover thumbnails: the header's profile photo is also an <img>.
        const images = html.match(/<img[^>]*cover\.png[^>]*>/g) ?? [];
        expect(images).toHaveLength(1);
        expect(images[0]).toMatch(/srcset="[^"]*2x"/);
    });
});
