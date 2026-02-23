import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DirectionalLink } from '../DirectionalLink';
import React from 'react';

// Mock next-view-transitions
vi.mock('next-view-transitions', () => ({
    Link: ({ href, children, className, onClick }: any) => (
        <a
            href={href}
            className={className}
            onClick={(e) => {
                e.preventDefault();
                onClick?.(e);
            }}
        >
            {children}
        </a>
    ),
}));

describe('DirectionalLink', () => {
    it('renders as a link with the correct href and children', () => {
        render(
            <DirectionalLink href="/next-post" direction="next">
                Next Post
            </DirectionalLink>
        );
        const link = screen.getByRole('link', { name: /next post/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/next-post');
    });

    it('sets document.documentElement.dataset.direction correctly when clicked (next)', () => {
        render(
            <DirectionalLink href="/next-post" direction="next">
                Next Post
            </DirectionalLink>
        );
        const link = screen.getByRole('link');
        fireEvent.click(link);
        expect(document.documentElement.dataset.direction).toBe('next');
    });

    it('sets document.documentElement.dataset.direction correctly when clicked (prev)', () => {
        render(
            <DirectionalLink href="/prev-post" direction="prev">
                Previous Post
            </DirectionalLink>
        );
        const link = screen.getByRole('link');
        fireEvent.click(link);
        expect(document.documentElement.dataset.direction).toBe('prev');
    });

    it('applies custom className', () => {
        render(
            <DirectionalLink href="/next-post" direction="next" className="custom-link">
                Next
            </DirectionalLink>
        );
        const link = screen.getByRole('link');
        expect(link).toHaveClass('custom-link');
    });
});
