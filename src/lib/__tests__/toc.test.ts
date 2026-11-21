import { describe, it, expect } from 'vitest';
import { findActiveSlug } from '../toc';

const OFFSET = 100;

describe('findActiveSlug', () => {
    it('returns null when there are no headings', () => {
        expect(findActiveSlug([], OFFSET, false)).toBeNull();
    });

    it('picks the first heading before any heading reaches the offset', () => {
        const positions = [
            { slug: 'intro', top: 400 },
            { slug: 'outro', top: 900 },
        ];
        expect(findActiveSlug(positions, OFFSET, false)).toBe('intro');
    });

    it('picks the last heading that has scrolled past the offset', () => {
        const positions = [
            { slug: 'intro', top: -600 },
            { slug: 'middle', top: -50 },
            { slug: 'outro', top: 300 },
        ];
        expect(findActiveSlug(positions, OFFSET, false)).toBe('middle');
    });

    it('counts a heading sitting exactly at the offset as current', () => {
        const positions = [
            { slug: 'intro', top: -200 },
            { slug: 'outro', top: OFFSET },
        ];
        expect(findActiveSlug(positions, OFFSET, false)).toBe('outro');
    });

    it('picks the last heading at the bottom of the page even if it never reached the offset', () => {
        const positions = [
            { slug: 'intro', top: -200 },
            { slug: 'outro', top: 500 },
        ];
        expect(findActiveSlug(positions, OFFSET, true)).toBe('outro');
    });
});
