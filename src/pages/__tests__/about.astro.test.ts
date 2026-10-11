// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import About from '../about.astro';
import { siteConfig } from '@/config/site';

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('about.astro', () => {
    it('renders the heading and the author pseudonym', async () => {
        const html = await container.renderToString(About);
        expect(html).toContain('About Me');
        expect(html).toContain(siteConfig.author.pseudonym);
    });

    it('titles the page About and uses the site description', async () => {
        const html = await container.renderToString(About);
        expect(html).toContain(`<title>About | ${siteConfig.name}</title>`);
        expect(html).toContain(`content="${siteConfig.description}"`);
    });
});
