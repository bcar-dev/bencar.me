import { describe, it, expect } from 'vitest';
import { useTagFilter } from '../useTagFilter';
import type { Post } from '@/types';

function makePost(slug: string, tags: string[]): Post {
    return {
        slug,
        frontmatter: {
            title: slug,
            description: '',
            pubDatetime: '2026-01-01',
            tags,
        },
        content: '',
        readingTime: '1 min read',
        headings: [],
        formattedDate: 'Jan 1, 2026',
    };
}

const allTags = ['ai', 'cycling', 'dev'];
const allPosts = [
    makePost('p1', ['ai', 'dev']),
    makePost('p2', ['cycling']),
    makePost('p3', ['ai']),
];

describe('useTagFilter', () => {
    it('starts empty with no initial tag', () => {
        const { selectedTags, filteredPosts } = useTagFilter(allTags, allPosts);
        expect(selectedTags.value).toEqual([]);
        expect(filteredPosts.value).toHaveLength(3);
    });

    it('preselects a valid initial tag from the query', () => {
        const { selectedTags, filteredPosts } = useTagFilter(allTags, allPosts, 'ai');
        expect(selectedTags.value).toEqual(['ai']);
        expect(filteredPosts.value.map((p) => p.slug)).toEqual(['p1', 'p3']);
    });

    it('ignores an unknown initial tag', () => {
        const { selectedTags } = useTagFilter(allTags, allPosts, 'unknown');
        expect(selectedTags.value).toEqual([]);
    });

    it('toggles tags on and off', () => {
        const { selectedTags, toggleTag } = useTagFilter(allTags, allPosts);
        toggleTag('ai');
        expect(selectedTags.value).toEqual(['ai']);
        toggleTag('ai');
        expect(selectedTags.value).toEqual([]);
    });

    it('filters posts by every selected tag (AND)', () => {
        const { toggleTag, filteredPosts } = useTagFilter(allTags, allPosts);
        toggleTag('ai');
        toggleTag('dev');
        expect(filteredPosts.value.map((p) => p.slug)).toEqual(['p1']);
    });

    it('clears all selected tags', () => {
        const { selectedTags, toggleTag, clearTags } = useTagFilter(allTags, allPosts);
        toggleTag('ai');
        clearTags();
        expect(selectedTags.value).toEqual([]);
    });

    it('computes per-tag counts and sorts tags by frequency', () => {
        const { tagCounts, sortedTags } = useTagFilter(allTags, allPosts);
        expect(tagCounts.value).toEqual({ ai: 2, cycling: 1, dev: 1 });
        expect(sortedTags.value[0]).toBe('ai');
    });

    it('ignores post tags that are not in the known tag list', () => {
        const posts = [makePost('p1', ['ai', 'ghost'])];
        const { tagCounts } = useTagFilter(['ai'], posts);
        expect(tagCounts.value).toEqual({ ai: 1 });
        expect('ghost' in tagCounts.value).toBe(false);
    });
});
