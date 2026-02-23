import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransitionReset } from '../TransitionReset';
import { usePathname } from 'next/navigation';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

describe('TransitionReset', () => {
    it('removes data-direction from document.documentElement on mount', () => {
        document.documentElement.dataset.direction = 'next';
        (usePathname as any).mockReturnValue('/initial');

        render(<TransitionReset />);

        expect(document.documentElement.dataset.direction).toBeUndefined();
    });

    it('removes data-direction when pathname changes', () => {
        document.documentElement.dataset.direction = 'prev';
        const { rerender } = render(<TransitionReset />);

        // Ensure it's cleared on initial mount
        expect(document.documentElement.dataset.direction).toBeUndefined();

        // Set it again manually to simulate a user click before navigation
        document.documentElement.dataset.direction = 'next';

        // Change pathname
        (usePathname as any).mockReturnValue('/new-path');
        rerender(<TransitionReset />);

        expect(document.documentElement.dataset.direction).toBeUndefined();
    });
});
