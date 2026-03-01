import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownRenderer, { markdownComponents } from '../MarkdownRenderer';
import React from 'react';

vi.mock('next-view-transitions', () => ({
    Link: ({ href, children, className }: any) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

describe('MarkdownRenderer', () => {
    it('renders basic markdown content', () => {
        const content = '# Hello World\nThis is a test.';
        render(<MarkdownRenderer content={content} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
        expect(screen.getByText('This is a test.')).toBeInTheDocument();
    });

    it('renders h2 with anchor link', () => {
        const content = '## Section Two';
        render(<MarkdownRenderer content={content} />);
        const heading = screen.getByText('Section Two', { selector: 'h2' });
        expect(heading).toHaveClass('group relative scroll-mt-20');

        const anchor = screen.getByLabelText(/link to section/i);
        expect(anchor).toHaveAttribute('href', '#section-two');
        expect(anchor).toHaveTextContent('#');
    });

    it('renders h3 with anchor link', () => {
        const content = '### Section Three';
        render(<MarkdownRenderer content={content} />);
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toHaveTextContent('Section Three');

        const anchor = screen.getByLabelText(/link to section/i);
        expect(anchor).toHaveAttribute('href', '#section-three');
    });

    it('renders GFM (table) correctly', () => {
        const content = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
        const { container } = render(<MarkdownRenderer content={content} />);
        expect(container.querySelector('table')).toBeInTheDocument();
        expect(screen.getByText('Cell 1')).toBeInTheDocument();
    });

    it('applies the prose classes for styling', () => {
        const { container } = render(<MarkdownRenderer content="test" />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('prose');
        expect(wrapper).toHaveClass('prose-lg');
        expect(wrapper).toHaveClass('markdown-content');
    });

    it('renders Next.js Image for markdown images', () => {
        const content = '![Alt text](/test-image.png)';
        const { container } = render(<MarkdownRenderer content={content} />);

        const spanContainer = container.querySelector('span.relative.block.w-full.aspect-video');
        expect(spanContainer).toBeInTheDocument();

        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        // Next.js Image component adds its own attributes, we just verify the src is present in some form
        expect(img?.src).toContain('test-image.png');
        expect(img?.alt).toBe('Alt text');
    });

    it('returns null for image without src', () => {
        // A raw HTML img tag without a src attribute in markdown
        const content = '<img alt="No src" />';
        const { container } = render(<MarkdownRenderer content={content} />);

        // The img tag should be dropped
        const img = container.querySelector('img');
        expect(img).not.toBeInTheDocument();
    });

    it('handles images with missing alt attributes', () => {
        // A standard markdown image without alt text (just the URL)
        const content = '![](/test-no-alt.png)';
        const { container } = render(<MarkdownRenderer content={content} />);

        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        // Our custom renderer should fallback to 'Markdown Image'
        expect(img?.alt).toBe('Markdown Image');
    });

    it('returns null if src is not a string', () => {
        // Direct invocation to test edge case catching non-string src values
        const renderImg = markdownComponents.img as (props: any) => any;
        const result = renderImg({ src: { invalid: true } });
        expect(result).toBeNull();
    });

    it('returns null if table-of-contents data is invalid', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const renderToc = (markdownComponents as any)['table-of-contents'] as (props: any) => any;
        const result = renderToc({ 'data-headings': '{ invalid json' });
        expect(result).toBeNull();
        consoleSpy.mockRestore();
    });

    it.skipIf(typeof navigator !== 'undefined' && !navigator.userAgent.includes('jsdom'))(
        'returns null and does not log if table-of-contents data is invalid in production',
        () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.stubEnv('NODE_ENV', 'production');
            const renderToc = (markdownComponents as any)['table-of-contents'] as (
                props: any
            ) => any;
            const result = renderToc({ 'data-headings': '{ invalid json' });
            expect(result).toBeNull();
            expect(consoleSpy).not.toHaveBeenCalled();
            vi.unstubAllEnvs();
            consoleSpy.mockRestore();
        }
    );

    it('handles missing data-headings gracefully', () => {
        const renderToc = (markdownComponents as any)['table-of-contents'] as (props: any) => any;
        const result = renderToc({});
        expect(result).toBeTruthy();
    });
});
