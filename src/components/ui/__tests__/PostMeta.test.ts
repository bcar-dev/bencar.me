import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import PostMeta from '../PostMeta.vue';

describe('PostMeta.vue', () => {
    it('renders a formatted date in a time element and the reading time', () => {
        const { container, getByText } = render(PostMeta, {
            props: { pubDatetime: '2026-02-23', readingTime: '4 min read' },
        });
        const time = container.querySelector('time');
        expect(time?.getAttribute('datetime')).toBe('2026-02-23');
        expect(time?.textContent).toContain('Feb 23, 2026');
        expect(getByText('4 min read')).toBeInTheDocument();
    });

    it('merges fallthrough classes onto the root', () => {
        const { container } = render(PostMeta, {
            props: { pubDatetime: '2026-01-01', readingTime: '1 min read' },
            attrs: { class: 'mr-1' },
        });
        expect(container.firstElementChild?.className).toContain('mr-1');
    });
});
