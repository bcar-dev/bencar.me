import { ref, watch, onUnmounted, type Ref } from 'vue';

/**
 * Debounce a reactive source ref: the returned ref trails `source` by `delay` ms.
 */
export function useDebounce<T>(source: Ref<T>, delay: number): Ref<T> {
    const debounced = ref(source.value) as Ref<T>;
    let timer: ReturnType<typeof setTimeout> | undefined;

    watch(source, (value) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            debounced.value = value;
        }, delay);
    });

    onUnmounted(() => clearTimeout(timer));

    return debounced;
}
