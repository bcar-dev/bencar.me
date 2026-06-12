import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/vue';
import ReadingProgress from '../ReadingProgress.vue';

function setScroll({ scrollY, scrollHeight, innerHeight }: Record<string, number>) {
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: scrollHeight,
        configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
}

describe('ReadingProgress', () => {
    beforeEach(() => {
        // Run the rAF callback synchronously.
        Object.defineProperty(window, 'requestAnimationFrame', {
            value: (cb: FrameRequestCallback) => {
                cb(0);
                return 0;
            },
            configurable: true,
        });
        setScroll({ scrollY: 0, scrollHeight: 2000, innerHeight: 1000 });
    });
    afterEach(() => vi.restoreAllMocks());

    it('renders a progressbar starting at 0%', () => {
        const { getByRole } = render(ReadingProgress);
        const bar = getByRole('progressbar');
        expect(bar).toHaveStyle({ width: '0%' });
    });

    it('updates width on scroll', async () => {
        const { getByRole } = render(ReadingProgress);
        setScroll({ scrollY: 500, scrollHeight: 2000, innerHeight: 1000 });
        window.dispatchEvent(new Event('scroll'));
        expect(getByRole('progressbar')).toHaveStyle({ width: '50%' });
    });

    it('clamps to 100% past the bottom', async () => {
        const { getByRole } = render(ReadingProgress);
        setScroll({ scrollY: 5000, scrollHeight: 2000, innerHeight: 1000 });
        window.dispatchEvent(new Event('scroll'));
        expect(getByRole('progressbar')).toHaveStyle({ width: '100%' });
    });

    it('stays at 0% when content fits the viewport', async () => {
        const { getByRole } = render(ReadingProgress);
        setScroll({ scrollY: 0, scrollHeight: 800, innerHeight: 1000 });
        window.dispatchEvent(new Event('scroll'));
        expect(getByRole('progressbar')).toHaveStyle({ width: '0%' });
    });

    it('coalesces rapid scrolls with the ticking guard', () => {
        const queued: { frame: FrameRequestCallback | null } = { frame: null };
        Object.defineProperty(window, 'requestAnimationFrame', {
            value: (cb: FrameRequestCallback) => {
                queued.frame = cb;
                return 1;
            },
            configurable: true,
        });
        const { getByRole } = render(ReadingProgress);
        setScroll({ scrollY: 500, scrollHeight: 2000, innerHeight: 1000 });
        window.dispatchEvent(new Event('scroll')); // schedules, sets ticking
        window.dispatchEvent(new Event('scroll')); // ticking already set -> early return
        queued.frame?.(0); // run the single queued frame
        expect(getByRole('progressbar')).toHaveStyle({ width: '50%' });
    });

    it('falls back to setTimeout when requestAnimationFrame is unavailable', () => {
        // Only fake setTimeout so we can null out rAF and hit the fallback path.
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        Object.defineProperty(window, 'requestAnimationFrame', {
            value: undefined,
            configurable: true,
        });
        const { getByRole } = render(ReadingProgress);
        setScroll({ scrollY: 500, scrollHeight: 2000, innerHeight: 1000 });
        window.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(16);
        expect(getByRole('progressbar')).toHaveStyle({ width: '50%' });
        vi.useRealTimers();
    });
});
