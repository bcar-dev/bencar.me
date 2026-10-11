// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import BaseLayout from '../BaseLayout.astro';
import { siteConfig } from '@/config/site';

let container: AstroContainer;
beforeAll(async () => {
    // Header/Footer render Icon, which is a Vue (unplugin-icons) glyph.
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('BaseLayout.astro', () => {
    it('suffixes the page title with the site name', async () => {
        const html = await container.renderToString(BaseLayout, { props: { title: 'About' } });
        expect(html).toContain(`<title>About | ${siteConfig.name}</title>`);
    });

    it('uses the bare site name as the title when no title is given', async () => {
        const html = await container.renderToString(BaseLayout);
        expect(html).toContain(`<title>${siteConfig.name}</title>`);
    });

    it('falls back to the site description and a website og:type', async () => {
        const html = await container.renderToString(BaseLayout);
        expect(html).toContain(`content="${siteConfig.description}"`);
        expect(html).toContain('property="og:type" content="website"');
    });

    it('honours an explicit description and og:type', async () => {
        const html = await container.renderToString(BaseLayout, {
            props: { description: 'A single post', ogType: 'article' },
        });
        expect(html).toContain('content="A single post"');
        expect(html).toContain('property="og:type" content="article"');
    });

    it('omits the image meta tags when no image is given', async () => {
        const html = await container.renderToString(BaseLayout);
        expect(html).not.toContain('og:image');
        expect(html).not.toContain('twitter:image');
    });

    it('resolves a relative image against the site url for og and twitter', async () => {
        const html = await container.renderToString(BaseLayout, {
            props: { image: '/_astro/hero.webp' },
        });
        const absolute = `${siteConfig.url}/_astro/hero.webp`;
        expect(html).toContain(`property="og:image" content="${absolute}"`);
        expect(html).toContain(`name="twitter:image" content="${absolute}"`);
    });

    it('builds a canonical url from the request path', async () => {
        const html = await container.renderToString(BaseLayout, {
            request: new Request('https://example.com/posts/hello'),
        });
        expect(html).toContain(`rel="canonical" href="${siteConfig.url}/posts/hello"`);
    });

    it('renders slotted page content between the header and footer', async () => {
        const html = await container.renderToString(BaseLayout, {
            slots: { default: '<p>page body</p>' },
        });
        expect(html).toContain('<p>page body</p>');
        expect(html).toContain(siteConfig.author.name);
    });

    it('inlines the no-flash theme script so it runs before paint', async () => {
        const html = await container.renderToString(BaseLayout);
        expect(html).toContain("localStorage.getItem('theme')");
        expect(html).toContain('astro:after-swap');
    });
});
