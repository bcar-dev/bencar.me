import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReadingProgress from '../ReadingProgress';

async function flushFrame() {
    await act(async () => {
        await new Promise<void>((resolve) => {
            const raf =
                typeof window.requestAnimationFrame === 'function'
                    ? window.requestAnimationFrame
                    : (cb: FrameRequestCallback) => window.setTimeout(() => cb(0), 16);
            raf(() => resolve());
        });
    });
}

describe('ReadingProgress Component', () => {
    let originalScrollHeight: number;
    let originalInnerHeight: number;

    beforeEach(() => {
        originalScrollHeight = document.documentElement.scrollHeight;
        originalInnerHeight = window.innerHeight;

        Object.defineProperty(document.documentElement, 'scrollHeight', {
            writable: true,
            value: 2000,
        });
        Object.defineProperty(window, 'innerHeight', { writable: true, value: 1000 });
        Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    });

    afterEach(() => {
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            writable: true,
            value: originalScrollHeight,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            value: originalInnerHeight,
        });
        Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
        vi.restoreAllMocks();
    });

    it('renders initially with 0% progress', async () => {
        render(<ReadingProgress />);
        await flushFrame();
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('updates progress when scrolling', async () => {
        render(<ReadingProgress />);
        await flushFrame();

        window.scrollY = 500;
        fireEvent.scroll(window);
        await flushFrame();
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');

        window.scrollY = 1000;
        fireEvent.scroll(window);
        await flushFrame();
        expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps progress to 100% if scrolled past the bottom', async () => {
        render(<ReadingProgress />);
        await flushFrame();

        window.scrollY = 1500;
        fireEvent.scroll(window);
        await flushFrame();

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps progress to 0% if scroll position is negative', async () => {
        render(<ReadingProgress />);
        await flushFrame();

        window.scrollY = -100;
        fireEvent.scroll(window);
        await flushFrame();

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles case where content is smaller than window height', async () => {
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500 });
        Object.defineProperty(window, 'innerHeight', { value: 1000 });

        render(<ReadingProgress />);
        await flushFrame();

        window.scrollY = 0;
        fireEvent.scroll(window);
        await flushFrame();

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });
});
