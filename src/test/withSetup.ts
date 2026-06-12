import { createApp, type App } from 'vue';

/**
 * Run a composable inside a real component instance so lifecycle hooks
 * (onMounted/onUnmounted) work. Call `app.unmount()` to trigger cleanup.
 */
export function withSetup<T>(composable: () => T): [T, App] {
    let result!: T;
    const app = createApp({
        setup() {
            result = composable();
            return () => null;
        },
    });
    app.mount(document.createElement('div'));
    return [result, app];
}
