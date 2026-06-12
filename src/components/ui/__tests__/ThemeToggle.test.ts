import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle.vue';

describe('ThemeToggle', () => {
    beforeEach(() => {
        document.documentElement.classList.remove('dark');
        localStorage.clear();
    });

    it('renders a labelled toggle button', () => {
        const { getByRole } = render(ThemeToggle);
        expect(getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('toggles the dark class on click', async () => {
        const user = userEvent.setup();
        const { getByRole } = render(ThemeToggle);
        await user.click(getByRole('button', { name: /toggle theme/i }));
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
    });
});
