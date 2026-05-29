import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Post } from '@/types';

export function useTagFilter(allTags: string[], allPosts: Post[]) {
    const searchParams = useSearchParams();

    // Initial selection comes from ?tag= on first render only; later changes
    // to the query param do not retroactively select tags.
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        const tag = searchParams.get('tag');
        return tag && allTags.includes(tag) ? [tag] : [];
    });

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearTags = () => setSelectedTags([]);

    const { tagCounts, sortedTags } = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const tag of allTags) counts[tag] = 0;
        for (const post of allPosts) {
            for (const tag of post.frontmatter.tags) {
                if (tag in counts) counts[tag]++;
            }
        }
        const sorted = [...allTags].sort((a, b) => counts[b] - counts[a]);
        return { tagCounts: counts, sortedTags: sorted };
    }, [allTags, allPosts]);

    const filteredPosts = useMemo(() => {
        if (selectedTags.length === 0) return allPosts;
        return allPosts.filter((post) =>
            selectedTags.every((st) => post.frontmatter.tags.includes(st))
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
