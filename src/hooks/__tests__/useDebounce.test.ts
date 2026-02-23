import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
    vi.useFakeTimers();

    it('initially returns the initial value', () => {
        const { result } = renderHook(() => useDebounce('test', 500));
        expect(result.current).toBe('test');
    });

    it('updates the value only after the delay', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 },
        });

        expect(result.current).toBe('initial');

        // Change the value
        rerender({ value: 'updated', delay: 500 });
        expect(result.current).toBe('initial'); // Should still be initial

        // Advance time by 499ms
        act(() => {
            vi.advanceTimersByTime(499);
        });
        expect(result.current).toBe('initial');

        // Advance time to 500ms
        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe('updated');
    });

    it('clears the timeout on unmount', () => {
        const spy = vi.spyOn(window, 'clearTimeout');
        const { unmount } = renderHook(() => useDebounce('test', 500));
        unmount();
        expect(spy).toHaveBeenCalled();
    });
});
