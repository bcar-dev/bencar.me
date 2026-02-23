import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTheme } from '../useTheme';
import { useTheme as useNextTheme } from 'next-themes';

vi.mock('next-themes', () => ({
    useTheme: vi.fn(),
}));
describe('useTheme', () => {
    const mockSetTheme = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNextTheme).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
            systemTheme: 'light',
            themes: ['light', 'dark', 'system'],
        });
        vi.useFakeTimers();
    });

    it('initializes with isAnimating false', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.isAnimating).toBe(false);
    });

    it('toggles theme to dark and handles animation timing', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
        expect(result.current.isAnimating).toBe(true);

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.isAnimating).toBe(false);
    });

    it('toggles theme to light if currently dark', () => {
        vi.mocked(useNextTheme).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
            systemTheme: 'light',
            themes: ['light', 'dark', 'system'],
        });

        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });

        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('resolves system theme when current theme is system', () => {
        vi.mocked(useNextTheme).mockReturnValue({
            theme: 'system',
            setTheme: mockSetTheme,
            systemTheme: 'dark',
            themes: ['light', 'dark', 'system'],
        });

        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });

        // Since system is dark, it should toggle to light
        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('prevents multiple toggles while animating', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });

        expect(mockSetTheme).toHaveBeenCalledTimes(1);

        act(() => {
            result.current.toggleTheme(); // Should do nothing
        });

        expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });
});
