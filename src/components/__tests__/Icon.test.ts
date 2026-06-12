import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import Icon from '../Icon.vue';

describe('Icon.vue', () => {
    it('renders an svg for a named icon', () => {
        const { container } = render(Icon, { props: { name: 'github' } });
        expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders distinct icons by name', () => {
        const sun = render(Icon, { props: { name: 'sun' } }).container.innerHTML;
        const moon = render(Icon, { props: { name: 'moon' } }).container.innerHTML;
        expect(sun).not.toBe(moon);
    });

    it('forwards size to width and height', () => {
        const { container } = render(Icon, { props: { name: 'search', size: 20 } });
        const svg = container.querySelector('svg');
        expect(svg?.getAttribute('width')).toBe('20');
        expect(svg?.getAttribute('height')).toBe('20');
    });
});
