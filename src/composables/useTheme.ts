/**
 * Theme toggle. Flips the `dark` class on <html> and persists the choice to
 * localStorage; the no-flash inline script in BaseLayout reads it on load.
 */
export function useTheme() {
    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch {
            // ignore storage failures (private mode, etc.)
        }
    }

    return { toggleTheme };
}
