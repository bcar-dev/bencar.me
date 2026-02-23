import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

// Mock the hook
vi.mock('@/hooks/useTheme', () => ({
    useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
    const mockToggleTheme = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when not animating', () => {
        vi.mocked(useTheme).mockReturnValue({
            isAnimating: false,
            toggleTheme: mockToggleTheme,
        });

        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('calls toggleTheme on click', () => {
        vi.mocked(useTheme).mockReturnValue({
            isAnimating: false,
            toggleTheme: mockToggleTheme,
        });

        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(button);
        expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('disables interaction when animating', () => {
        vi.mocked(useTheme).mockReturnValue({
            isAnimating: true,
            toggleTheme: mockToggleTheme,
        });

        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button.className).toContain('cursor-default');
    });
});
