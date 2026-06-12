import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { loadPagefind } from '@/lib/pagefind';

vi.mock('@/lib/pagefind', () => ({ loadPagefind: vi.fn() }));
const mockedLoad = vi.mocked(loadPagefind);

import Search from '../Search.vue';

type StubOpts = {
    slug?: string;
    title?: string;
    tags?: string[];
    excerpt?: string;
    sub?: Array<{
        title: string;
        url: string;
        excerpt: string;
        anchor?: { element: string; id: string };
    }>;
    url?: string;
    noMeta?: boolean;
};

function stub(opts: StubOpts & { metaUndefined?: boolean } = {}) {
    const {
        slug = 'alpha',
        title = 'Alpha',
        tags,
        excerpt = 'plain excerpt',
        sub = [],
        url,
        noMeta,
        metaUndefined,
    } = opts;
    return {
        id: slug,
        data: async () => ({
            url: url ?? `/posts/${slug}/`,
            excerpt,
            meta: metaUndefined
                ? undefined
                : noMeta
                  ? {}
                  : { slug, title, date: '2026-01-01', readingTime: '3 min read' },
            filters: tags ? { tag: tags } : {},
            sub_results: sub,
        }),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pagefindWith(results: any[]) {
    return {
        search: vi.fn(async () => ({ results })),
        preload: vi.fn(async () => {}),
        options: vi.fn(async () => {}),
    };
}

const PLACEHOLDER = 'Search for anything...';
const flushDebounce = () => new Promise((r) => setTimeout(r, 350));

beforeEach(() => {
    mockedLoad.mockReset();
    window.history.replaceState({}, '', '/search');
});

describe('Search', () => {
    it('renders the search heading and input', () => {
        mockedLoad.mockResolvedValue(pagefindWith([]));
        const { getByRole, getByPlaceholderText } = render(Search);
        expect(getByRole('heading', { name: 'Search' })).toBeInTheDocument();
        expect(getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });

    it('does not search for queries shorter than the minimum length', async () => {
        const pf = pagefindWith([]);
        mockedLoad.mockResolvedValue(pf);
        const user = userEvent.setup();
        const { getByPlaceholderText } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'a');
        await flushDebounce();
        expect(pf.search).not.toHaveBeenCalled();
    });

    it('renders results with highlighted title, heading link, tags and excerpt', async () => {
        const pf = pagefindWith([
            stub({
                slug: 'alpha',
                title: 'Alpha dev',
                tags: ['dev', 'ai'],
                excerpt: 'an <mark>alpha</mark> bit',
                sub: [
                    {
                        title: 'Alpha Heading',
                        url: '/posts/alpha/#h',
                        excerpt: '<mark>alpha</mark> in section',
                        anchor: { element: 'h2', id: 'h' },
                    },
                    // sub-result without an anchor -> heading is null (no jump link)
                    {
                        title: 'No Anchor',
                        url: '/posts/alpha/',
                        excerpt: 'plain <mark>alpha</mark> body',
                    },
                ],
            }),
        ]);
        mockedLoad.mockResolvedValue(pf);
        const user = userEvent.setup();
        const { getByPlaceholderText, container } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'alpha');

        await waitFor(() =>
            expect(container.querySelector('a[href="/posts/alpha"]')).not.toBeNull()
        );
        // summary (singular)
        expect(container.textContent).toContain('1 result for');
        // title highlight
        expect(container.querySelector('mark')?.textContent).toBe('Alpha');
        // heading sub-link + tags
        expect(container.querySelector('a[href="/posts/alpha#h"]')).not.toBeNull();
        expect(container.querySelector('a[href="/tags?tag=dev"]')).not.toBeNull();
        expect(container.querySelector('a[href="/tags?tag=ai"]')).not.toBeNull();
        // both excerpts present (one with a heading link, one without)
        expect(container.textContent).toContain('in section');
        expect(container.textContent).toContain('body');
        expect(pf.search).toHaveBeenCalledWith('alpha');
        expect(window.location.search).toBe('?q=alpha');
    });

    it('derives slug/title from the url and tolerates missing meta and tags', async () => {
        const pf = pagefindWith([stub({ metaUndefined: true, url: '/posts/fromurl/' })]);
        mockedLoad.mockResolvedValue(pf);
        const user = userEvent.setup();
        const { getByPlaceholderText, container } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'fromurl');
        await waitFor(() =>
            expect(container.querySelector('a[href="/posts/fromurl"]')).not.toBeNull()
        );
        // title falls back to slug, no tag links
        expect(container.querySelector('a[href="/posts/fromurl"]')?.textContent).toContain(
            'fromurl'
        );
        expect(container.querySelector('a[href^="/tags"]')).toBeNull();
    });

    it('shows an empty state when there are no matches', async () => {
        mockedLoad.mockResolvedValue(pagefindWith([]));
        const user = userEvent.setup();
        const { getByPlaceholderText, findByText } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'zzz');
        expect(await findByText('No results found.')).toBeInTheDocument();
    });

    it('shows an error state when Pagefind fails to load', async () => {
        mockedLoad.mockRejectedValue(new Error('boom'));
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const user = userEvent.setup();
        const { getByPlaceholderText, findByText } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'boom');
        expect(await findByText(/Search is unavailable/)).toBeInTheDocument();
    });

    it('paginates with a load-more button (plural summary)', async () => {
        const many = Array.from({ length: 12 }, (_, i) =>
            stub({ slug: `p${i + 1}`, title: `Post ${i + 1}`, tags: ['dev'] })
        );
        mockedLoad.mockResolvedValue(pagefindWith(many));
        const user = userEvent.setup();
        const { getByPlaceholderText, getByRole, queryByRole, container } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'post');

        await waitFor(() => expect(container.querySelector('a[href="/posts/p1"]')).not.toBeNull());
        expect(container.textContent).toContain('12 results for');
        // first page only -> 10 results, p11 not yet rendered
        expect(container.querySelector('a[href="/posts/p11"]')).toBeNull();

        await user.click(getByRole('button', { name: /load more/i }));

        await waitFor(() => expect(container.querySelector('a[href="/posts/p12"]')).not.toBeNull());
        expect(queryByRole('button', { name: /load more/i })).toBeNull();
    });

    it('recovers when loading more results fails', async () => {
        const ok = Array.from({ length: 10 }, (_, i) =>
            stub({ slug: `p${i + 1}`, title: `Post ${i + 1}`, tags: ['dev'] })
        );
        const bad = {
            id: 'p11',
            data: async () => {
                throw new Error('nope');
            },
        };
        mockedLoad.mockResolvedValue(pagefindWith([...ok, bad]));
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const user = userEvent.setup();
        const { getByPlaceholderText, getByRole, container } = render(Search);
        await user.type(getByPlaceholderText(PLACEHOLDER), 'post');
        await waitFor(() => expect(container.querySelector('a[href="/posts/p1"]')).not.toBeNull());

        await user.click(getByRole('button', { name: /load more/i }));
        // The failed batch is caught: status returns to ready, first page intact.
        await waitFor(() =>
            expect(console.error).toHaveBeenCalledWith('load more failed', expect.anything())
        );
        expect(container.querySelector('a[href="/posts/p1"]')).not.toBeNull();
        expect(container.querySelector('a[href="/posts/p11"]')).toBeNull();
    });

    it('clears the query and results when the clear button is pressed', async () => {
        mockedLoad.mockResolvedValue(pagefindWith([stub({ slug: 'a', title: 'A Post' })]));
        const user = userEvent.setup();
        const { getByPlaceholderText, getByRole, container } = render(Search);
        const input = getByPlaceholderText(PLACEHOLDER) as HTMLInputElement;
        await user.type(input, 'apost');
        await waitFor(() => expect(container.querySelector('a[href="/posts/a"]')).not.toBeNull());

        await user.click(getByRole('button', { name: /clear search/i }));
        expect(input.value).toBe('');
        expect(container.querySelector('a[href="/posts/a"]')).toBeNull();
    });

    it('reads the initial query from the ?q= URL param on mount', async () => {
        window.history.replaceState({}, '', '/search?q=hello');
        const pf = pagefindWith([stub({ slug: 'h', title: 'Hello World' })]);
        mockedLoad.mockResolvedValue(pf);
        const { getByPlaceholderText, container } = render(Search);
        const input = getByPlaceholderText(PLACEHOLDER) as HTMLInputElement;
        await waitFor(() => expect(input.value).toBe('hello'));
        await waitFor(() => expect(container.querySelector('a[href="/posts/h"]')).not.toBeNull());
        expect(pf.search).toHaveBeenCalledWith('hello');
    });
});
