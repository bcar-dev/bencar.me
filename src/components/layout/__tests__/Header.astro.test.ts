// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/vue/container-renderer';
import Header from '../Header.astro';
import { siteConfig } from '@/config/site';

let container: AstroContainer;
beforeAll(async () => {
    // Header mounts the Navigation Vue island, so the Vue renderer is needed.
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
});

describe('Header.astro', () => {
    it('renders the site name and avatar', async () => {
        const html = await container.renderToString(Header, {
            partial: false,
            routeType: 'page',
        });
        expect(html).toContain(siteConfig.name);
        // optimized avatar image with the author name as alt text
        expect(html).toContain(`alt="${siteConfig.author.name}"`);
        expect(html).toContain('<img');
    });

    it('renders the author bio', async () => {
        const html = await container.renderToString(Header);
        // bio contains a newline; check the first line is present
        expect(html).toContain('Backend, data and AI.');
    });

    it('server-renders the navigation island with its links', async () => {
        const html = await container.renderToString(Header);
        for (const item of siteConfig.nav) {
            expect(html).toContain(`href="${item.href}"`);
        }
    });
});
