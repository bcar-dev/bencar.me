import { ref, onUnmounted } from 'vue';

const TOGGLE_ANIMATION_MS = 500;

/**
 * Theme toggle state. Flips the `dark` class on <html> and persists the choice
 * to localStorage; the no-flash inline script in BaseLayout reads it on load.
 * `isAnimating` guards against re-toggling mid icon animation.
 */
export function useTheme() {
    const isAnimating = ref(false);
    let timer: ReturnType<typeof setTimeout> | undefined;

    function toggleTheme() {
        if (isAnimating.value) return;
        isAnimating.value = true;

        const isDark = document.documentElement.classList.toggle('dark');
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch {
            // ignore storage failures (private mode, etc.)
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
            isAnimating.value = false;
        }, TOGGLE_ANIMATION_MS);
    }

    onUnmounted(() => clearTimeout(timer));

    return { isAnimating, toggleTheme };
}
