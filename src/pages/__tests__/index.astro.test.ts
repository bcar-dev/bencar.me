// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import { makePost } from '@/test/factories';
import { siteConfig } from '@/config/site';

const getAllPosts = vi.fn();
vi.mock('@/lib/posts', () => ({ getAllPosts: () => getAllPosts() }));

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

async function render() {
    const { default: Home } = await import('../index.astro');
    return container.renderToString(Home);
}

describe('index.astro', () => {
    it('lists the recent posts with links to each one', async () => {
        getAllPosts.mockReturnValue([makePost({ slug: 'first' }), makePost({ slug: 'second' })]);
        const html = await render();
        expect(html).toContain('Recent Posts');
        expect(html).toContain('href="/posts/first"');
        expect(html).toContain('href="/posts/second"');
    });

    it('shows the all-posts link when there is at least one post', async () => {
        getAllPosts.mockReturnValue([makePost({ slug: 'only' })]);
        const html = await render();
        expect(html).toContain('href="/posts"');
        expect(html).toContain('All Posts');
    });

    it('shows an empty state and hides the all-posts link when there are no posts', async () => {
        getAllPosts.mockReturnValue([]);
        const html = await render();
        expect(html).toContain('No posts yet. Stay tuned!');
        expect(html).not.toContain('href="/posts/"');
        expect(html).not.toContain('All Posts');
    });

    it('caps the list at the configured recent-post count', async () => {
        const count = siteConfig.pagination.recentPostsCount;
        getAllPosts.mockReturnValue(
            Array.from({ length: count + 3 }, (_, i) => makePost({ slug: `post-${i}` }))
        );
        const html = await render();
        expect(html).toContain(`href="/posts/post-${count - 1}"`);
        expect(html).not.toContain(`href="/posts/post-${count}"`);
    });

    it('uses the bare site name as the title', async () => {
        getAllPosts.mockReturnValue([]);
        const html = await render();
        expect(html).toContain(`<title>${siteConfig.name}</title>`);
    });
});
