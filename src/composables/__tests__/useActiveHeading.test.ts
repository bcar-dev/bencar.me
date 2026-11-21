import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useActiveHeading } from '../useActiveHeading';
import { withSetup } from '@/test/withSetup';

const headingTops: Record<string, number> = {};

function renderHeadingsInPage(tops: Record<string, number>) {
    Object.assign(headingTops, tops);
    for (const slug of Object.keys(tops)) {
        const heading = document.createElement('h2');
        heading.id = slug;
        heading.getBoundingClientRect = () => ({ top: headingTops[slug] }) as DOMRect;
        document.body.appendChild(heading);
    }
}

describe('useActiveHeading', () => {
    let pendingFrame: FrameRequestCallback | null;
    const cancelAnimationFrame = vi.fn();

    beforeEach(() => {
        // Queue frames so tests control when the throttled update runs.
        pendingFrame = null;
        Object.defineProperty(window, 'requestAnimationFrame', {
            value: (cb: FrameRequestCallback) => {
                pendingFrame = cb;
                return 7;
            },
            configurable: true,
        });
        Object.defineProperty(window, 'cancelAnimationFrame', {
            value: cancelAnimationFrame,
            configurable: true,
        });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            value: 5000,
            configurable: true,
        });
        renderHeadingsInPage({ intro: 50, outro: 800 });
    });

    afterEach(() => {
        document.body.innerHTML = '';
        cancelAnimationFrame.mockClear();
    });

    it('reports the current heading as soon as it mounts', () => {
        const [activeSlug, app] = withSetup(() => useActiveHeading(['intro', 'outro']));
        expect(activeSlug.value).toBe('intro');
        app.unmount();
    });

    it('recomputes on resize, once per animation frame', () => {
        const [activeSlug, app] = withSetup(() => useActiveHeading(['intro', 'outro']));

        Object.assign(headingTops, { intro: -700, outro: 60 });
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));
        expect(activeSlug.value).toBe('intro');

        pendingFrame!(0);
        expect(activeSlug.value).toBe('outro');
        app.unmount();
    });

    it('stops listening to scroll and resize on unmount', () => {
        const [, app] = withSetup(() => useActiveHeading(['intro', 'outro']));
        app.unmount();

        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        expect(pendingFrame).toBeNull();
    });

    it('cancels a pending frame on unmount', () => {
        const [, app] = withSetup(() => useActiveHeading(['intro', 'outro']));
        window.dispatchEvent(new Event('scroll'));
        app.unmount();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
    });
});
