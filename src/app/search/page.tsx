'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiX } from 'react-icons/fi';
import type { SearchResult } from '@/types';
import Tag from '@/components/ui/Tag';
import PostTitle from '@/components/ui/PostTitle';
import PostMeta from '@/components/ui/PostMeta';
import { useDebounce } from '@/hooks/useDebounce';
import { escapeRegex } from '@/lib/utils';

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE = 10;

interface PagefindAnchor {
    element: string;
    id: string;
    text?: string;
    location?: number;
}

interface PagefindSubResult {
    title: string;
    url: string;
    excerpt: string;
    anchor?: PagefindAnchor;
}

interface PagefindData {
    url: string;
    excerpt: string;
    meta: Record<string, string | undefined>;
    filters: Record<string, string[] | undefined>;
    sub_results: PagefindSubResult[];
}

interface PagefindResultStub {
    id: string;
    data: () => Promise<PagefindData>;
}

interface PagefindApi {
    search: (q: string) => Promise<{ results: PagefindResultStub[] }>;
    preload?: (term: string, options?: Record<string, unknown>) => Promise<void>;
    options?: (opts: Record<string, unknown>) => Promise<void>;
}

let pagefindPromise: Promise<PagefindApi> | null = null;

function loadPagefind(): Promise<PagefindApi> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('pagefind is browser only'));
    }
    if (!pagefindPromise) {
        // The URL must be opaque to the bundler so it resolves at runtime from /public.
        const url = '/pagefind/pagefind.js';
        pagefindPromise = import(
            /* webpackIgnore: true */ /* turbopackIgnore: true */ /* @vite-ignore */ url
        ).then(async (mod: PagefindApi) => {
            await mod.options?.({ excerptLength: 30 });
            return mod;
        });
    }
    return pagefindPromise;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
    if (!query || query.length < MIN_QUERY_LENGTH) return <>{text}</>;
    const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
            )}
        </>
    );
}

function adaptResult(data: PagefindData): SearchResult {
    const meta = data.meta ?? {};
    const tags = data.filters?.tag ?? [];
    const slug = meta.slug ?? data.url.split('/').filter(Boolean).pop() ?? '';

    const matches = data.sub_results.map((sub) => ({
        heading: sub.anchor
            ? { text: sub.title, slug: sub.anchor.id }
            : null,
        snippets: [sub.excerpt],
    }));

    return {
        slug,
        title: meta.title ?? slug,
        date: meta.date ?? '',
        readingTime: meta.readingTime ?? '',
        tags,
        matches,
    };
}

type SearchStatus = 'idle' | 'loading' | 'loadingMore' | 'ready' | 'error';

interface SearchState {
    status: SearchStatus;
    results: SearchResult[];
    count: number;
    /** Remaining stubs we haven't materialised yet. */
    pending: PagefindResultStub[];
}

const INITIAL_STATE: SearchState = {
    status: 'idle',
    results: [],
    count: 0,
    pending: [],
};

async function materializeBatch(stubs: PagefindResultStub[]): Promise<SearchResult[]> {
    const datas = await Promise.all(stubs.map((s) => s.data()));
    return datas.map(adaptResult);
}

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
    const debouncedQuery = useDebounce(query, 300);
    const [state, setState] = useState<SearchState>(INITIAL_STATE);
    const requestIdRef = useRef(0);

    const runSearch = useCallback(async (q: string) => {
        const requestId = ++requestIdRef.current;
        if (q.length < MIN_QUERY_LENGTH) {
            setState(INITIAL_STATE);
            return;
        }

        setState({ status: 'loading', results: [], count: 0, pending: [] });

        try {
            const pagefind = await loadPagefind();
            const { results } = await pagefind.search(q);
            if (requestId !== requestIdRef.current) return;

            const initial = results.slice(0, PAGE_SIZE);
            const pending = results.slice(PAGE_SIZE);
            const materialised = await materializeBatch(initial);
            if (requestId !== requestIdRef.current) return;

            setState({
                status: 'ready',
                results: materialised,
                count: results.length,
                pending,
            });
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.error('search failed', err);
            setState({ status: 'error', results: [], count: 0, pending: [] });
        }
    }, []);

    // Warm Pagefind (dynamic import + WASM + meta fetch) as soon as the page mounts,
    // so the first search after typing isn't paying that cost.
    useEffect(() => {
        loadPagefind().catch((err) => console.warn('pagefind warm failed', err));
    }, []);

    // Pre-fetch the index chunks needed for the current query while the user is still typing,
    // so the actual search after the debounce is near-instant.
    useEffect(() => {
        if (query.length < MIN_QUERY_LENGTH) return;
        loadPagefind()
            .then((pf) => pf.preload?.(query))
            .catch(() => {});
    }, [query]);

    useEffect(() => {
        runSearch(debouncedQuery);
    }, [debouncedQuery, runSearch]);

    useEffect(() => {
        const target =
            debouncedQuery.length >= MIN_QUERY_LENGTH
                ? `/search?q=${encodeURIComponent(debouncedQuery)}`
                : '/search';
        router.replace(target, { scroll: false });
    }, [debouncedQuery, router]);

    const handleLoadMore = async () => {
        if (state.pending.length === 0 || state.status === 'loadingMore') return;
        const requestId = ++requestIdRef.current;
        const nextStubs = state.pending.slice(0, PAGE_SIZE);
        const rest = state.pending.slice(PAGE_SIZE);

        setState((prev) => ({ ...prev, status: 'loadingMore' }));
        try {
            const more = await materializeBatch(nextStubs);
            if (requestId !== requestIdRef.current) return;
            setState((prev) => ({
                status: 'ready',
                results: [...prev.results, ...more],
                count: prev.count,
                pending: rest,
            }));
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.error('load more failed', err);
            setState((prev) => ({ ...prev, status: 'ready' }));
        }
    };

    const handleClear = () => {
        setQuery('');
        setState(INITIAL_STATE);
    };

    const isLoading = state.status === 'loading';
    const isLoadingMore = state.status === 'loadingMore';
    const showResults = state.status === 'ready' || state.status === 'loadingMore';
    const showEmpty =
        state.status === 'ready' &&
        state.results.length === 0 &&
        debouncedQuery.length >= MIN_QUERY_LENGTH;

    return (
        <div className="py-8 w-full">
            <h1 className="my-8 text-3xl font-bold tracking-wider sm:text-4xl">Search</h1>
            <p className="mb-6 italic text-foreground/80">Search any article ...</p>

            <div className="relative w-full mb-8">
                <label className="sr-only" htmlFor="search-input">
                    Search input
                </label>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/60">
                    <FiSearch size={20} />
                </span>
                <input
                    id="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="block w-full rounded-md border border-border bg-background py-3 pl-10 pr-10 outline-hidden focus:border-accent focus:ring-1 focus:ring-accent"
                    placeholder="Search for anything..."
                    type="text"
                    autoComplete="off"
                    autoFocus
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground transition-colors"
                        aria-label="Clear search"
                    >
                        <FiX size={20} />
                    </button>
                )}
            </div>

            {showResults && (
                <div className="mb-6 pb-4 border-b border-border text-sm text-foreground/75">
                    {state.count} {state.count === 1 ? 'result' : 'results'} for{' '}
                    <span className="font-semibold text-foreground">{debouncedQuery}</span>
                </div>
            )}

            {isLoading && <div className="text-sm italic text-foreground/60">Searching...</div>}

            {showEmpty && <p className="text-foreground/75 italic">No results found.</p>}

            {state.status === 'error' && (
                <p className="text-foreground/75 italic">
                    Search is unavailable. Try again in a moment.
                </p>
            )}

            {showResults && state.results.length > 0 && (
                <ul className="space-y-6">
                    {state.results.map((result) => (
                        <li
                            key={result.slug}
                            className="group pb-6 border-b border-border/50 last:border-b-0"
                        >
                            <PostTitle href={`/posts/${result.slug}`}>
                                <HighlightMatch text={result.title} query={debouncedQuery} />
                            </PostTitle>
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-2 items-center text-sm text-foreground/75 opacity-80">
                                <PostMeta
                                    pubDatetime={result.date}
                                    readingTime={result.readingTime}
                                    className="mr-1"
                                />
                                {result.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {result.tags.map((tag) => (
                                            <Tag key={tag} tag={tag} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 space-y-4">
                                {result.matches.map((match, i) => (
                                    <div key={i} className="space-y-2">
                                        {match.heading && (
                                            <Link
                                                href={`/posts/${result.slug}#${match.heading.slug}`}
                                                className="inline-flex items-center gap-2 text-sm text-accent hover:underline decoration-dashed underline-offset-4 mb-1"
                                            >
                                                <span className="text-foreground/40">↪</span>
                                                <span>
                                                    <HighlightMatch
                                                        text={match.heading.text}
                                                        query={debouncedQuery}
                                                    />
                                                </span>
                                            </Link>
                                        )}
                                        {match.snippets.map((snippet, j) => (
                                            <p
                                                key={j}
                                                className="text-foreground/80 leading-relaxed text-sm [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-700/60 [&_mark]:px-0.5 [&_mark]:rounded-sm"
                                                dangerouslySetInnerHTML={{ __html: snippet }}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {showResults && state.pending.length > 0 && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="px-6 py-2 rounded-md border border-border bg-background hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {isLoadingMore ? 'Loading...' : 'Load more results'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Search() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-3xl px-4 py-8">
                    <h1 className="my-8 text-3xl font-bold tracking-wider sm:text-4xl">Search</h1>
                    <p className="mb-6 italic text-foreground/80">Loading...</p>
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
