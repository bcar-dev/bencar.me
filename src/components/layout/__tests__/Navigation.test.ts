import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import Navigation from '../Navigation.vue';
import { siteConfig } from '@/config/site';

describe('Navigation', () => {
    it('renders the nav links from siteConfig plus search', () => {
        const { getByRole } = render(Navigation, { props: { currentPath: '/' } });
        for (const item of siteConfig.nav) {
            expect(getByRole('link', { name: item.title })).toBeInTheDocument();
        }
        expect(getByRole('link', { name: /search/i })).toBeInTheDocument();
    });

    it('underlines the active link', () => {
        const { getByRole } = render(Navigation, { props: { currentPath: '/posts' } });
        const postsLink = getByRole('link', { name: 'Posts' });
        expect(postsLink.className).toContain('underline');
    });

    it('treats nested routes as active for their section', () => {
        const { getByRole } = render(Navigation, {
            props: { currentPath: '/posts/some-slug' },
        });
        expect(getByRole('link', { name: 'Posts' }).className).toContain('underline');
    });

    it('toggles the mobile menu open and closed', async () => {
        const user = userEvent.setup();
        const { getByRole, container } = render(Navigation, { props: { currentPath: '/' } });
        const list = container.querySelector('ul')!;

        expect(list.className).toContain('hidden');
        await user.click(getByRole('button', { name: /toggle menu/i }));
        expect(list.className).toContain('flex');
        expect(list.className).not.toContain('hidden');
    });
});
