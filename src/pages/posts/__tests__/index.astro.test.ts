// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import { makePost, makeYearGroup } from '@/test/factories';
import { siteConfig } from '@/config/site';

const getPostsGroupedByDate = vi.fn();
const getHeroImage = vi.fn();
vi.mock('@/lib/posts', () => ({ getPostsGroupedByDate: () => getPostsGroupedByDate() }));
vi.mock('@/lib/heroImages', () => ({ getHeroImage: (src?: string) => getHeroImage(src) }));

const heroMetadata = { src: '/_astro/hero.png', width: 1200, height: 800, format: 'png' };

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

async function render() {
    const { default: PostsIndex } = await import('../index.astro');
    return container.renderToString(PostsIndex);
}

describe('posts/index.astro', () => {
    it('titles the page All Posts', async () => {
        getPostsGroupedByDate.mockReturnValue([]);
        getHeroImage.mockReturnValue(undefined);
        const html = await render();
        expect(html).toContain(`<title>All Posts | ${siteConfig.name}</title>`);
    });

    it('shows an empty state when there are no posts', async () => {
        getPostsGroupedByDate.mockReturnValue([]);
        getHeroImage.mockReturnValue(undefined);
        const html = await render();
        expect(html).toContain('No posts yet. Stay tuned!');
    });

    it('groups posts under their year and month', async () => {
        getPostsGroupedByDate.mockReturnValue([
            makeYearGroup(2026, 'January', [
                makePost({ slug: 'alpha' }),
                makePost({ slug: 'beta' }),
            ]),
            makeYearGroup(2025, 'December', [makePost({ slug: 'gamma' })], 12),
        ]);
        getHeroImage.mockReturnValue(undefined);
        const html = await render();
        expect(html).toContain('2026');
        expect(html).toContain('January');
        expect(html).toContain('2025');
        expect(html).toContain('December');
        expect(html).toContain('href="/posts/alpha"');
        expect(html).toContain('href="/posts/gamma"');
    });

    it('omits the hero thumbnail for a post without one', async () => {
        getPostsGroupedByDate.mockReturnValue([
            makeYearGroup(2026, 'January', [makePost({ slug: 'no-hero' })]),
        ]);
        getHeroImage.mockReturnValue(undefined);
        const html = await render();
        expect(html).toContain('href="/posts/no-hero"');
        // The header avatar is also an <img>, so key off the hero wrapper instead.
        expect(html).not.toContain('hidden sm:block shrink-0');
    });

    it('renders the hero thumbnail with its alt text', async () => {
        getPostsGroupedByDate.mockReturnValue([
            makeYearGroup(2026, 'January', [
                makePost({
                    slug: 'with-hero',
                    frontmatter: { heroImage: '/assets/img/hero.png', heroImageAlt: 'A hero' },
                }),
            ]),
        ]);
        getHeroImage.mockReturnValue(heroMetadata);
        const html = await render();
        expect(html).toContain('hidden sm:block shrink-0');
        expect(html).toContain('alt="A hero"');
    });

    it('falls back to the post title as hero alt text', async () => {
        getPostsGroupedByDate.mockReturnValue([
            makeYearGroup(2026, 'January', [
                makePost({
                    slug: 'no-alt',
                    frontmatter: { title: 'Untitled Hero', heroImage: '/assets/img/hero.png' },
                }),
            ]),
        ]);
        getHeroImage.mockReturnValue(heroMetadata);
        const html = await render();
        expect(html).toContain('alt="Untitled Hero"');
    });
});
