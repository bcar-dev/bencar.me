import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import TableOfContents from '../TableOfContents.vue';

const headings = [
    { text: 'First', slug: 'first', level: 2 },
    { text: 'Sub', slug: 'sub', level: 3 },
    { text: 'Second', slug: 'second', level: 2 },
];

/** Distance from the viewport top to each rendered heading, mutated to simulate scrolling. */
const headingTops: Record<string, number> = {};

function renderHeadingsInPage(tops: Record<string, number>) {
    Object.assign(headingTops, tops);
    for (const slug of Object.keys(tops)) {
        const heading = document.createElement('h2');
        heading.id = slug;
        heading.getBoundingClientRect = () => ({ top: headingTops[slug] }) as DOMRect;
        document.body.appendChild(heading);
    }
}

function setPageScroll({ scrollY, scrollHeight }: { scrollY: number; scrollHeight: number }) {
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: scrollHeight,
        configurable: true,
    });
}

async function scrollTo(scrollY: number, tops: Record<string, number>) {
    Object.assign(headingTops, tops);
    setPageScroll({ scrollY, scrollHeight: 5000 });
    window.dispatchEvent(new Event('scroll'));
    await nextTick();
}

beforeEach(() => {
    // Run animation frames synchronously so scroll updates land immediately.
    Object.defineProperty(window, 'requestAnimationFrame', {
        value: (cb: FrameRequestCallback) => {
            cb(0);
            return 0;
        },
        configurable: true,
    });
    Object.defineProperty(window, 'cancelAnimationFrame', { value: vi.fn(), configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    setPageScroll({ scrollY: 0, scrollHeight: 5000 });
});

afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

describe('TableOfContents', () => {
    it('renders nothing when there are no headings', () => {
        const { queryByRole } = render(TableOfContents, { props: { headings: [] } });
        expect(queryByRole('navigation')).toBeNull();
    });

    it('links each entry to its heading', () => {
        const { getByRole } = render(TableOfContents, { props: { headings } });
        expect(getByRole('link', { name: 'First' })).toHaveAttribute('href', '#first');
        expect(getByRole('link', { name: 'Sub' })).toHaveAttribute('href', '#sub');
        expect(getByRole('link', { name: 'Second' })).toHaveAttribute('href', '#second');
    });

    it('marks the first entry as current before the reader reaches any heading', async () => {
        renderHeadingsInPage({ first: 600, sub: 1200, second: 1800 });
        const { getByRole } = render(TableOfContents, { props: { headings } });
        await nextTick();
        expect(getByRole('link', { name: 'First' })).toHaveAttribute('aria-current', 'location');
        expect(getByRole('link', { name: 'Second' })).not.toHaveAttribute('aria-current');
    });

    it('moves the current marker to the section being read as the page scrolls', async () => {
        renderHeadingsInPage({ first: 600, sub: 1200, second: 1800 });
        const { getByRole } = render(TableOfContents, { props: { headings } });

        await scrollTo(1500, { first: -900, sub: -300, second: 300 });

        expect(getByRole('link', { name: 'Sub' })).toHaveAttribute('aria-current', 'location');
        expect(getByRole('link', { name: 'First' })).not.toHaveAttribute('aria-current');
    });

    it('marks the last entry as current once the page is scrolled to the end', async () => {
        renderHeadingsInPage({ first: 600, sub: 1200, second: 1800 });
        const { getByRole } = render(TableOfContents, { props: { headings } });

        // scrollY + innerHeight reaches scrollHeight, but "Second" is still mid-viewport.
        await scrollTo(4000, { first: -3400, sub: -2800, second: 400 });

        expect(getByRole('link', { name: 'Second' })).toHaveAttribute('aria-current', 'location');
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
        await user.click(getByRole('link', { name: 'First' }));

        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        expect(pushState).toHaveBeenCalledWith(null, '', '#first');
    });

    it('falls back to setting the location hash when the target is missing', async () => {
        // No element with id "first" exists in the DOM.
        const user = userEvent.setup();
        const { getByRole } = render(TableOfContents, { props: { headings } });
        await user.click(getByRole('link', { name: 'First' }));
        expect(window.location.hash).toBe('#first');
    });
});
