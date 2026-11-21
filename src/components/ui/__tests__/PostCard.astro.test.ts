// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import PostCard from '../PostCard.astro';
import { makePost } from '@/test/factories';

const getHeroImage = vi.fn();
vi.mock('@/lib/heroImages', () => ({ getHeroImage: (src?: string) => getHeroImage(src) }));

let container: AstroContainer;
beforeAll(async () => {
    // PostCard -> PostMeta uses the Icon component (a Vue glyph).
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('PostCard.astro', () => {
    it('links to the post and shows its title and meta', async () => {
        getHeroImage.mockReturnValue(undefined);
        const post = makePost({ slug: 'hello', frontmatter: { title: 'Hello World' } });
        const html = await container.renderToString(PostCard, { props: { post } });
        expect(html).toContain('href="/posts/hello"');
        expect(html).toContain('Hello World');
        expect(html).toContain('1 min read');
        expect(html).not.toContain('<img');
    });

    it('shows the cover image as a thumbnail when the post has one', async () => {
        getHeroImage.mockReturnValue({
            src: '/_astro/hero.png',
            width: 1200,
            height: 800,
            format: 'png',
        });
        const post = makePost({
            slug: 'with-cover',
            frontmatter: { heroImage: '/assets/img/hero.png' },
        });
        const html = await container.renderToString(PostCard, { props: { post } });
        expect(getHeroImage).toHaveBeenCalledWith('/assets/img/hero.png');
        expect(html).toContain('<img');
    });
});
