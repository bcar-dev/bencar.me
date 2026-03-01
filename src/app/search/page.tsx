'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiX } from 'react-icons/fi';
import type { SearchResult } from '@/types';
import Tag from '@/components/ui/Tag';
import PostTitle from '@/components/ui/PostTitle';
import PostMeta from '@/components/ui/PostMeta';
import { useDebounce } from '@/hooks/useDebounce';
import { siteConfig } from '@/config/site';

function HighlightMatch({ text, query }: { text: string; query: string }) {
    if (!query || query.length < 2) return <>{text}</>;

    // Split text by query (case-insensitive)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
            )}
        </>
    );
}

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') ?? '');
    const debouncedQuery = useDebounce(query, 300);

    const [results, setResults] = useState<SearchResult[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searched, setSearched] = useState(false);
    const [nextOffset, setNextOffset] = useState(0);

    const doSearch = useCallback(
        async (q: string, currentOffset: number = 0, append: boolean = false) => {
            if (q.length < 2) {
                setResults([]);
                setCount(0);
                setSearched(false);
                setNextOffset(0);
                return;
            }

            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(q)}&offset=${currentOffset}&occurrenceLimit=${siteConfig.search.occurrenceLimit}`
                );
                const data = await res.json();

                if (append) {
                    setResults((prev) => [...prev, ...data.results]);
                } else {
                    setResults(data.results);
                }

                setCount(data.count);
                setNextOffset(data.nextOffset);
                setSearched(true);
            } catch {
                if (!append) {
                    setResults([]);
                    setCount(0);
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        []
    );

    // Perform search when debounced query changes
    useEffect(() => {
        doSearch(debouncedQuery, 0, false);

        // Update URL
        if (debouncedQuery.length >= 2) {
            router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
        } else {
            router.replace('/search', { scroll: false });
        }
    }, [debouncedQuery, doSearch, router]);

    const handleLoadMore = () => {
        if (nextOffset === -1) return;
        doSearch(debouncedQuery, nextOffset, true);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setCount(0);
        setSearched(false);
        setNextOffset(0);
        router.replace('/search', { scroll: false });
    };

    return (
        <div className="py-8 w-full">
            <h1 className="my-8 text-3xl font-bold tracking-wider sm:text-4xl">Search</h1>
            <p className="mb-6 italic text-foreground/80">Search any article ...</p>

            {/* Search input */}
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

            {/* Result count */}
            {searched && !loading && (
                <div className="mb-6 pb-4 border-b border-border text-sm text-foreground/75">
                    {count} {count === 1 ? 'result' : 'results'} for{' '}
                    <span className="font-semibold text-foreground">{debouncedQuery}</span>
                </div>
            )}

            {/* Loading state */}
            {loading && <div className="text-sm italic text-foreground/60">Searching...</div>}

            {/* Results */}
            {!loading && searched && results.length === 0 && (
                <p className="text-foreground/75 italic">No results found.</p>
            )}

            {!loading && results.length > 0 && (
                <ul className="space-y-6">
                    {results.map((result) => (
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
                                            >
                                                <HighlightMatch
                                                    text={snippet}
                                                    query={debouncedQuery}
                                                />
                                            </p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Load More */}
            {searched && !loading && nextOffset !== -1 && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-2 rounded-md border border-border bg-background hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {loadingMore ? 'Loading...' : `Load more results`}
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
