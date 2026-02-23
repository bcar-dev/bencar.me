import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../Footer';
import { siteConfig } from '@/config/site';

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    __esModule: true,
}));

// Mock SocialLink
vi.mock('@/components/ui/SocialLink', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    __esModule: true,
}));

describe('Footer', () => {
    it('renders the copyright with current year', () => {
        render(<Footer />);
        const year = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    });

    it('renders the author name', () => {
        render(<Footer />);
        expect(screen.getByText(siteConfig.author.name)).toBeInTheDocument();
    });

    it('renders social links and tags link', () => {
        render(<Footer />);
        expect(screen.getByLabelText('GitHub')).toHaveAttribute('href', siteConfig.links.github);
        expect(screen.getByLabelText('LinkedIn')).toHaveAttribute(
            'href',
            siteConfig.links.linkedin
        );
        expect(screen.getByLabelText('Tags')).toHaveAttribute('href', '/tags');
    });
});
