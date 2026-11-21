import { describe, it, expect, beforeEach } from 'vitest';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
    beforeEach(() => {
        document.documentElement.classList.remove('dark');
        localStorage.clear();
    });

    it('toggles the dark class and persists the choice', () => {
        const { toggleTheme } = useTheme();
        toggleTheme();
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('toggles back to light from dark', () => {
        document.documentElement.classList.add('dark');
        const { toggleTheme } = useTheme();
        toggleTheme();
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('switches immediately on every call', () => {
        const { toggleTheme } = useTheme();
        toggleTheme();
        toggleTheme();
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
    });
});
