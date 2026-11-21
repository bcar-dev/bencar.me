// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import { makePost } from '@/test/factories';
import { siteConfig } from '@/config/site';

const getAllPosts = vi.fn();
const getHeroImage = vi.fn();
vi.mock('@/lib/posts', () => ({ getAllPosts: () => getAllPosts() }));
vi.mock('@/lib/heroImages', () => ({ getHeroImage: (src?: string) => getHeroImage(src) }));

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

beforeEach(() => getHeroImage.mockReturnValue(undefined));

async function render() {
    const { default: Home } = await import('../index.astro');
    return container.renderToString(Home);
}

function makePosts(count: number) {
    return Array.from({ length: count }, (_, i) =>
        makePost({ slug: `post-${i}`, frontmatter: { title: `Title ${i}` } })
    );
}

describe('index.astro', () => {
    it('opens the four-post slider on the latest post', async () => {
        getAllPosts.mockReturnValue(makePosts(6));
        const html = await render();
        expect(html).toContain('aria-roledescription="carousel"');
        expect(html).toContain('01 / 04');
        expect(html).toMatch(/<h2[^>]*>\s*<a href="\/posts\/post-0"/);
    });

    it('lists every post in the grid, including the featured ones', async () => {
        getAllPosts.mockReturnValue(makePosts(6));
        const html = await render();
        expect(html).toContain('href="/posts/post-5"');
        expect(html.match(/<h3[^>]*>\s*Title \d/g)).toHaveLength(6);
    });

    it('counts the articles in the grid heading', async () => {
        getAllPosts.mockReturnValue(makePosts(6));
        expect(await render()).toMatch(/<span[^>]*>6<\/span>\s*Articles/);

        getAllPosts.mockReturnValue(makePosts(1));
        expect(await render()).toMatch(/<span[^>]*>1<\/span>\s*Article\s*</);
    });

    it('hands the slider optimized cover images', async () => {
        getHeroImage.mockReturnValue({
            src: '/_astro/hero.png',
            width: 1600,
            height: 900,
            format: 'png',
        });
        getAllPosts.mockReturnValue(makePosts(1));
        const html = await render();
        const slider = html.slice(html.indexOf('aria-roledescription="carousel"'));
        expect(slider).toMatch(/<img[^>]+srcset="[^"]*800w/);
    });

    it('shows an empty state when there are no posts', async () => {
        getAllPosts.mockReturnValue([]);
        const html = await render();
        expect(html).toContain('No posts yet. Stay tuned!');
        expect(html).not.toContain('aria-roledescription="carousel"');
    });

    it('uses the bare site name as the title', async () => {
        getAllPosts.mockReturnValue([]);
        const html = await render();
        expect(html).toContain(`<title>${siteConfig.name}</title>`);
    });
});
