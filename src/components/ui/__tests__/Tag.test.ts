import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import Tag from '../Tag.vue';

describe('Tag.vue', () => {
    it('renders a # link pointing at the tag filter', () => {
        const { getByRole } = render(Tag, { props: { tag: 'cycling' } });
        const link = getByRole('link');
        expect(link).toHaveAttribute('href', '/tags?tag=cycling');
        expect(link.textContent).toBe('#cycling');
    });
});
