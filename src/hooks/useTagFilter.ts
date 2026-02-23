import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Post } from '@/types';

export function useTagFilter(allTags: string[], allPosts: Post[]) {
    const searchParams = useSearchParams();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const initialised = useRef(false);

    // Pre-select tag from ?tag= query param on first render
    useEffect(() => {
        if (initialised.current) return;
        initialised.current = true;

        const tag = searchParams.get('tag');
        if (tag && allTags.includes(tag)) {
            setSelectedTags([tag]);
        }
    }, [searchParams, allTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearTags = () => {
        setSelectedTags([]);
    };

    // Count posts per tag, sort tags by count descending (Memoized)
    const { tagCounts, sortedTags } = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const tag of allTags) {
            counts[tag] = allPosts.filter((post) => post.frontmatter.tags?.includes(tag)).length;
        }
        const sorted = [...allTags].sort((a, b) => counts[b] - counts[a]);
        return { tagCounts: counts, sortedTags: sorted };
    }, [allTags, allPosts]);

    // Filter posts - show posts that match ALL selected tags (Memoized)
    const filteredPosts = useMemo(() => {
        if (selectedTags.length === 0) return allPosts;

        return allPosts.filter((post) =>
            selectedTags.every((st) => post.frontmatter.tags?.includes(st))
        );
    }, [selectedTags, allPosts]);

    return {
        selectedTags,
        toggleTag,
        clearTags,
        tagCounts,
        sortedTags,
        filteredPosts,
    };
}
