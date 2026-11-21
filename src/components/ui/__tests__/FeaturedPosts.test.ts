import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FeaturedPosts from '../FeaturedPosts.vue';
import type { FeaturedSlide } from '@/types';

function makeSlide(slug: string, overrides: Partial<FeaturedSlide> = {}): FeaturedSlide {
    return {
        slug,
        title: `Title ${slug}`,
        description: `Description ${slug}`,
        pubDatetime: '2026-01-01',
        readingTime: '3 min read',
        ...overrides,
    };
}

const slides = [makeSlide('first'), makeSlide('second'), makeSlide('third'), makeSlide('fourth')];

describe('FeaturedPosts', () => {
    it('renders nothing when there are no slides', () => {
        const { queryByRole } = render(FeaturedPosts, { props: { slides: [] } });
        expect(queryByRole('region')).toBeNull();
    });

    it('opens on the first slide with links to that post', () => {
        const { getByRole, getByText } = render(FeaturedPosts, { props: { slides } });
        expect(getByRole('link', { name: 'Title first' })).toHaveAttribute('href', '/posts/first');
        expect(getByRole('link', { name: /read more/i })).toHaveAttribute('href', '/posts/first');
        expect(getByText('Description first')).toBeInTheDocument();
        expect(getByText('01 / 04')).toBeInTheDocument();
    });

    it('moves to the next post', async () => {
        const user = userEvent.setup();
        const { getByRole, getByText } = render(FeaturedPosts, { props: { slides } });
        await user.click(getByRole('button', { name: 'Next post' }));
        expect(getByRole('link', { name: 'Title second' })).toHaveAttribute(
            'href',
            '/posts/second'
        );
        expect(getByRole('link', { name: /read more/i })).toHaveAttribute('href', '/posts/second');
        expect(getByText('02 / 04')).toBeInTheDocument();
    });

    it('wraps around in both directions', async () => {
        const user = userEvent.setup();
        const { getByRole, getByText } = render(FeaturedPosts, { props: { slides } });

        await user.click(getByRole('button', { name: 'Previous post' }));
        expect(getByRole('link', { name: 'Title fourth' })).toBeInTheDocument();
        expect(getByText('04 / 04')).toBeInTheDocument();

        await user.click(getByRole('button', { name: 'Next post' }));
        expect(getByRole('link', { name: 'Title first' })).toBeInTheDocument();
        expect(getByText('01 / 04')).toBeInTheDocument();
    });

    it('hides the arrows when there is a single post', () => {
        const { queryByRole } = render(FeaturedPosts, { props: { slides: [makeSlide('only')] } });
        expect(queryByRole('button', { name: 'Next post' })).toBeNull();
        expect(queryByRole('button', { name: 'Previous post' })).toBeNull();
    });

    it("shows the current post's cover image", async () => {
        const image = {
            src: '/_astro/cover.webp',
            srcset: '/_astro/cover-800.webp 800w',
            width: 1600,
            height: 900,
        };
        const user = userEvent.setup();
        const { container, getByRole } = render(FeaturedPosts, {
            props: { slides: [makeSlide('with-cover', { image }), makeSlide('no-cover')] },
        });

        const img = container.querySelector('img');
        expect(img).toHaveAttribute('src', '/_astro/cover.webp');
        expect(img).toHaveAttribute('srcset', '/_astro/cover-800.webp 800w');

        await user.click(getByRole('button', { name: 'Next post' }));
        expect(container.querySelector('img')).toBeNull();
    });
});
