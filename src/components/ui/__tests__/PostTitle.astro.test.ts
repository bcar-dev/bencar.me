// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostTitle from '../PostTitle.astro';

let container: AstroContainer;
beforeAll(async () => {
    container = await AstroContainer.create();
});

describe('PostTitle.astro', () => {
    it('renders a link to the given href with the slotted title', async () => {
        const html = await container.renderToString(PostTitle, {
            props: { href: '/posts/hello-world' },
            slots: { default: 'Hello World' },
        });
        expect(html).toContain('href="/posts/hello-world"');
        expect(html).toContain('Hello World');
    });

    it('merges custom classes', async () => {
        const html = await container.renderToString(PostTitle, {
            props: { href: '/posts/x', class: 'custom-class' },
            slots: { default: 'X' },
        });
        expect(html).toContain('custom-class');
    });
});
