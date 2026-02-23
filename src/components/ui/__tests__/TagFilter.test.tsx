import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TagFilter from '../TagFilter';
import { useTagFilter } from '@/hooks/useTagFilter';

// Mock the hook and useSearchParams (it's used by the hook, but we mock the hook directly)
vi.mock('@/hooks/useTagFilter', () => ({
    useTagFilter: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    __esModule: true,
}));

// Mock next-view-transitions
vi.mock('next-view-transitions', () => ({
    Link: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('TagFilter', () => {
    const allTags = ['react', 'nextjs'];
    const allPosts = [] as any;
    const mockToggleTag = vi.fn();
    const mockClearTags = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the title and tags', () => {
        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: [],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 5, nextjs: 3 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: [],
        });

        render(<TagFilter allTags={allTags} allPosts={allPosts} />);

        expect(screen.getByRole('heading', { name: /^tags$/i })).toBeInTheDocument();
        expect(screen.getByText(/react/i)).toBeInTheDocument();
        expect(screen.getByText(/5/)).toBeInTheDocument(); // react count
        expect(screen.getByText(/nextjs/i)).toBeInTheDocument();
        expect(screen.getByText(/3/)).toBeInTheDocument(); // nextjs count
    });

    it('shows clear button only when tags are selected', () => {
        // No tags selected
        const { rerender } = render(<TagFilter allTags={allTags} allPosts={allPosts} />);
        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: [],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 5, nextjs: 3 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: [],
        });
        expect(screen.queryByText(/clear/i)).not.toBeInTheDocument();

        // One tag selected
        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: ['react'],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 5, nextjs: 3 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: [],
        });
        rerender(<TagFilter allTags={allTags} allPosts={allPosts} />);
        expect(screen.getByText(/clear/i)).toBeInTheDocument();
    });

    it('calls toggleTag when a tag is clicked', () => {
        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: [],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 5, nextjs: 3 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: [],
        });

        render(<TagFilter allTags={allTags} allPosts={allPosts} />);
        const reactTag = screen.getByText(/react/i).closest('button');
        fireEvent.click(reactTag!);
        expect(mockToggleTag).toHaveBeenCalledWith('react');
    });

    it('calls clearTags when clear button is clicked', () => {
        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: ['react'],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 5, nextjs: 3 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: [],
        });

        render(<TagFilter allTags={allTags} allPosts={allPosts} />);
        const clearButton = screen.getByText(/clear/i);
        fireEvent.click(clearButton);
        expect(mockClearTags).toHaveBeenCalled();
    });

    it('renders filtered posts when available', () => {
        const mockPosts = [
            {
                slug: 'test-post-1',
                frontmatter: {
                    title: 'Test Post 1',
                    description: 'Description 1',
                    pubDatetime: '2026-02-23T00:00:00.000Z',
                    tags: ['react'],
                },
                readingTime: '5 min read',
            },
        ];

        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: ['react'],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 1, nextjs: 0 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: mockPosts as any,
        });

        render(<TagFilter allTags={allTags} allPosts={allPosts} />);

        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('(1)')).toBeInTheDocument(); // Count display
    });

    it('renders empty state message when no posts match', () => {
        vi.mocked(useTagFilter).mockReturnValue({
            selectedTags: ['react', 'nextjs'],
            toggleTag: mockToggleTag,
            clearTags: mockClearTags,
            tagCounts: { react: 1, nextjs: 1 },
            sortedTags: ['react', 'nextjs'],
            filteredPosts: [],
        });

        render(<TagFilter allTags={allTags} allPosts={allPosts} />);

        expect(
            screen.getByText(/No posts perfectly match this combination of tags/i)
        ).toBeInTheDocument();
        expect(screen.getByText('(0)')).toBeInTheDocument();
    });
});
