import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import BackToTop from '../BackToTop.vue';

describe('BackToTop', () => {
    it('scrolls smoothly to the top when clicked', async () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        const user = userEvent.setup();

        const { getByRole } = render(BackToTop);
        await user.click(getByRole('button', { name: /back to top/i }));

        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        vi.unstubAllGlobals();
    });
});
