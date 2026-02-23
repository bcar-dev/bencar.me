import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PostTitle from '../PostTitle';
import React from 'react';

// Mock next-view-transitions
vi.mock('next-view-transitions', () => ({
    Link: ({ href, children, className, style }: any) => (
        <a href={href} className={className} style={style} onClick={(e) => e.preventDefault()}>
            {children}
        </a>
    ),
    __esModule: true,
}));

describe('PostTitle', () => {
    it('renders as a link with the correct href', () => {
        render(<PostTitle href="/test-post">Test Post</PostTitle>);
        const link = screen.getByRole('link', { name: /test post/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test-post');
    });

    it('renders children correctly', () => {
        render(
            <PostTitle href="/test-post">
                <span>Custom Child</span>
            </PostTitle>
        );
        expect(screen.getByText('Custom Child')).toBeInTheDocument();
    });

    it('applies custom className and styles', () => {
        const customClass = 'custom-class';
        const customStyle = { color: 'red' };
        render(
            <PostTitle href="/test-post" className={customClass} style={customStyle}>
                Test
            </PostTitle>
        );
        const link = screen.getByRole('link');
        expect(link).toHaveClass('custom-class');
        expect(link).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('includes base classes', () => {
        render(<PostTitle href="/test-post">Test</PostTitle>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('inline-block');
        expect(link).toHaveClass('text-accent');
    });
});
