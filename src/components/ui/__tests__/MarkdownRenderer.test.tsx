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

        const spanContainer = container.querySelector('span.block.w-full.my-4');
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

    it('renders a TableOfContents when headings prop is provided', () => {
        const { container } = render(
            <MarkdownRenderer
                content="## Section\nBody"
                headings={[{ text: 'Section', slug: 'section', index: 0, level: 2 }]}
            />
        );
        expect(container.querySelector('aside')).toBeInTheDocument();
        expect(screen.getByText('Contents')).toBeInTheDocument();
    });

    it('does not render a TableOfContents when headings are empty', () => {
        const { container } = render(<MarkdownRenderer content="No headings" headings={[]} />);
        expect(container.querySelector('aside')).not.toBeInTheDocument();
    });
});
