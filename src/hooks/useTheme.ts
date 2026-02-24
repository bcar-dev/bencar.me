import { useState, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (isAnimating) return;

        setIsAnimating(true);

        const currentTheme = theme === 'system' ? systemTheme : theme;
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');

        setTimeout(() => setIsAnimating(false), 500);
    };

    return {
        isAnimating,
        toggleTheme,
        // Expose current active theme safely for UI if needed
        isDark: mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')),
    };
}
