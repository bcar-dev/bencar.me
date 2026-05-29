import { useEffect, useRef, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

const TOGGLE_ANIMATION_MS = 500;

export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => {
            if (timerRef.current !== null) clearTimeout(timerRef.current);
        };
    }, []);

    const toggleTheme = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const currentTheme = theme === 'system' ? systemTheme : theme;
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');

        if (timerRef.current !== null) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setIsAnimating(false);
            timerRef.current = null;
        }, TOGGLE_ANIMATION_MS);
    };

    return {
        isAnimating,
        toggleTheme,
        isDark: mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')),
    };
}
