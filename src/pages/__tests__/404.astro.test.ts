// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import NotFound from '../404.astro';

let container: AstroContainer;
beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('404.astro', () => {
    it('renders the not-found copy and a link home', async () => {
        const html = await container.renderToString(NotFound);
        expect(html).toContain('404');
        expect(html).toContain("This page doesn't exist.");
        expect(html).toContain('href="/"');
    });
});
