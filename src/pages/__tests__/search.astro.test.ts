// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import Search from '../search.astro';
import { siteConfig } from '@/config/site';

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('search.astro', () => {
    it('titles the page Search', async () => {
        const html = await container.renderToString(Search);
        expect(html).toContain(`<title>Search | ${siteConfig.name}</title>`);
    });

    it('renders the loading fallback for the client-only island', async () => {
        const html = await container.renderToString(Search);
        expect(html).toContain('Loading...');
    });
});
