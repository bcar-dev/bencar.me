import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PostNavigation from '../PostNavigation';

// Mock DirectionalLink
vi.mock('../DirectionalLink', () => ({
    DirectionalLink: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('PostNavigation', () => {
    const prevPost = { slug: 'prev', frontmatter: { title: 'Previous Title' } };
    const nextPost = { slug: 'next', frontmatter: { title: 'Next Title' } };

    it('renders null if no posts provided', () => {
        const { container } = render(<PostNavigation prevPost={null} nextPost={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders previous post link', () => {
        render(<PostNavigation prevPost={prevPost} nextPost={null} />);
        expect(screen.getByText('Previous Title')).toBeInTheDocument();
        expect(screen.getByText(/previous post/i)).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/prev');
    });

    it('renders next post link', () => {
        render(<PostNavigation prevPost={null} nextPost={nextPost} />);
        expect(screen.getByText('Next Title')).toBeInTheDocument();
        expect(screen.getByText(/next post/i)).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/next');
    });

    it('renders both links', () => {
        render(<PostNavigation prevPost={prevPost} nextPost={nextPost} />);
        expect(screen.getByText('Previous Title')).toBeInTheDocument();
        expect(screen.getByText('Next Title')).toBeInTheDocument();
    });
});
