import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TableOfContents from '../TableOfContents';

vi.mock('next-view-transitions', () => ({
    Link: ({ href, children, className }: any) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

describe('TableOfContents', () => {
    it('renders nothing if headings are empty', () => {
        const { container } = render(<TableOfContents headings={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a list of headings', () => {
        render(
            <TableOfContents
                headings={[
                    { text: 'Heading 2', slug: 'heading-2', level: 2 },
                    { text: 'Heading 3', slug: 'heading-3', level: 3 },
                ]}
            />
        );

        expect(screen.getByText('Contents')).toBeInTheDocument();

        const item2 = screen.getByText('Heading 2').closest('li');
        expect(item2).toHaveTextContent('1. Heading 2');
        expect(screen.getByText('Heading 3')).toBeInTheDocument();

        const item3 = screen.getByText('Heading 3').closest('li');
        expect(item3?.style.paddingLeft).toBe('1.5rem');
    });

    it('scrolls into view when element exists', () => {
        const scrollIntoViewMock = vi.fn();
        vi.spyOn(document, 'getElementById').mockReturnValue({
            scrollIntoView: scrollIntoViewMock,
        } as unknown as HTMLElement);

        const pushStateMock = vi.fn();
        vi.stubGlobal('history', { pushState: pushStateMock });

        render(<TableOfContents headings={[{ text: 'Clickable', slug: 'clickable', level: 2 }]} />);

        screen.getByText('Clickable').click();

        expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
        expect(pushStateMock).toHaveBeenCalledWith(null, '', '#clickable');

        vi.restoreAllMocks();
    });

    it('sets window location hash when element does not exist', () => {
        vi.spyOn(document, 'getElementById').mockReturnValue(null);

        const originalHash = window.location.hash;
        window.location.hash = '';

        render(<TableOfContents headings={[{ text: 'Missing', slug: 'missing', level: 2 }]} />);

        screen.getByText('Missing').click();

        expect(window.location.hash).toBe('#missing');

        window.location.hash = originalHash;
        vi.restoreAllMocks();
    });
});
