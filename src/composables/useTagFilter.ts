import { ref, computed } from 'vue';
import type { Post } from '@/types';

/**
 * Tag filtering state for the /tags page. The initial selection comes from the
 * `?tag=` query param (read by the island and passed in); later query changes
 * do not retroactively select tags.
 */
export function useTagFilter(allTags: string[], allPosts: Post[], initialTag?: string | null) {
    const selectedTags = ref<string[]>(
        initialTag && allTags.includes(initialTag) ? [initialTag] : []
    );

    function toggleTag(tag: string) {
        selectedTags.value = selectedTags.value.includes(tag)
            ? selectedTags.value.filter((t) => t !== tag)
            : [...selectedTags.value, tag];
    }

    function clearTags() {
        selectedTags.value = [];
    }

    const tagCounts = computed(() => {
        const counts: Record<string, number> = {};
        for (const tag of allTags) counts[tag] = 0;
        for (const post of allPosts) {
            for (const tag of post.frontmatter.tags) {
                if (tag in counts) counts[tag]++;
            }
        }
        return counts;
    });

    const sortedTags = computed(() =>
        [...allTags].sort((a, b) => tagCounts.value[b] - tagCounts.value[a])
    );

    const filteredPosts = computed(() => {
        if (selectedTags.value.length === 0) return allPosts;
        return allPosts.filter((post) =>
            selectedTags.value.every((st) => post.frontmatter.tags.includes(st))
        );
    });

    return { selectedTags, toggleTag, clearTags, tagCounts, sortedTags, filteredPosts };
}
