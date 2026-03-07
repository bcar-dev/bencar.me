import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReadingProgress from '../ReadingProgress';

describe('ReadingProgress Component', () => {
    let originalScrollHeight: number;
    let originalInnerHeight: number;

    beforeEach(() => {
        // Save original values
        originalScrollHeight = document.documentElement.scrollHeight;
        originalInnerHeight = window.innerHeight;

        // Mock document properties for calculating progress
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            writable: true,
            value: 2000,
        });

        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            value: 1000,
        });

        // Mock scrollY
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 0,
        });
    });

    afterEach(() => {
        // Restore values
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            writable: true,
            value: originalScrollHeight,
        });

        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            value: originalInnerHeight,
        });

        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 0,
        });
        vi.restoreAllMocks();
    });

    it('renders initially with 0% progress', () => {
        render(<ReadingProgress />);
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('updates progress when scrolling', () => {
        render(<ReadingProgress />);

        // Scroll exactly halfway (1000px out of a scrollable 1000px range)
        window.scrollY = 500;
        fireEvent.scroll(window);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');

        // Scroll to the end
        window.scrollY = 1000;
        fireEvent.scroll(window);
        expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps progress to 100% if scrolled past the bottom', () => {
        render(<ReadingProgress />);

        window.scrollY = 1500; // Past maximum possible 1000 scrollY
        fireEvent.scroll(window);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps progress to 0% if scroll position is negative', () => {
        render(<ReadingProgress />);

        window.scrollY = -100; // E.g., overscroll in Safari
        fireEvent.scroll(window);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles case where content is smaller than window height', () => {
        // Make document smaller than window
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500 });
        Object.defineProperty(window, 'innerHeight', { value: 1000 });

        render(<ReadingProgress />);

        window.scrollY = 0;
        fireEvent.scroll(window);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });
});
