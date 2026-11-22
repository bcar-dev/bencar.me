// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import { makePost } from '@/test/factories';
import StubContent from '@/test/fixtures/StubContent.astro';
import { siteConfig } from '@/config/site';

const getCollection = vi.fn();
const getPostWithNeighbors = vi.fn();
const getHeroImage = vi.fn();

vi.mock('astro:content', () => ({
    getCollection: (name: string, filter?: (e: unknown) => boolean) => getCollection(name, filter),
    render: async () => ({ Content: StubContent }),
}));
vi.mock('@/lib/posts', () => ({
    getPostWithNeighbors: (slug: string) => getPostWithNeighbors(slug),
}));
vi.mock('@/lib/heroImages', () => ({ getHeroImage: (src?: string) => getHeroImage(src) }));

const heroMetadata = { src: '/_astro/hero.png', width: 1200, height: 800, format: 'png' };

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

async function load() {
    return import('../[slug].astro');
}

async function render(entry: { id: string }) {
    const { default: PostPage } = await load();
    return container.renderToString(PostPage, { props: { entry } });
}

describe('posts/[slug].astro getStaticPaths', () => {
    it('maps each non-draft entry to a slug param and props', async () => {
        getCollection.mockResolvedValue([{ id: 'hello-world' }, { id: 'nested/second-post' }]);
        const { getStaticPaths } = await load();
        const paths = await getStaticPaths();
        expect(paths).toEqual([
            { params: { slug: 'hello-world' }, props: { entry: { id: 'hello-world' } } },
            { params: { slug: 'second-post' }, props: { entry: { id: 'nested/second-post' } } },
        ]);
    });

    it('filters drafts out of the collection', async () => {
        getCollection.mockResolvedValue([]);
        const { getStaticPaths } = await load();
        await getStaticPaths();
        const [, filter] = getCollection.mock.calls.at(-1)!;
        expect(filter({ data: { draft: true } })).toBe(false);
        expect(filter({ data: { draft: false } })).toBe(true);
    });
});

describe('posts/[slug].astro', () => {
    it('renders the post title, meta and body', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({ slug: 'hello', frontmatter: { title: 'Hello World' } }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'hello' });
        expect(html).toContain('Hello World');
        expect(html).toContain('stubbed post body');
        expect(html).toContain('1 min read');
    });

    it('titles the page with the post title and marks it as an article', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({ slug: 'hello', frontmatter: { title: 'Hello World' } }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'hello' });
        expect(html).toContain(`<title>Hello World | ${siteConfig.name}</title>`);
        expect(html).toContain('property="og:type" content="article"');
    });

    it('renders tags when the post has them', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({ slug: 'tagged', frontmatter: { tags: ['dev', 'astro'] } }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'tagged' });
        expect(html).toContain('href="/tags?tag=dev"');
        expect(html).toContain('href="/tags?tag=astro"');
    });

    it('links to the previous and next posts', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({ slug: 'middle' }),
            prev: makePost({ slug: 'older', frontmatter: { title: 'Older Post' } }),
            next: makePost({ slug: 'newer', frontmatter: { title: 'Newer Post' } }),
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'middle' });
        expect(html).toContain('href="/posts/older#top"');
        expect(html).toContain('href="/posts/newer#top"');
    });

    it('builds the table of contents from the post headings', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({
                slug: 'with-toc',
                headings: [
                    { text: 'First Section', slug: 'first-section', index: 0, level: 2 },
                    { text: 'A Detail', slug: 'a-detail', index: 1, level: 3 },
                ],
            }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'with-toc' });
        expect(html).toContain('First Section');
        expect(html).toContain('#first-section');
        expect(html).toContain('A Detail');
        expect(html).toContain('#a-detail');
    });

    it('shows the contents in a side rail beside the article, not inside its text', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({
                slug: 'with-toc',
                headings: [{ text: 'First Section', slug: 'first-section', index: 0, level: 2 }],
            }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'with-toc' });
        const rail = html.slice(html.indexOf('<aside'), html.indexOf('</aside>'));
        expect(rail).toContain('aria-label="Table of contents"');
        expect(rail).toContain('href="#first-section"');
        const body = html.slice(html.indexOf('markdown-content'));
        expect(body).not.toContain('aria-label="Table of contents"');
    });

    it('keeps the cover image off the article page', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({
                slug: 'with-hero',
                frontmatter: { heroImage: '/assets/img/hero.png', heroImageAlt: 'A hero' },
            }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(heroMetadata);
        const html = await render({ id: 'with-hero' });
        expect(html).not.toContain('alt="A hero"');
        expect(html).not.toMatch(/<img[^>]+hero\.png/);
    });

    it('still uses the cover image as the social share image', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({
                slug: 'with-hero',
                frontmatter: { heroImage: '/assets/img/hero.png' },
            }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(heroMetadata);
        const html = await render({ id: 'with-hero' });
        expect(html).toContain(`property="og:image" content="${siteConfig.url}/_astro/hero.png"`);
    });

    it('emits JSON-LD with the post headline and escapes angle brackets', async () => {
        getPostWithNeighbors.mockReturnValue({
            post: makePost({
                slug: 'json-ld',
                frontmatter: { title: 'Tricky </script> Title' },
            }),
            prev: null,
            next: null,
        });
        getHeroImage.mockReturnValue(undefined);
        const html = await render({ id: 'json-ld' });
        const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
        expect(jsonLd).toBeDefined();
        // The `<` is escaped so a title containing `</script>` cannot close the tag early.
        expect(jsonLd).not.toContain('</script>');
        expect(jsonLd).toContain('\\u003c/script>');
        expect(JSON.parse(jsonLd!.replace(/\\u003c/g, '<'))).toMatchObject({
            '@type': 'BlogPosting',
            headline: 'Tricky </script> Title',
            author: { name: siteConfig.author.name },
        });
    });
});

describe('posts/[slug].astro missing post', () => {
    it('rewrites to the 404 page when the slug has no matching post', async () => {
        const { default: NotFound } = await import('../../404.astro');
        container.insertPageRoute('/404', NotFound);
        getPostWithNeighbors.mockReturnValue({ post: undefined, prev: null, next: null });
        getHeroImage.mockReturnValue(undefined);
        const { default: PostPage } = await load();
        const response = await container.renderToResponse(PostPage, {
            props: { entry: { id: 'ghost' } },
        });
        const html = await response.text();
        expect(html).toContain("This page doesn't exist.");
    });
});
