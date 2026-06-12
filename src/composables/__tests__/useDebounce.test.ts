import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useDebounce } from '../useDebounce';
import { withSetup } from '@/test/withSetup';

describe('useDebounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('returns the initial value immediately', () => {
        const source = ref('hello');
        const [debounced, app] = withSetup(() => useDebounce(source, 200));
        expect(debounced.value).toBe('hello');
        app.unmount();
    });

    it('updates only after the delay elapses', async () => {
        const source = ref('a');
        const [debounced, app] = withSetup(() => useDebounce(source, 300));

        source.value = 'b';
        await nextTick();
        expect(debounced.value).toBe('a');

        vi.advanceTimersByTime(299);
        expect(debounced.value).toBe('a');

        vi.advanceTimersByTime(1);
        expect(debounced.value).toBe('b');
        app.unmount();
    });

    it('resets the timer on rapid changes (only the last value lands)', async () => {
        const source = ref('a');
        const [debounced, app] = withSetup(() => useDebounce(source, 100));

        source.value = 'b';
        await nextTick();
        vi.advanceTimersByTime(50);
        source.value = 'c';
        await nextTick();
        vi.advanceTimersByTime(50);
        expect(debounced.value).toBe('a');
        vi.advanceTimersByTime(50);
        expect(debounced.value).toBe('c');
        app.unmount();
    });

    it('clears the timeout on unmount', async () => {
        const source = ref('a');
        const [debounced, app] = withSetup(() => useDebounce(source, 100));
        source.value = 'b';
        await nextTick();
        app.unmount();
        vi.advanceTimersByTime(100);
        expect(debounced.value).toBe('a');
    });
});
