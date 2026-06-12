import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import TagFilter from '../TagFilter.vue';
import type { Post } from '@/types';

function makePost(slug: string, title: string, tags: string[]): Post {
    return {
        slug,
        frontmatter: { title, description: `${title} desc`, pubDatetime: '2026-01-01', tags },
        content: '',
        readingTime: '1 min read',
        headings: [],
        formattedDate: 'Jan 1, 2026',
    };
}

const allTags = ['ai', 'cycling'];
const allPosts = [makePost('p1', 'AI Post', ['ai']), makePost('p2', 'Bike Post', ['cycling'])];

describe('TagFilter', () => {
    it('renders all posts initially', () => {
        const { getByText } = render(TagFilter, { props: { allTags, allPosts } });
        expect(getByText('AI Post')).toBeInTheDocument();
        expect(getByText('Bike Post')).toBeInTheDocument();
    });

    it('filters posts when a tag is selected', async () => {
        const user = userEvent.setup();
        const { getByRole, queryByText } = render(TagFilter, { props: { allTags, allPosts } });

        await user.click(getByRole('button', { name: /ai/i }));

        expect(queryByText('AI Post')).toBeInTheDocument();
        expect(queryByText('Bike Post')).toBeNull();
    });

    it('shows a clear-all control once a tag is active and resets on click', async () => {
        const user = userEvent.setup();
        const { getByRole, queryByText } = render(TagFilter, { props: { allTags, allPosts } });

        await user.click(getByRole('button', { name: /cycling/i }));
        await user.click(getByRole('button', { name: /clear all/i }));

        expect(queryByText('AI Post')).toBeInTheDocument();
        expect(queryByText('Bike Post')).toBeInTheDocument();
    });

    it('shows the empty state when no post matches all selected tags', async () => {
        const user = userEvent.setup();
        const { getByRole, getByText } = render(TagFilter, { props: { allTags, allPosts } });
        await user.click(getByRole('button', { name: /ai/i }));
        await user.click(getByRole('button', { name: /cycling/i }));
        expect(getByText(/No posts perfectly match/i)).toBeInTheDocument();
    });

    it('omits the description paragraph when a post has none', () => {
        const noDesc: Post = {
            ...makePost('p1', 'No Desc', ['ai']),
            frontmatter: { ...makePost('p1', 'No Desc', ['ai']).frontmatter, description: '' },
        };
        const { container } = render(TagFilter, { props: { allTags: ['ai'], allPosts: [noDesc] } });
        expect(container.querySelector('li p')).toBeNull();
    });

    it('applies the ?tag= query param on mount', async () => {
        window.history.replaceState({}, '', '/tags?tag=ai');
        try {
            const { findByText, queryByText } = render(TagFilter, {
                props: { allTags, allPosts },
            });
            await findByText('AI Post');
            expect(queryByText('Bike Post')).toBeNull();
        } finally {
            window.history.replaceState({}, '', '/');
        }
    });
});
