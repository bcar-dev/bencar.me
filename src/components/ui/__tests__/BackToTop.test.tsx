import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BackToTop from '../BackToTop';

describe('BackToTop', () => {
    it('renders the back to top button', () => {
        render(<BackToTop />);
        expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();
    });

    it('calls window.scrollTo when clicked', () => {
        const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

        render(<BackToTop />);
        const button = screen.getByRole('button', { name: /back to top/i });
        fireEvent.click(button);

        expect(scrollToSpy).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth',
        });
    });
});
