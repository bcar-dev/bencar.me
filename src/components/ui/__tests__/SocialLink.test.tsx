import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SocialLink from '../SocialLink';

describe('SocialLink', () => {
    it('renders as an anchor with correct attributes', () => {
        render(
            <SocialLink href="https://github.com" aria-label="GitHub">
                <span>Icon</span>
            </SocialLink>
        );

        const link = screen.getByRole('link', { name: /github/i });
        expect(link).toHaveAttribute('href', 'https://github.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(
            <SocialLink href="#" aria-label="Test" className="custom-class">
                <span>Icon</span>
            </SocialLink>
        );

        const link = screen.getByRole('link');
        expect(link.className).toContain('custom-class');
    });
});
