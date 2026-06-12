// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SocialLink from '../SocialLink.astro';

let container: AstroContainer;
beforeAll(async () => {
    container = await AstroContainer.create();
});

describe('SocialLink.astro', () => {
    it('renders an external link opening in a new tab with rel safety', async () => {
        const html = await container.renderToString(SocialLink, {
            props: { href: 'https://github.com/bcar-dev', 'aria-label': 'GitHub' },
            slots: { default: 'icon' },
        });
        expect(html).toContain('href="https://github.com/bcar-dev"');
        expect(html).toContain('target="_blank"');
        expect(html).toContain('rel="noopener noreferrer"');
        expect(html).toContain('aria-label="GitHub"');
    });
});
