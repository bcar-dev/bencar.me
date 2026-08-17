// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import Footer from '../Footer.astro';
import { siteConfig } from '@/config/site';

let container: AstroContainer;
beforeAll(async () => {
    // Footer uses the Icon component, which renders a Vue (unplugin-icons) glyph.
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('Footer.astro', () => {
    it('renders the current year and author name', async () => {
        const html = await container.renderToString(Footer);
        expect(html).toContain(String(new Date().getFullYear()));
        expect(html).toContain(siteConfig.author.name);
    });

    it('links to tags and the social profiles', async () => {
        const html = await container.renderToString(Footer);
        expect(html).toContain('href="/tags"');
        expect(html).toContain(siteConfig.links.github);
        expect(html).toContain(siteConfig.links.linkedin);
    });
});
