import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import TableOfContents from '../TableOfContents.vue';

const headings = [
    { text: 'First', slug: 'first', level: 2 },
    { text: 'Sub', slug: 'sub', level: 3 },
    { text: 'Second', slug: 'second', level: 2 },
];

afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

describe('TableOfContents', () => {
    it('renders nothing when there are no headings', () => {
        const { container } = render(TableOfContents, { props: { headings: [] } });
        expect(container.querySelector('aside')).toBeNull();
    });

    it('numbers h2 entries and leaves h3 entries unnumbered', () => {
        const { getByRole } = render(TableOfContents, { props: { headings } });
        expect(getByRole('link', { name: /1\.\s*First/ })).toBeInTheDocument();
        expect(getByRole('link', { name: /2\.\s*Second/ })).toBeInTheDocument();
        expect(getByRole('link', { name: 'Sub' })).toBeInTheDocument();
    });

    it('smooth-scrolls to the target heading and updates the hash', async () => {
        const target = document.createElement('div');
        target.id = 'first';
        const scrollIntoView = vi.fn();
        target.scrollIntoView = scrollIntoView;
        document.body.appendChild(target);
        const pushState = vi.spyOn(window.history, 'pushState');

        const user = userEvent.setup();
        const { getByRole } = render(TableOfContents, { props: { headings } });
        await user.click(getByRole('link', { name: /1\.\s*First/ }));

        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        expect(pushState).toHaveBeenCalledWith(null, '', '#first');
    });

    it('falls back to setting the location hash when the target is missing', async () => {
        // No element with id "first" exists in the DOM.
        const user = userEvent.setup();
        const { getByRole } = render(TableOfContents, { props: { headings } });
        await user.click(getByRole('link', { name: /1\.\s*First/ }));
        expect(window.location.hash).toBe('#first');
    });
});
