import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTagFilter } from '../useTagFilter';
import { useSearchParams } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useSearchParams: vi.fn(),
}));

describe('useTagFilter', () => {
    const allTags = ['react', 'nextjs', 'typescript'];
    const allPosts = [
        { slug: 'post1', frontmatter: { tags: ['react', 'nextjs'] }, content: '', readingTime: '' },
        {
            slug: 'post2',
            frontmatter: { tags: ['react', 'typescript'] },
            content: '',
            readingTime: '',
        },
        { slug: 'post3', frontmatter: { tags: ['nextjs'] }, content: '', readingTime: '' },
    ] as any;

    beforeEach(() => {
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
    });

    it('initially has no selected tags if no search param', () => {
        const { result } = renderHook(() => useTagFilter(allTags, allPosts));
        expect(result.current.selectedTags).toEqual([]);
        expect(result.current.filteredPosts).toHaveLength(3);
    });

    it('ignores query param if already initialized', () => {
        // Initial mount without a tag
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
        const { result, rerender } = renderHook(() => useTagFilter(allTags, allPosts));
        expect(result.current.selectedTags).toEqual([]);

        // Change the search params without unmounting
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tag=nextjs') as any);
        rerender();

        // The hook should NOT process the new search param because it was already initialized
        expect(result.current.selectedTags).toEqual([]);
    });

    it('pre-selects tag from search params', () => {
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tag=react') as any);
        const { result } = renderHook(() => useTagFilter(allTags, allPosts));
        expect(result.current.selectedTags).toEqual(['react']);
        expect(result.current.filteredPosts).toHaveLength(2);
    });

    it('does not re-evaluate search params once initialized', () => {
        // Initial render with tag=react
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tag=react') as any);
        const { result, rerender } = renderHook(() => useTagFilter(allTags, allPosts));

        expect(result.current.selectedTags).toEqual(['react']);

        // Clear tags manually
        act(() => {
            result.current.clearTags();
        });
        expect(result.current.selectedTags).toEqual([]);

        // Rerender (which triggers useEffect dependencies), it should NOT pre-select react again
        // because initialized.current is true.
        rerender();

        expect(result.current.selectedTags).toEqual([]);
    });

    it('toggles tags correctly', () => {
        const { result } = renderHook(() => useTagFilter(allTags, allPosts));

        act(() => {
            result.current.toggleTag('react');
        });
        expect(result.current.selectedTags).toEqual(['react']);
        expect(result.current.filteredPosts).toHaveLength(2);

        act(() => {
            result.current.toggleTag('nextjs');
        });
        expect(result.current.selectedTags).toEqual(['react', 'nextjs']);
        expect(result.current.filteredPosts).toHaveLength(1);

        act(() => {
            result.current.toggleTag('react');
        });
        expect(result.current.selectedTags).toEqual(['nextjs']);
    });

    it('clears all tags', () => {
        const { result } = renderHook(() => useTagFilter(allTags, allPosts));
        act(() => {
            result.current.toggleTag('react');
            result.current.toggleTag('nextjs');
        });
        expect(result.current.selectedTags).toHaveLength(2);

        act(() => {
            result.current.clearTags();
        });
        expect(result.current.selectedTags).toEqual([]);
    });

    it('calculates tag counts and sorted tags correctly', () => {
        const { result } = renderHook(() => useTagFilter(allTags, allPosts));
        expect(result.current.tagCounts).toEqual({
            react: 2,
            nextjs: 2,
            typescript: 1,
        });
        // react and nextjs both have 2, so order depends on array sort (allTags order)
        expect(result.current.sortedTags[2]).toBe('typescript');
    });
});
