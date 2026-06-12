import { describe, it, expect } from 'vitest';
import { getHeroImage } from '../heroImages';

describe('getHeroImage', () => {
    it('returns undefined when no path is given', () => {
        expect(getHeroImage()).toBeUndefined();
        expect(getHeroImage(undefined)).toBeUndefined();
    });

    it('returns undefined for a path with no matching asset', () => {
        expect(getHeroImage('/assets/img/2026/does-not-exist/nope.png')).toBeUndefined();
    });

    it('resolves an existing frontmatter hero path to optimizable image metadata', () => {
        const img = getHeroImage('/assets/img/2026/hello-world/generated-man-coding.png');
        expect(img).toBeDefined();
        expect(typeof img?.src).toBe('string');
        expect(img?.width).toBeGreaterThan(0);
        expect(img?.height).toBeGreaterThan(0);
    });
});
