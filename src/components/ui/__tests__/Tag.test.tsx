import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tag from '../Tag';

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    __esModule: true,
}));

describe('Tag', () => {
    it('renders the tag text with a hash', () => {
        render(<Tag tag="react" />);
        expect(screen.getByText('#react')).toBeInTheDocument();
    });

    it('has the correct link href', () => {
        render(<Tag tag="nextjs" />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/tags?tag=nextjs');
    });

    it('applies custom className', () => {
        render(<Tag tag="test" className="custom-class" />);
        const link = screen.getByRole('link');
        expect(link.className).toContain('custom-class');
    });
});
