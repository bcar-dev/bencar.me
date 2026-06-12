import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTheme } from '../useTheme';
import { withSetup } from '@/test/withSetup';

describe('useTheme', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.documentElement.classList.remove('dark');
        localStorage.clear();
    });
    afterEach(() => vi.useRealTimers());

    it('starts not animating', () => {
        const [{ isAnimating }, app] = withSetup(() => useTheme());
        expect(isAnimating.value).toBe(false);
        app.unmount();
    });

    it('toggles the dark class and persists the choice', () => {
        const [{ toggleTheme }, app] = withSetup(() => useTheme());
        toggleTheme();
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
        app.unmount();
    });

    it('toggles back to light from dark', () => {
        document.documentElement.classList.add('dark');
        const [{ toggleTheme }, app] = withSetup(() => useTheme());
        toggleTheme();
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
        app.unmount();
    });

    it('prevents a second toggle while animating', () => {
        const [{ isAnimating, toggleTheme }, app] = withSetup(() => useTheme());
        toggleTheme();
        expect(isAnimating.value).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        // ignored mid-animation
        toggleTheme();
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        app.unmount();
    });

    it('clears the animating flag after the animation window', () => {
        const [{ isAnimating, toggleTheme }, app] = withSetup(() => useTheme());
        toggleTheme();
        expect(isAnimating.value).toBe(true);
        vi.advanceTimersByTime(500);
        expect(isAnimating.value).toBe(false);
        app.unmount();
    });
});
