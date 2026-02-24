'use client';

import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
    const { isAnimating, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-disabled={isAnimating}
            className={`relative p-2 transition-colors flex items-center justify-center w-9 h-9 rounded-md overflow-hidden ${isAnimating ? 'cursor-default opacity-80' : 'cursor-pointer hover:text-accent'
                }`}
            aria-label="Toggle Theme"
        >
            <FiSun className="absolute h-[20px] w-[20px] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
            <FiMoon className="absolute h-[20px] w-[20px] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
        </button>
    );
}
